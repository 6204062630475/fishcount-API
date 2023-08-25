import { useEffect, useRef } from "react";
import "./App.css";
import axios from 'axios'; // ใช้ import แบบใหม่ 

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
  const captureFrame = async () => {
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
    arrImgBase64.push(base64String)
    arrImgBase64.push(base64String)
    arrImgBase64.push(base64String)
    arrImgBase64.push(base64String)
    arrImgBase64.push(base64String)
    const jsonData = JSON.stringify(arrImgBase64);
    console.log("jsonData: ",jsonData)
    console.log("Request length API: ",arrImgBase64.length)

    try {
      const response = await axios.post('http://127.0.0.1:3001/upload', {
        jsonData
      });
      console.log('API Response:', response.data);
    } catch (error) {
      console.error('Error sending base64 to API:', error);
    }
  };
  useEffect(() => {
    startCamera();
  }, []);
  return (
    <div>
      <video ref={videoRef} autoPlay playsInline></video><br />
      <button onClick={captureFrame}>
        Capture and Convert
      </button>
    </div>
  );
}

export default App;
