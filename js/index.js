const brushButton = document.getElementById("brush");
const eraserButton = document.getElementById("eraser");
const textButton = document.getElementById("text");
const shapeButtom = {};
shapeButtom["circle"] = document.getElementById("circle");
shapeButtom["rectangle"] = document.getElementById("rectangle");
shapeButtom["triangle"] = document.getElementById("triangle");
shapeButtom["line"] = document.getElementById("line");
const tools = [
  brushButton,
  eraserButton,
  textButton,
  shapeButtom["circle"],
  shapeButtom["rectangle"],
  shapeButtom["triangle"],
  shapeButtom["line"],
];
const undoButtom = document.getElementById("undo");
const redoButtom = document.getElementById("redo");
const refreshButtom = document.getElementById("refresh");
const hollow = document.getElementById("hollow");
const downloadButtom = document.getElementById("download");

const brushSizeInput = document.getElementById("brushSize");
const fontSizeInput = document.getElementById("fontSize");
const fontFamilyInput = document.getElementById("fontFamily");
const uploadInput = document.getElementById("upload");
const settingButtom = document.getElementById("settingIcon");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.lineCap = "round"; //設定畫筆端點為圓的
ctx.lineJoin = "round"; //設定畫筆轉彎處為圓的
ctx.lineWidth = 2;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let mode = "brush";
let rgbaColor = "rgba(0,0,0,1)";
let undoList = [];
let redoList = [];
let init = new Image();
init.src = canvas.toDataURL("image/png");

const saved = new Image();
saved.src = canvas.toDataURL("image/png");
let savedData = saved;

function switchToBrush() {
  mode = "brush";

  ctx.lineWidth = brushSizeInput.value;
  tools.forEach((tool) => {
    tool.classList.remove("active");
  });
  brushButton.classList.add("active");
}

function switchToEraser() {
  mode = "eraser";

  ctx.lineWidth = brushSizeInput.value * 5;
  tools.forEach((tool) => {
    tool.classList.remove("active");
  });
  eraserButton.classList.add("active");
}

function switchToText() {
  mode = "text";

  tools.forEach((tool) => {
    tool.classList.remove("active");
  });
  textButton.classList.add("active");
}

function switchToShape(type) {
  mode = type;

  ctx.lineWidth = brushSizeInput.value;
  tools.forEach((tool) => {
    tool.classList.remove("active");
  });
  shapeButtom[type].classList.add("active");
}

function setBrushSize() {
  ctx.lineWidth = brushSizeInput.value;
  if (mode === "eraser") ctx.lineWidth = brushSizeInput.value * 5;
  document.getElementById("brushSize-label").style["width"] =
    ctx.lineWidth + 3 + "px";
  document.getElementById("brushSize-label").style["height"] =
    ctx.lineWidth + 3 + "px";
}

function drawShape(x, y) {
  let w = x - lastX;
  let h = y - lastY;
  let centerX = lastX + w * 0.5;
  let centerY = lastY + h * 0.5;
  let step = 0.01;
  let a = step;
  let pi2 = Math.PI * 2 - step;

  ctx.beginPath();
  switch (mode) {
    case "circle":
      let r = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2)) * 0.5;
      let rx = r,
        ry = r;
      if (x - lastX < 0) rx *= -1;
      if (y - lastY < 0) ry *= -1;
      ctx.moveTo(centerX + rx * Math.cos(0), centerY + ry * Math.sin(0));

      /// create the ellipse
      for (; a < pi2; a += step) {
        ctx.lineTo(centerX + rx * Math.cos(a), centerY + ry * Math.sin(a));
      }
      break;
    case "rectangle":
      if (!hollow.checked) {
        ctx.fillStyle = rgbaColor;
        ctx.fillRect(lastX, lastY, w, h);
      } else ctx.strokeRect(lastX, lastY, w, h);
      break;
    case "triangle":
      ctx.moveTo(centerX, lastY);
      ctx.lineTo(lastX, y);
      ctx.lineTo(x, y);
      break;
    case "line":
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      break;
    default:
      break;
  }
  ctx.closePath();
  if (!hollow.checked) {
    ctx.fillStyle = rgbaColor;
    ctx.fill();
  }
  ctx.strokeStyle = rgbaColor;
  ctx.stroke();
}

