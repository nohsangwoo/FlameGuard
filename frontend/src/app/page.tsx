'use client'

import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [isPolling, setIsPolling] = useState(false)

  // capture video frame and convert to Blob
  const captureFrame = async (
    videoElement: HTMLVideoElement,
  ): Promise<Blob | null> => {
    try {
      if (!videoElement.videoWidth || !videoElement.videoHeight) {
        console.log('video size is invalid')
        return null
      }

      const canvas = document.createElement('canvas')
      canvas.width = videoElement.videoWidth
      canvas.height = videoElement.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return null
      }

      ctx.drawImage(videoElement, 0, 0)

      return new Promise(resolve => {
        canvas.toBlob(blob => {
          if (!blob) {
            resolve(null)
            return
          }
          resolve(blob || null)
        }, 'image/jpeg')
      })
    } catch (error) {
      console.error('Error capturing frame:', error)
      return null
    }
  }

  // send image to server
  const sendFrameToServer = async () => {
    try {
      if (!videoRef.current || !isStreaming) {
        console.log('video is not playing or streaming')
        return null
      }

      const blob = await captureFrame(videoRef.current)
      if (!blob) {
        console.log('frame capture failed')
        return null
      }

      const formData = new FormData()
      formData.append('file', blob, 'frame.jpg')

      console.log('sending request to server...')

      const response = await fetch('http://localhost:8000/predict_fire', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      console.log('server response:', data)

      return data
    } catch (error) {
      console.error('Error sending frame to server:', error)
      return null
    }
  }

  const { data: predictionData } = useQuery({
    queryKey: ['fire_detection'],
    queryFn: sendFrameToServer,
    enabled: isStreaming && isPolling,
    refetchInterval: 5000,
    retry: false,
  })

  const startStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevice },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setIsStreaming(true)
        setIsPolling(true)
        console.log('Streaming started')
      }
    } catch (error) {
      console.error('Error starting streaming:', error)
    }
  }

  const stopStreaming = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
      setIsStreaming(false)
      setIsPolling(false)
      console.log('Streaming stopped')
    }
  }

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(
          devices => devices.kind === 'videoinput',
        )

        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      } catch (error) {
        console.error('failed to get camera devices:', error)
      }
    }
    getDevices()
  }, [])

  console.log('predictionData: ', predictionData)
  return (
    <div className="grid grid-rows[auto_1fr_auto] gap-4 items-center justify-items-center min-h-screen p-8">
      <div className="spacce-y-4">
        <select
          value={selectedDevice}
          onChange={e => setSelectedDevice(e.target.value)}
          className="border p-2 rounded"
        >
          {devices.map(devices => (
            <option key={devices.deviceId} value={devices.deviceId}>
              {devices.label || `Camera ${devices.deviceId.slice(0, 5)}...`}
            </option>
          ))}
        </select>

        {!isStreaming ? (
          <button
            onClick={startStreaming}
            className="block px-4- py-2 bg-blue-500 text-white rounded"
          >
            Start Streaming
          </button>
        ) : (
          <button
            onClick={stopStreaming}
            className="block px-4- py-2 bg-red-500 text-white rounded"
          >
            Stop Streaming
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
  )
}
