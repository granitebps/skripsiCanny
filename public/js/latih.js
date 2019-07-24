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
    width: 128,
    height: 128
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

// Threshold
function changeThreshold() {
  function threshold(imgGrayscale) {
    var canvasContext = imgThreshold.getContext("2d");

    var imgW = imgGrayscale.width;
    var imgH = imgGrayscale.height;
    imgThreshold.width = imgW;
    imgThreshold.height = imgH;

    canvasContext.drawImage(imgGrayscale, 0, 0);
    var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);

    var threshold = 70; // 0..255
    for (var i = 0; i < imgPixels.data.length; i += 4) {
      // 4 is for RGBA channels
      // R=G=B=R>T?255:0
      // if (imgPixels.data[i] > threshold) {
      //   var value = 255;
      // } else {
      //   var value = 0;
      // }
      // imgPixels.data[i] = value;
      imgPixels.data[i] = imgPixels.data[i + 1] = imgPixels.data[i + 2] =
        imgPixels.data[i + 1] > threshold ? 0 : 255;
    }
    var uint8 = new Uint8ClampedArray(imgPixels.data);
    var normal = Array.prototype.slice.call(uint8);
    // console.log(normal.length);
    // console.log(normal[3]);

    // Array data
    var crop = [];
    for (var k = 0; k < normal.length; k += 4) {
      crop.push(normal[k]);
      // crop[k] = normal[k];
    }
    console.log(crop.length);

    // Nama Data
    var label = document.getElementById("label").value;
    // console.log(label);

    // Simpan Data
    fetch("/add", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        label: label,
        crop: crop
      })
    })
      .then(res => {
        res.json();
      })
      .then(data => {
        // alert(data.text);
        console.log(data);
      })
      .catch(err => {
        console.log(err);
      });

    canvasContext.putImageData(
      imgPixels,
      0,
      0,
      0,
      0,
      imgPixels.width,
      imgPixels.height
    );
    return imgThreshold.toDataURL();
  }
  imgThreshold.src = threshold(imgGrayscale);
}

// Grayscale
function changeGrayscale() {
  function gray(imgRGB) {
    var canvasContext = imgGrayscale.getContext("2d");

    var imgW = imgRGB.width;
    var imgH = imgRGB.height;
    imgGrayscale.width = imgW;
    imgGrayscale.height = imgH;

    canvasContext.drawImage(imgRGB, 0, 0);
    var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);

    for (var y = 0; y < imgPixels.height; y++) {
      for (var x = 0; x < imgPixels.width; x++) {
        var i = y * 4 * imgPixels.width + x * 4;
        var avg =
          (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) /
          3;
        imgPixels.data[i] = avg;
        imgPixels.data[i + 1] = avg;
        imgPixels.data[i + 2] = avg;
      }
    }
    canvasContext.putImageData(
      imgPixels,
      0,
      0,
      0,
      0,
      imgPixels.width,
      imgPixels.height
    );
    return imgGrayscale.toDataURL();
  }
  imgGrayscale.src = gray(imgRGB);
}

// ---------------------------------------------------------------- CANNY ---------------------------------------------------------------------------

// Canny
function changeCanny() {
  // get target canvas element
  mycanvas = document.getElementById("imgRGB");
  // perform edge detection
  imageData = CannyJS.canny(mycanvas);
  // console.log(imageData.data);
  // get output canvas element
  outputcanvas = document.getElementById("outputcanvas");
  // overwrites the original canvas
  imageData.drawOn(outputcanvas);

  // Simpan Data
  // fetch("/add", {
  //   method: "POST",
  //   headers: {
  //     Accept: "application/json, text/plain, */*",
  //     "Content-Type": "application/json"
  //   },
  //   body: JSON.stringify({
  //     label: label,
  //     crop: imageData.data
  //   })
  // })
  //   .then(res => {
  //     return res.json();
  //   })
  //   .then(data => {
  //     // alert(data.text);
  //     console.log(data);
  //   })
  //   .catch(err => {
  //     console.log(err);
  //   });
}

function grayscaleCanny() {
  var canvas = document.getElementById("imgRGB");
  // construct a new GrayImageData object
  var imageData = new GrayImageData(canvas.width, canvas.height);
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
  // changeGrayscale();
  // changeThreshold();
  grayscaleCanny();
  changeCanny();
  // changeHSV();
}
function take_picture() {
  take_snapshot();
}