function drawText(words, x, y) {
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  ctx.font = `${fontSizeInput.value}px ${fontFamilyInput.value}`;
  ctx.fillStyle = rgbaColor;
  ctx.fillText(words, x - 4, y - 4);
}

function handleEnter(e, input, x, y) {
  if (e.key === "Enter") {
    drawText(input.value, x, y);
    document.body.removeChild(input);
  }
}

function addTextInput(x, xOffset, y, yOffset) {
  const input = document.createElement("input");
  input.type = "textarea";
  input.style.position = "absolute";
  input.style.left = x + "px";
  input.className = "textInput";
  input.style.top = y + "px";
  input.style.border = "#000000 1px dashed";
  input.onkeydown = (event) => handleEnter(event, input, xOffset, yOffset);
  input.onmouseover = () => {
    input.focus();
  };
  document.body.appendChild(input);
}

function undo() {
  ctx.globalCompositeOperation = "source-over";

  let last;
  last = undoList.pop();

  if (last !== undefined) {
    let tmp = new Image();
    tmp.src = canvas.toDataURL("image/png");
    redoList.push(tmp);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(last, 0, 0);
  }
}

function redo() {
  ctx.globalCompositeOperation = "source-over";
  if (redoList.length === 0) return;

  let last = redoList.pop();

  if (last !== undefined) {
    let tmp = new Image();
    tmp.src = canvas.toDataURL("image/png");
    undoList.push(tmp);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(last, 0, 0);
  }
}

function refresh() {
  let result = confirm("確定要刷新嗎");
  if (result) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    undoList = [];
    redoList = [];
  }
}

function upload(ev) {
  if (ev.target.files) {
    let file = ev.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function (e) {
      var image = new Image();
      image.src = e.target.result;
      image.onload = function (ev) {
        let tmp = new Image();
        tmp.src = canvas.toDataURL("image/png");
        if (undoList.length !== 0 && undoList.slice(-1)[0].src != tmp.src)
          undoList.push(tmp);
        else if (undoList.length == 0) undoList.push(tmp);
        redoList = [];
        ctx.drawImage(
          image,
          canvas.width / 2 - image.width / 2,
          canvas.height / 2 - image.height / 2
        );
      };
    };
  }
}

