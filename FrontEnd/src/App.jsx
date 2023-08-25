import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";

function App() {
  const videoRef = useRef(null);
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  // const multiCapture = () =>{
  //   setInterval(() => {
  //     console.log('Interval triggered');
  //   }, 1000);
  //   setTimeout(() => {
  //     clearInterval(intervalId);
  //     console.log("Interval has been cleared.");
  //   }, 5000);
  // }
  let intervalId;
  const [captureFrameCount, setCaptureFrameCount] = useState(false);
  const captureFrame = async () => {
    // สร้าง Promise ที่จะรอให้ setInterval เสร็จสิ้น
    const intervalPromise = new Promise((resolve) => {
      intervalId = setInterval(() => {
        console.log("captureFrame");
      }, 1000);

      // เมื่อเวลาผ่านไป 5000 ms (5 วินาที) ให้ clearInterval และ resolve Promise
      setTimeout(() => {
        clearInterval(intervalId);
        resolve(); // resolve Promise เพื่อรับรองว่า setInterval ได้เสร็จสิ้น
      }, 5000);
    });

    await intervalPromise; // รอให้ Promise ที่เราสร้างเสร็จสิ้น

    // แก้ไขเป็น async function
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    const arrImgBase64 = [];
    const base64String = canvas
      .toDataURL("image/jpeg")
      .replace("data:image/jpeg;base64,", "");
    setCaptureFrameCount(true);
    if (captureFrameCount) {
      arrImgBase64.push(base64String);
    }

    const jsonData = JSON.stringify(arrImgBase64);
    console.log("jsonData: ", jsonData);
    console.log("Number of Base64 in API: ", arrImgBase64.length);

    try {
      const response = await axios.post("http://127.0.0.1:3001/upload", {
        jsonData,
      });
      console.log("API Response:", response.data);
    } catch (error) {
      console.error("Error sending base64 to API:", error);
    }
  };
  useEffect(() => {
    startCamera();
  }, []);
  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video>
      <br />
      <button onClick={captureFrame}>Capture and Convert</button>
    </div>
  );
}

export default App;


