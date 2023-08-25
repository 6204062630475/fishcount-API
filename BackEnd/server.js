import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
<<<<<<< Updated upstream
=======
import * as tfNode from "@tensorflow/tfjs-node";
import path from "path"; // เพิ่ม path module
import { detectImage } from "./detect.js";
>>>>>>> Stashed changes

const app = express();
const port = 3001;

app.use(cors());
const corsOptions = {
  origin: "http://127.0.0.1:5173",
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/upload", (req, res) => {
<<<<<<< Updated upstream
  const { base64String } = req.body; // ดึงค่า base64String จาก req.body
  //console.log('Base64 data from client:', base64String);

  if (base64String) {
    const imageBuffer = Buffer.from(base64String, "base64");
    const imageName = "CaptureImage.jpg"; // ชื่อไฟล์ที่ต้องการ
    fs.writeFileSync(`Image/${imageName}`, imageBuffer);
    console.log("Image saved successfully.");
    res.send("Count:  รอนับ");
=======
  const { jsonData } = req.body; // ดึงค่า base64String จาก req.body
  const dataArray = JSON.parse(jsonData);
  const base64String = [];
  for (let i = 0; i < dataArray.length; i++) {
    base64String.push(dataArray[i]);
  }
  if (base64String) {
    console.log(base64String.length);
    const imageBuffer = [];
    const inputImage = []
    const imageName = []
    for (let i = 0; i < dataArray.length; i++) {
      imageBuffer.push(Buffer.from(base64String[i], "base64"));
      inputImage.push(tfNode.node.decodeImage(imageBuffer[i]));
      imageName.push(`CaptureImage${i}.jpg`); // ชื่อไฟล์ที่ต้องการ
      fs.writeFileSync(`Image/${imageName[i]}`, imageBuffer[i]);
      console.log("Image saved successfully.");
      // เรียกใช้ detectImage จาก detect.js เพื่อนับจำนวนวัตถุที่ตรวจพบ
      // detectImage(inputImage, model, classThreshold, imageBuffer);
      // res.send("detected");
    }
    res.send("saved");
>>>>>>> Stashed changes
  } else {
    console.error("Invalid base64String.");
    res.status(400).send("Invalid base64String.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