function download() {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = "yourPng.png";
  link.href = dataURL;
  link.click();
}
function handleSetting(flag = true) {
  setBrushSize();
  setText();
  /* document.getElementById("color-input").checked = false; */
  if (flag)
    document.getElementById("sideMenu--active").checked =
      !document.getElementById("sideMenu--active").checked;
  else document.getElementById("sideMenu--active").checked = false;
  if (document.getElementById("sideMenu--active").checked) {
    settingButtom.style["right"] = "-40px";
    settingButtom.style["width"] = "40px";
    settingButtom.style["opacity"] = "1";
    settingButtom.style["transform"] = "rotate(180deg)";
  } else {
    settingButtom.style["right"] = "-30px";
    settingButtom.style["width"] = "30px";
    settingButtom.style["opacity"] = "0.8";
    settingButtom.style["transform"] = "rotate(0deg)";
  }

  switch (mode) {
    case "brush":
    case "line":
      document.getElementById("brushSizeDisplay").style.display = "flex ";
      document.getElementById("textDisplay").style.display = "none ";
      document.getElementById("hollowDisplay").style.display = "none ";
      document.getElementById("colorDisplay").style["display"] = "flex ";
      break;
    case "eraser":
      document.getElementById("brushSizeDisplay").style.display = "flex ";
      document.getElementById("textDisplay").style.display = "none ";
      document.getElementById("hollowDisplay").style.display = "none ";
      document.getElementById("colorDisplay").style["display"] = "none ";
      break;
    case "text":
      console.log("text");
      document.getElementById("brushSizeDisplay").style["display"] = "none ";
      document.getElementById("textDisplay").style["display"] = "flex ";
      document.getElementById("hollowDisplay").style["display"] = "none ";
      document.getElementById("colorDisplay").style["display"] = "flex ";
      break;
    case "triangle":
    case "rectangle":
    case "circle":
      document.getElementById("brushSizeDisplay").style["display"] = "flex ";
      document.getElementById("textDisplay").style["display"] = "none ";
      document.getElementById("hollowDisplay").style["display"] = "flex ";
      document.getElementById("colorDisplay").style["display"] = "flex ";
      break;
    default:
      break;
  }
}
function setText() {
  document.getElementById("text-label").style["font-size"] =
    fontSizeInput.value + "px";
  document.getElementById("text-label").style["font-family"] =
    fontFamilyInput.value;
}
function setHollow() {
  if (hollow.checked)
    document.getElementById("hollowImg").src = "./img/circle.png";
  else document.getElementById("hollowImg").src = "./img/circle_filled.png";
}
//btn and input
brushButton.addEventListener("click", switchToBrush);
eraserButton.addEventListener("click", switchToEraser);
textButton.addEventListener("click", switchToText);
Object.keys(shapeButtom).forEach((type) => {
  shapeButtom[type].addEventListener("click", () => switchToShape(type));
});

undoButtom.addEventListener("click", undo);
redoButtom.addEventListener("click", redo);
refreshButtom.addEventListener("click", refresh);
document
  .getElementById("uploadImg")
  .addEventListener("click", (event) => uploadInput.click());
uploadInput.addEventListener("change", (event) => upload(event));
downloadButtom.addEventListener("click", download);

settingButtom.addEventListener("mouseenter", handleSetting);
document.getElementById("funcBar").addEventListener("mouseleave", () => {
  handleSetting(false);
});
fontSizeInput.addEventListener("change", setText);
fontFamilyInput.addEventListener("change", setText);
brushSizeInput.addEventListener("change", setBrushSize);
hollow.addEventListener("click", setHollow);
//btn and input

canvas.addEventListener("mouseover", () => {
  let cur = mode;

  if (mode == "line") cur = "brush";
  canvas.style.cursor = `url('../img/${cur}_cur.png') 0 100, none`;

  if (
    !hollow.checked &&
    (cur == "triangle" || cur == "circle" || cur == "rectangle")
  )
    canvas.style.cursor = `url('../img/${cur}_filled_cur.png') 0 100, none`;
});

canvas.addEventListener("mousedown", (e) => {
  //save

  let tmp = new Image();
  tmp.src = canvas.toDataURL("image/png");

  if (undoList.length !== 0 && undoList.slice(-1)[0].src != tmp.src) {
    undoList.push(tmp);
  } else if (undoList.length == 0) undoList.push(tmp);
  redoList = [];

  //save

  //draw mode
  if (mode !== "eraser") ctx.globalCompositeOperation = "source-over";
  else ctx.globalCompositeOperation = "destination-out";
  //draw mode

  //remove textInput
  if (document.querySelector(".textInput") !== null)
    document.body.removeChild(document.querySelector(".textInput"));
  //remove textInput

  //drawing
  console.log(mode);
  isDrawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;

  switch (mode) {
    case "text":
      addTextInput(e.pageX, e.offsetX, e.pageY, e.offsetY);
      isDrawing = false;
      break;
    case "triangle":
    case "rectangle":
    case "circle":
    case "line":
      saveCanvas();
      break;
    default:
      break;
  }
});

