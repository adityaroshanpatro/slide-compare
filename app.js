const pdfjsLib = window.pdfjsLib;
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const syncBox = document.getElementById("sync");
const sides = {};

document.querySelectorAll(".pane").forEach((pane) => {
  const side = pane.dataset.side;
  const s = {
    side,
    doc: null,
    page: 1,
    total: 0,
    task: null,
    pane,
    input: pane.querySelector("input[type=file]"),
    name: pane.querySelector(".name"),
    empty: pane.querySelector(".empty"),
    canvas: pane.querySelector("canvas"),
    viewer: pane.querySelector(".viewer"),
    counter: pane.querySelector(".counter"),
    prev: pane.querySelector(".prev"),
    next: pane.querySelector(".next"),
  };

  s.input.addEventListener("change", (e) => loadFile(s, e.target.files[0]));
  s.prev.addEventListener("click", () => goTo(s, s.page - 1));
  s.next.addEventListener("click", () => goTo(s, s.page + 1));
  sides[side] = s;
});

async function loadFile(s, file) {
  if (!file) return;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) {
    alert("Please choose a PDF. In PowerPoint use File > Export > PDF.");
    s.input.value = "";
    return;
  }

  s.name.textContent = file.name;
  s.name.title = file.name;
  s.empty.textContent = "Loading…";

  try {
    const data = await file.arrayBuffer();
    s.doc = await pdfjsLib.getDocument({ data }).promise;
    s.total = s.doc.numPages;
    s.page = 1;
    s.empty.hidden = true;
    s.canvas.hidden = false;
    await render(s);
  } catch (err) {
    console.error(err);
    s.doc = null;
    s.empty.hidden = false;
    s.empty.textContent = "Could not read this PDF.";
    s.canvas.hidden = true;
  }
}

function goTo(s, n, propagate = true) {
  if (!s.doc) return;
  n = Math.min(Math.max(1, n), s.total);
  s.page = n;
  render(s);

  if (propagate && syncBox.checked) {
    const other = sides[s.side === "left" ? "right" : "left"];
    if (other.doc) goTo(other, n, false);
  }
}

async function render(s) {
  if (!s.doc) return;
  const page = await s.doc.getPage(s.page);

  if (s.task) s.task.cancel();

  const dpr = window.devicePixelRatio || 1;
  const base = page.getViewport({ scale: 1 });
  const availW = s.viewer.clientWidth - 24;
  const availH = s.viewer.clientHeight - 24;
  const cssScale = Math.min(availW / base.width, availH / base.height);
  const vp = page.getViewport({ scale: cssScale * dpr });

  s.canvas.width = Math.floor(vp.width);
  s.canvas.height = Math.floor(vp.height);
  s.canvas.style.width = `${vp.width / dpr}px`;
  s.canvas.style.height = `${vp.height / dpr}px`;

  s.task = page.render({ canvasContext: s.canvas.getContext("2d"), viewport: vp });
  try {
    await s.task.promise;
  } catch (err) {
    if (err?.name !== "RenderingCancelledException") console.error(err);
  }

  s.counter.textContent = `${s.page} / ${s.total}`;
  s.prev.disabled = s.page <= 1;
  s.next.disabled = s.page >= s.total;
}

// Keyboard navigation: both panes move together when sync is on
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" && e.target.type !== "checkbox") return;
  const anyLoaded = Object.values(sides).some((s) => s.doc);
  if (!anyLoaded) return;

  const driver = Object.values(sides).find((s) => s.doc);
  if (e.key === "ArrowRight" || e.key === "PageDown") {
    goTo(driver, driver.page + 1);
  } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
    goTo(driver, driver.page - 1);
  } else {
    return;
  }
  e.preventDefault();
});

// Re-fit both canvases when the window changes size
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    Object.values(sides).forEach((s) => s.doc && render(s));
  }, 150);
});
