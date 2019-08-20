const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const brain = require("brain.js");
const mysql = require("mysql");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", path.join(__dirname, "public/views"));
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Create connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "skripsi"
});

// Connect
db.connect(err => {
  if (err) {
    throw err;
  }
  console.log("MySql Connected...");
});

// Halaman Utama
app.get("/", (req, res) => {
  res.render("index.html");
});

// Halaman Data Uji
app.get("/uji", (req, res) => {
  let sql = "SELECT * FROM data";
  let query = db.query(sql, (err, results) => {
    if (err) throw err;
    var db_label = [];
    var db_data = [];
    var trainingData = [];
    var data_array = [];
    for (var l = 0; l < results.length; l++) {
      db_label.push(results[l].label);
      db_data.push(results[l].data);

      // Convert string to array
      data_array.push(db_data[l].split(",").map(Number));

      var output_label = db_label[l];
      var output_array = {};
      output_array[output_label] = 1;
      // console.log(output_array);

      trainingData.push({
        input: data_array[l],
        output: output_array
      });
    }

    // Train Data
    // const net = new brain.NeuralNetwork({
    //   activation: "sigmoid",
    //   hiddenLayers: [10]
    // });
    // const stats = net.train(trainingData, {
    //   log: error => console.log(error),
    //   logPeriod: 100,
    //   learningRate: 0.3,
    //   errorThresh: 0.01,
    //   iterations: 1000
    // });
    // // console.log(stats);
    // // console.log("Train completed");
    // var train = net.toJSON();
    // // console.log("train", net);
    // require("fs").writeFile(
    //   "./public/train.json",

    //   JSON.stringify(train),

    //   function(err) {
    //     if (err) {
    //       console.error("Crap happens");
    //     }
    //   }
    // );
  });
  res.render("uji.html", { done: true });
});

// Halaman Data Latih
app.get("/tambah", (req, res) => {
  res.render("add.html");
  // res.send("test");
});

// Tambah Data Latih
app.post("/add", (req, res) => {
  var label = req.body.label;
  var data = req.body.crop;
  // console.log(data.length);

  // Mengubah array 2d menjadi 1d
  var newArr = [];
  for (var i = 0; i < data.length; i++) {
    newArr = newArr.concat(data[i]);
  }

  // Mengubah nilai 255 menjadi 1
  var biner = [];
  for (var k = 0; k < newArr.length; k++) {
    if (newArr[k] == 255) {
      biner[k] = 1;
    } else {
      biner[k] = 0;
    }
  }

  // Convert array to string
  var sample = biner.toString();

  let post = { label: label, data: sample };
  let sql = "INSERT INTO data SET ?";
  let query = db.query(sql, post, (err, result) => {
    if (err) throw err;
    hasil = {
      text: "Data Berhasil Ditambah"
    };
    return res.send(hasil);
  });
});

// Proses uji
app.post("/test", (req, res) => {
  // console.log(req.body);

  // let sql = "SELECT * FROM data";
  // let query = db.query(sql, (err, results) => {
  //   if (err) throw err;
  //   var db_label = [];
  //   var db_data = [];
  //   var trainingData = [];
  //   var data_array = [];
  //   for (var l = 0; l < results.length; l++) {
  //     db_label.push(results[l].label);
  //     db_data.push(results[l].data);

  //     // Convert string to array
  //     data_array.push(db_data[l].split(",").map(Number));

  //     var output_label = db_label[l];
  //     var output_array = {};
  //     output_array[output_label] = 1;
  //     // console.log(output_array);

  //     trainingData.push({
  //       input: data_array[l],
  //       output: output_array
  //     });
  //   }
  // console.log(trainingData);
  // var trainingData = require("./public/my.json");

  // var db_length = results.length;
  var uji = req.body.crop;

  // Mengubah array 2d menjadi 1d
  var data = [];
  for (var i = 0; i < uji.length; i++) {
    data = data.concat(uji[i]);
  }

  // const net = new brain.NeuralNetwork({
  //   activation: "sigmoid",
  //   hiddenLayers: [10]
  // });
  // const stats = net.train(trainingData, {
  //   log: error => console.log(error),
  //   logPeriod: 100,
  //   learningRate: 0.3,
  //   errorThresh: 0.01,
  //   iterations: 1000
  // });
  // // console.log("train", net);
  // require("fs").writeFile(
  //   "./public/train.json",

  //   JSON.stringify(net),

  //   function(err) {
  //     if (err) {
  //       console.error("Crap happens");
  //     }
  //   }
  // );

  // Get train json
  // var train = require("./public/train.json");
  const fs = require("fs");
  var train = JSON.parse(fs.readFileSync("./public/train.json", "utf8"));

  const net = new brain.NeuralNetwork();
  net.fromJSON(train);
  // console.log(net);

  // console.log("train", net);
  const output = net.run(data);

  // Hasil training (objek)
  console.log(output);

  // Mencari objek dengan nilai tertinggi
  function getKeysWithHighestValue(o, n) {
    var keys = Object.keys(o);
    keys.sort(function(a, b) {
      return o[b] - o[a];
    });
    return keys.slice(0, n);
  }
  var hasil = getKeysWithHighestValue(output, 1);
  if (output[hasil] <= 0.7) {
    bahasa = "Tidak Diketahui";
  } else {
    bahasa = hasil;
  }

  var isyarat = hasil.toString();
  var bahasaIsyarat = isyarat.replace(/[0-9]/g, "");

  // console.log("object", hasil.toString());

  result = {
    text: bahasaIsyarat
  };
  // console.log(result);
  // return JSON.stringify(result);
  // res.json(result);
  return res.send(result);
  // });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
