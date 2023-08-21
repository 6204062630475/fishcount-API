import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";

const app = express();
const port = 3001;

app.use(cors());
const corsOptions = {
  origin: "http://127.0.0.1:5173",
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/upload", (req, res) => {
  const { base64String } = req.body; // ดึงค่า base64String จาก req.body
  //console.log('Base64 data from client:', base64String);

  if (base64String) {
    const imageBuffer = Buffer.from(base64String, "base64");
    const imageName = "CaptureImage.jpg"; // ชื่อไฟล์ที่ต้องการ
    fs.writeFileSync(`Image/${imageName}`, imageBuffer);
    console.log("Image saved successfully.");
    res.send("Count: รอนับ");
  } else {
    console.error("Invalid base64String.");
    res.status(400).send("Invalid base64String.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
