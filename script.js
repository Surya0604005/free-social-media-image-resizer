const upload = document.getElementById("upload");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const buttons = document.querySelectorAll(".card button");
const downloadBtn = document.getElementById("download");
const selectedText = document.getElementById("selectedText");

const bgColorInput = document.getElementById("bgColor");
const blurRange = document.getElementById("blurRange");
const stretchToggle = document.getElementById("stretchToggle");

const spaceControl = document.getElementById("spaceControl");
const blurControl = document.getElementById("blurControl");
const fillControl = document.getElementById("fillControl");

let img = new Image();
let activeMode = "fit";
let activePreset = null;

/* PREVIEW ON UPLOAD */
upload.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    buttons.forEach(b => b.classList.remove("active"));
    activePreset = null;
    selectedText.textContent = "Image uploaded. Select a platform preset.";
  };

  img.src = URL.createObjectURL(file);
};

/* MODE CHANGE */
document.querySelectorAll("input[name='mode']").forEach(radio => {
  radio.onchange = e => {
    activeMode = e.target.value;

    fillControl.style.display  = activeMode === "fill"  ? "block" : "none";
    spaceControl.style.display = activeMode === "space" ? "block" : "none";
    blurControl.style.display  = activeMode === "blur"  ? "block" : "none";

    if (activePreset) applyPreset();
  };
});

/* PRESET BUTTON */
buttons.forEach(btn => {
  btn.onclick = () => {
    if (!img.src) return alert("Upload image first");

    buttons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    activePreset = {
      w: parseFloat(btn.dataset.w),
      h: parseFloat(btn.dataset.h),
      name: btn.dataset.name
    };

    applyPreset();
    canvas.scrollIntoView({ behavior: "smooth", block: "center" });
  };
});

/* EXTRA CONTROLS */
bgColorInput.oninput =
blurRange.oninput =
stretchToggle.onchange = () => {
  if (activePreset) applyPreset();
};

/* APPLY PRESET */
function applyPreset() {
  const ratio = activePreset.w / activePreset.h;
  canvas.width = 800;
  canvas.height = Math.round(800 / ratio);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activeMode === "fit") {
    drawContain();
  }
  else if (activeMode === "fill") {
    if (stretchToggle.checked) {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } else {
      drawCover();
    }
  }
  else if (activeMode === "space") {
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawContain();
  }
  else if (activeMode === "blur") {
    ctx.filter = `blur(${blurRange.value}px)`;
    drawCover();
    ctx.filter = "none";
    drawContain();
  }

  selectedText.textContent =
    `${activePreset.name} → ${activeMode.toUpperCase()}`;
}

/* HELPERS */
function drawContain() {
  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img,
    (canvas.width - w) / 2,
    (canvas.height - h) / 2,
    w, h);
}

function drawCover() {
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img,
    (canvas.width - w) / 2,
    (canvas.height - h) / 2,
    w, h);
}

/* DOWNLOAD */
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.download = "image.png";
  a.href = canvas.toDataURL("image/png");
  a.click();
};

/*install button logic*/

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.style.display = "none";
});

