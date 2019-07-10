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
    width: 640,
    height: 480
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

// HSV
function changeHSV() {
  function hsv(imgRGB) {
    var canvasContext = imgHSV.getContext("2d");
    var canvasContextRGB = imgRGB.getContext("2d");

    var imgW = imgRGB.width;
    var imgH = imgRGB.height;
    imgHSV.width = imgW;
    imgHSV.height = imgH;

    canvasContext.drawImage(imgRGB, 0, 0);
    var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
    var imgPixelsRGB = canvasContextRGB.getImageData(0, 0, imgW, imgH);

    // console.log(imgPixels.data);
    // Put Code Here
    var src = imgPixelsRGB.data,
      dst = imgPixels.data,
      len = dst.length,
      i = 0,
      j = 0,
      r,
      g,
      b,
      h,
      s,
      v,
      value;

    for (; i < len; i += 4) {
      r = src[i];
      g = src[i + 1];
      b = src[i + 2];

      v = Math.max(r, g, b);
      s = v === 0 ? 0 : (255 * (v - Math.min(r, g, b))) / v;
      h = 0;

      if (0 !== s) {
        if (v === r) {
          h = (30 * (g - b)) / s;
        } else if (v === g) {
          h = 60 + (b - r) / s;
        } else {
          h = 120 + (r - g) / s;
        }
        if (h < 0) {
          h += 360;
        }
      }

      value = 0;

      if (v >= 15 && v <= 250) {
        if (h >= 3 && h <= 33) {
          value = 255;
        }
      }

      dst[j++] = value;
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
    return imgHSV.toDataURL();
  }
  imgHSV.src = hsv(imgRGB);
}

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
    console.log(normal.length);
    console.log(normal[3]);

    var crop = [];
    for (var k = 0; k < normal.length; k += 4) {
      crop.push(normal[k]);
      // crop[k] = normal[k];
    }
    console.log(crop);

    // var label = document.getElementById("label").value;
    // console.log(label);

    fetch("/test", {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        crop: crop
      })
    })
      .then(res => {
        return res.json();
        console.log(res);
      })
      .then(data => {
        var hasil = document.getElementById("hasil");
        hasil.innerHTML = data.text;
        console.log(data.text);
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

// Capture image
var timer = null;
function take_snapshot() {
  var context = imgRGB.getContext("2d");
  context.drawImage(video, 0, 0, 80, 60);
  changeGrayscale();
  changeThreshold();
  // changeHSV();
}
function start_snapping() {
  take_snapshot();
  // if (!timer) {
  //   timer = setInterval(take_snapshot, 3000);
  // }
}
function stop_snapping() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}
