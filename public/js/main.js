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

  // Simpan Data
  fetch("/test", {
    method: "POST",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      crop: imageData.data
    })
  })
    .then(res => {
      return res.json();
    })
    .then(data => {
      // alert(data.text);
      console.log(data);
      var hasil = document.getElementById("hasil");
      hasil.innerHTML = data.text;
    })
    .catch(err => {
      console.log(err);
    });
}

// Capture image
var timer = null;
function take_snapshot() {
  var context = imgRGB.getContext("2d");
  context.drawImage(video, 0, 0, 128, 128);
  changeCanny();
}
function start_snapping() {
  take_snapshot();
  if (!timer) {
    timer = setInterval(take_snapshot, 3000);
  }
}
function stop_snapping() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
