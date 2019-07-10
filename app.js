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

// Halaman Data Uji
app.get("/", (req, res) => {
  res.render("index.html");
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
  // Convert array to string
  var sample = data.toString();
  // console.log(sample);
  // console.log(sample2);
  // console.log(req.body.label);
  // console.log(req.body.crop);
  let post = { label: label, data: sample };
  let sql = "INSERT INTO data SET ?";
  let query = db.query(sql, post, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Post 1 added...");
  });
  result = {
    text: "Data Berhasil Ditambah"
  };
  return res.send(result);
});

app.post("/test", (req, res) => {
  // console.log(req.body);

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
    // console.log(trainingData);

    var db_length = results.length;
    var data = req.body.crop;

    const net = new brain.NeuralNetwork({
      learningRate: 0.3,
      activation: "sigmoid",
      hiddenLayers: [10]
    });
    const stats = net.train(trainingData, {
      log: error => console.log(error),
      logPeriod: 100
    });
    console.log(stats);
    console.log("Train completed");
    const output = net.run(data);
    var hasil;
    if (output.Saya >= 0.8) {
      hasil = "Saya";
    } else if (output.Lambang >= 0.8) {
      hasil = "Lambang";
    } else if (output.Horizontal >= 0.8) {
      hasil = "Horizontal";
    } else {
      hasil = "Hasil Tidak Diketahui";
    }
    console.log(output);
    result = {
      text: hasil
    };
    // console.log(result);
    // return JSON.stringify(result);
    // res.json(result);
    return res.send(result);
  });
  // console.log(data);
  // console.log(data.crop.length);

  // var trainingData = [
  //   {
  //     input: data,
  //     output: "A"
  //   }
  // ];
  // var tes = [];
  // for (var z = 0; z < 10000; z++) {
  //   var n = Math.floor(Math.random() * Math.floor(2));
  //   tes.push(n);
  // }
  // console.log(tes);
  // console.log(tes.length);
  // const trainingData = [
  //   {
  //     input: data,
  //     output: [0]
  //   }
  // ];
  // [
  //   { input: { r: 0.03, g: 0.7, b: 0.5 }, output: { black: 1 } },
  //   { input: { r: 0.16, g: 0.09, b: 0.2 }, output: { white: 1 } },
  //   { input: { r: 0.5, g: 0.5, b: 1.0 }, output: { white: 1 } }
  // ];
});

app.listen(3000, () => {
  console.log(`Server started at port 3000`);
});