canvas.addEventListener("mousemove", (e) => {
  switch (mode) {
    case "brush":
      if (isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY;
      }
      break;
    case "eraser":
      if (isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
        lastX = e.offsetX;
        lastY = e.offsetY;
      }
      break;

    case "triangle":
    case "rectangle":
    case "circle":
    case "line":
      if (isDrawing) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        restore();
        drawShape(e.offsetX, e.offsetY);
      }
      break;
    default:
      break;
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

//color Selector
var colorBlock = document.getElementById("color-block");
var ctx1 = colorBlock.getContext("2d");
var width1 = colorBlock.width;
var height1 = colorBlock.height;

var colorStrip = document.getElementById("color-strip");
var colorInd = document.getElementById("color-indicator");
var ctx2 = colorStrip.getContext("2d");
var width2 = colorStrip.width;
var height2 = colorStrip.height;
const rgbSet = { r: 0, g: 0, b: 0 };
var colorLabel = document.getElementById("color-label");

var x = 0;
var y = 0;
var drag = false;

ctx1.rect(0, 0, width1, height1);
fillGradient();

ctx2.rect(0, 0, width2, height2);
var grdl = ctx2.createLinearGradient(0, 0, 0, height1);
grdl.addColorStop(0, "rgba(255, 0, 0, 1)");
grdl.addColorStop(0.14, "rgba(255, 255, 0, 1)");
grdl.addColorStop(0.35, "rgba(0, 255, 0, 1)");
grdl.addColorStop(0.53, "rgba(0, 255, 255, 1)");
grdl.addColorStop(0.66, "rgba(0, 0, 255, 1)");
grdl.addColorStop(0.85, "rgba(255, 0, 255, 1)");
grdl.addColorStop(1, "rgba(255, 0, 0, 1)");
ctx2.fillStyle = grdl;
ctx2.fill();

function click(e) {
  x = e.offsetX;
  y = e.offsetY;
  var imageData = ctx2.getImageData(x, y, 1, 1).data;
  rgbaColor =
    "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ",1)";
  fillGradient();
  rgbSet.r = parseInt(imageData[0], 10);
  rgbSet.g = parseInt(imageData[1], 10);
  rgbSet.b = parseInt(imageData[2], 10);
  colorInd.style.setProperty("top", y + 6 + "px");
  colorLabel.style.backgroundColor = rgbaColor;
  ctx.strokeStyle = rgbaColor;
  canvas.style["border-image"] = `linear-gradient(
       
    rgb(247, 247, 246), 
    ${rgbaColor}
  ) 1`;
}

function fillGradient() {
  ctx1.fillStyle = rgbaColor;
  ctx1.fillRect(0, 0, width1, height1);

  var grdWhite = ctx2.createLinearGradient(0, 0, width1, 0);
  grdWhite.addColorStop(0, "rgba(255,255,255,1)");
  grdWhite.addColorStop(1, "rgba(255,255,255,0)");
  ctx1.fillStyle = grdWhite;
  ctx1.fillRect(0, 0, width1, height1);

  var grdBlack = ctx2.createLinearGradient(0, 0, 0, height1);
  grdBlack.addColorStop(0, "rgba(0,0,0,0)");
  grdBlack.addColorStop(1, "rgba(0,0,0,1)");
  ctx1.fillStyle = grdBlack;
  ctx1.fillRect(0, 0, width1, height1);
}

function mouseDown(e) {
  drag = true;
  changeColor(e);
}

function mouseMove(e) {
  if (drag) {
    changeColor(e);
  }
}

function mouseUp(e) {
  drag = false;
}

function changeColor(e) {
  x = e.offsetX;
  y = e.offsetY;
  var imageData = ctx1.getImageData(x, y, 1, 1).data;
  rgbaColor =
    "rgba(" + imageData[0] + "," + imageData[1] + "," + imageData[2] + ",1)";
  rgbSet.r = parseInt(imageData[0], 10);
  rgbSet.g = parseInt(imageData[1], 10);
  rgbSet.b = parseInt(imageData[2], 10);
  colorLabel.style.backgroundColor = rgbaColor;
  ctx.strokeStyle = rgbaColor;
  canvas.style["border-image"] = `linear-gradient(
       
    rgb(247, 247, 246), 
    ${rgbaColor}
  ) 1`;
}

colorStrip.addEventListener("click", click, false);

colorBlock.addEventListener("mousedown", mouseDown, false);
colorBlock.addEventListener("mouseup", mouseUp, false);
colorBlock.addEventListener("mousemove", mouseMove, false);

document.getElementById("color-picker").addEventListener("mouseleave", () => {
  document.getElementById("color-input").checked = false;
});

/** 儲存畫布 */
const saveCanvas = () => {
  const saved = new Image();
  saved.src = canvas.toDataURL("image/png");
  savedData = saved;
};

/** 還原畫布 */
const restore = () => {
  ctx.drawImage(savedData, 0, 0);
};

/* bgCanvas */
const bgCan = document.getElementById("bgCanvas");
const bgCtx = bgCan.getContext("2d");
bgCan.width = window.innerWidth;
bgCan.height = window.innerHeight;
const particlesArr = [];

window.addEventListener("resize", () => {
  bgCan.width = window.innerWidth;
  bgCan.height = window.innerHeight;
});

const mouse = { x: undefined, y: undefined };
const prev_mouse = { x: undefined, y: undefined };

document.addEventListener("mousemove", (e) => {
  prev_mouse.x = mouse.x;
  prev_mouse.y = mouse.y;
  mouse.x = e.x;
  mouse.y = e.y;
  particlesArr.push(new Particle(true));
});

class Particle {
  constructor(isMouse) {
    if (isMouse) {
      this.x = mouse.x;
      this.y = mouse.y;
    } else {
      this.x = Math.random() * bgCan.width;
      this.y = Math.random() * bgCan.height;
    }

    this.colorRange = Math.random() * 100 - 50;
    if (Math.random() > 0.2) this.hollow = true;
    else this.hollow = false;

    /* this.x = Math.random() * bgCan.width;
    this.y = Math.random() * bgCan.height; */

    if (isMouse) this.size = Math.random() * 15 + 1;
    else this.size = Math.random() * 30 + 1;
    if (Math.random() > 0.6 && isMouse) {
      this.speedX = Math.random() * 3 - 1.5;
      this.speedY = Math.random() * 3 - 1.5;
    } else {
      this.speedX = Math.random() * 1 - 0.5;
      this.speedY = Math.random() * 1 - 0.5;
    }
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.size >= 0.2) {
      if (this.hollow) this.size -= 0.05;
      else this.size -= 0.1;
    }
  }
  draw() {
    bgCtx.fillStyle = `rgba(${rgbSet.r + this.colorRange},${
      rgbSet.g + this.colorRange
    },
      ${rgbSet.b + this.colorRange},1)`;
    bgCtx.strokeStyle = `rgba(${rgbSet.r + this.colorRange},${
      rgbSet.g + this.colorRange
    },
      ${rgbSet.b + this.colorRange},1)`;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    if (this.hollow) bgCtx.stroke();
    else bgCtx.fill();
  }
}
function initParticle() {
  for (let i = 0; i < 150; i++) {
    particlesArr.push(new Particle(false));
  }
}
initParticle();
function handleParticle() {
  particlesArr.forEach((par, idx) => {
    par.update();
    par.draw();
    if (par.size < 0.2) {
      particlesArr.splice(idx, 1);
      if (particlesArr.length < 150) particlesArr.push(new Particle(false));
    }
  });
}

function animate() {
  bgCtx.clearRect(0, 0, bgCan.width, bgCan.height);
  handleParticle();
  requestAnimationFrame(animate);
}
animate();
