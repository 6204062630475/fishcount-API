import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import * as tf from "@tensorflow/tfjs";
import path from "path"; // เพิ่ม path module

const app = express();
const port = 3001;

// โมเดลที่ใช้ในการตรวจจับวัตถุ
const model = {
  net: null,
  inputShape: [1, 0, 0, 3],
};
const classThreshold = 0.7;

async function loadModel() {
  await tf.ready();

  const modelName = "fishtrainIV0.89_web_model";
  const modelUrl = `http://127.0.0.1:3001/${modelName}/model.json`; // URL ของโมเดลบนเว็บเซิร์ฟเวอร์ BackEnd\public\fishtrainIV0.89_web_model

  const yolov5 = await tf.loadGraphModel(modelUrl); // โหลดโมเดลจาก URL
  console.log("warming up model")
  // warming up model
  const dummyInput = tf.ones(yolov5.inputs[0].shape);
  const warmupResult = await yolov5.executeAsync(dummyInput);
  tf.dispose(warmupResult); // cleanup memory
  tf.dispose(dummyInput); // cleanup memory

  model.net = yolov5;
  model.inputShape = yolov5.inputs[0].shape;
  console.log("Model loaded");
}
// cors เพื่ออนุญาติการเข้าถึงapi
app.use(cors());
const corsOptions = {
  origin: "http://127.0.0.1:5173",
};
app.use(cors(corsOptions));

// bodyParser limitปริมาณข้อมูลที่ส่งผ่านapi
app.use(bodyParser.json({ limit: "10mb" }));

// Middleware เพื่อให้ Express เข้าถึงไฟล์ในโฟลเดอร์ public
const __dirname = path.resolve(); // เพิ่มบรรทัดนี้
app.use(express.static(path.join(__dirname, "public")));

app.post("/upload", async (req, res) => {
  await loadModel();
  const { base64String } = req.body; // ดึงค่า base64String จาก req.body
  //console.log('Base64 data from client:', base64String);

  if (base64String) {
    const imageBuffer = Buffer.from(base64String, "base64");
    const imageName = "CaptureImage.jpg"; // ชื่อไฟล์ที่ต้องการ
    fs.writeFileSync(`Image/${imageName}`, imageBuffer);
    console.log("Image saved successfully.");
    res.send("Count:  รอนับ");
  } else {
    console.error("Invalid base64String.");
    res.status(400).send("Invalid base64String.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
