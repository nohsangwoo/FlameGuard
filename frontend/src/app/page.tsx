'use client';
import { useState, useRef, useEffect } from "react";
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<OscillatorNode | null>(null);

  // get camera devices
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
        console.error('failed to get camera devices:', error);
      }
    };
    getDevices();
  }, []);

  // capture video frame and convert to Blob
  const captureFrame = async (videoElement: HTMLVideoElement): Promise<Blob | null> => {
    try {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.log('video size is invalid');
        return null;
      }

      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.drawImage(videoElement, 0, 0);

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob || null);
        }, 'image/jpeg');
      });
    } catch (error) {
      console.error('frame capture error:', error);
      return null;
    }
  };

  // send image to server
  const sendFrameToServer = async () => {
    try {
      if (!videoRef.current || !isStreaming) {
        console.log('video is not playing');
        return null;
      }

      const blob = await captureFrame(videoRef.current);
      if (!blob) {
        console.log('frame capture failed');
        return null;
      }

      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');

      console.log('sending request to server...');
      const response = await fetch('http://localhost:8000/predict_fire', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('server response:', data);
      return data;
    } catch (error) {
      console.error('server request error:', error);
      return null;
    }
  };

  // polling with TanStack Query
  const { data: predictionData } = useQuery({
    queryKey: ['fireDetection'],
    queryFn: sendFrameToServer,
    enabled: isPolling && isStreaming,
    refetchInterval: 5000,
    retry: false,
  });


  // 오디오 컨텍스트 초기화 함수
  const initAudioContext = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();

        // iOS Safari를 위한 처리
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        setAudioPermission(true);
      }
    } catch (error) {
      console.error("오디오 초기화 오류:", error);
      alert("오디오 기능 초기화에 실패했습니다.");
    }
  };



  
    // 알람 중지
    const stopAlertSound = () => {
      if (sourceNodeRef.current) {
          sourceNodeRef.current.stop();
          sourceNodeRef.current.disconnect();
      }
      if (gainNodeRef.current) {
          gainNodeRef.current.disconnect();
      }
  };


  // 공습경보 사운드 생성 및 재생
  const playAlertSound = () => {
    if (!audioContextRef.current) return;
    stopAlertSound();

    const oscillator = audioContextRef.current.createOscillator();
    gainNodeRef.current = audioContextRef.current.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);

    // 주파수 변조
    oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
    oscillator.frequency.linearRampToValueAtTime(880, audioContextRef.current.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(440, audioContextRef.current.currentTime + 1);

    // 볼륨 조절
    gainNodeRef.current.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);

    oscillator.connect(gainNodeRef.current);
    gainNodeRef.current.connect(audioContextRef.current.destination);

    oscillator.start();
    sourceNodeRef.current = oscillator; // OscillatorNode로 할당
  };

  // 화재 감지 시 알림 및 효과
  useEffect(() => {
    if (predictionData?.message === "fire detected") {
      alert("화재가 감지되었습니다!");
      playAlertSound();
      // 테두리 반짝임 효과 추가
      const alertElement = document.createElement('div');
      alertElement.textContent = "화재 감지!";
      alertElement.style.position = 'fixed';
      alertElement.style.bottom = '20px';
      alertElement.style.right = '20px';
      alertElement.style.padding = '10px';
      alertElement.style.backgroundColor = 'red';
      alertElement.style.color = 'white';
      alertElement.style.border = '2px solid red';
      alertElement.style.animation = 'blink 1s infinite';
      document.body.appendChild(alertElement);

      return () => {
        document.body.removeChild(alertElement);
      };
    }
  }, [predictionData]);

  const startPredict = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevice },
      });
      initAudioContext();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play(); // wait for video playing
        setIsStreaming(true);
        setIsPolling(true);
        console.log('streaming started');
      }
    } catch (error) {
      console.error('camera access error:', error);
    }
  };

  const stopPredict = () => {
    stopAlertSound();
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
      setIsPolling(false); // stop polling
    }
  };

  console.log('fire detection result:', predictionData);

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

        {!isStreaming ? (
          <button
            onClick={startPredict}
            className="block px-4 py-2 bg-blue-500 text-white rounded"
          >
            시작하기
          </button>
        ) : (
          <button
            onClick={stopPredict}
            className="block px-4 py-2 bg-red-500 text-white rounded"
          >
            정지하기
          </button>
        )}
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

// CSS 추가
<style jsx>{`
  @keyframes blink {
    0%, 100% { border-color: red; }
    50% { border-color: transparent; }
  }
`}</style>
