("use strict");

const video = document.getElementById("video");
const imgRGB = document.getElementById("imgRGB");
const imgGrayscale = document.getElementById("imgGrayscale");
const imgThreshold = document.getElementById("imgThreshold");
const imgHSV = document.getElementById("imgHSV");
const snap = document.getElementById("snap");
const errorMsgElement = document.getElementById("span#ErrorMsg");

const constraint = {
  video: {
    width: 512,
    height: 512
  }
};

// Access webcam
async function init() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraint);
    handleSuccess(stream);
  } catch (e) {
    errorMsgElement.innerHTML = `navigator.getUserMedia.error:${e.toString()}`;
  }
}

// Success
function handleSuccess(stream) {
  window.stream = stream;
  video.srcObject = stream;
}
// Load init
init();

// ---------------------------------------------------------------- CANNY ---------------------------------------------------------------------------

// Canny
function changeCanny() {
  // get target canvas element
  mycanvas = document.getElementById("imgRGB");
  // perform edge detection
  imageData = CannyJS.canny(mycanvas);
  // console.log("canny", imageData);
  // console.log(imageData.data);
  // get output canvas element
  outputcanvas = document.getElementById("outputcanvas");
  // overwrites the original canvas
  imageData.drawOn(outputcanvas);

  let label = document.getElementById("label").value;

  // Simpan Data
  fetch("/add", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      label: label,
      crop: imageData.data
    })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      // alert(data.text);
      console.log(data);
      Swal.fire("Berhasil!", data.text, "success");
      document.getElementById("label").value = "";
    })
    .catch(err => {
      console.log(err);
    });
}

function grayscaleCanny() {
  var canvas = document.getElementById("imgRGB");
  // construct a new GrayImageData object
  var imageData = new GrayImageData(canvas.width, canvas.height);
  // console.log("grayscale", imageData);
  // load image data from canvas
  // console.log(imageData.data);
  var grayscaleCanvas = document.getElementById("imgGrayscale");
  imageData.loadCanvas(canvas);
  // console.log(imageData);
  imageData.drawOn(grayscaleCanvas);
}

// Capture image
function take_snapshot() {
  var context = imgRGB.getContext("2d");
  context.drawImage(video, 0, 0, 128, 128);
  var rgb = context.getImageData(0, 0, 128, 128);
  // console.log("rgb", rgb);
  grayscaleCanny();
  changeCanny();
}
function take_picture() {
  take_snapshot();
}
