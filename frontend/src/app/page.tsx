'use client';
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // 카메라 장치 목록 가져오기
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('카메라 장치 목록을 가져오는데 실패했습니다:', error);
      }
    };
    getDevices();
  }, []);

  const startPredict = async () => {
    try {
      // 기존 스트림이 있다면 정지
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }

      // 새로운 스트림 시작
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDevice ? { exact: selectedDevice } : undefined
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('카메라 접근 권한을 얻는데 실패했습니다:', error);
      setIsStreaming(false);
    }
  };

  return (
    <div className="grid grid-rows-[auto_1fr_auto] gap-4 items-center justify-items-center min-h-screen p-8">
      <div className="space-y-4">
        <select 
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="border p-2 rounded"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>

        <button 
          onClick={startPredict}
          className="block px-4 py-2 bg-blue-500 text-white rounded"
        >
          Predict Start
        </button>
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="max-w-full h-auto"
      />
    </div>
  );
}
