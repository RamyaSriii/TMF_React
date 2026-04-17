import React, { useRef, useState, useCallback, useEffect } from 'react';
import './CameraCapture.css';

/**
 * CameraCapture — Uses browser MediaDevices API for live camera capture.
 * Works on desktop (webcam) and mobile (front/back camera).
 */
export default function CameraCapture({ onCapture, disabled }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);

  const [active, setActive]       = useState(false);   // Camera is streaming
  const [error, setError]         = useState(null);    // Camera error message
  const [facingMode, setFacingMode] = useState('environment'); // front/back
  const [captured, setCaptured]   = useState(null);    // Preview data URL

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setError(null);
    setCaptured(null);

    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode,
          width:  { ideal: 1280 },
          height: { ideal: 720 },
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // The video element is always in the DOM (just hidden), so ref is always valid
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for the video to be ready before marking active
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setActive(true);
          }).catch(() => {
            setActive(true); // Still set active even if autoplay is restricted
          });
        };
      }
    } catch (err) {
      let msg = 'Camera access denied.';
      if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.';
      else if (err.name === 'NotFoundError') msg = 'No camera found on this device.';
      else if (err.name === 'NotSupportedError') msg = 'Camera not supported in this browser.';
      else if (err.name === 'NotReadableError') msg = 'Camera is already in use by another application.';
      setError(msg);
    }
  }, [facingMode]);

  // Capture frame from video
  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Draw current video frame to canvas
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image as data URL and as File
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCaptured(dataUrl);

    // Convert data URL to File object for API upload
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, dataUrl);
      }
    }, 'image/jpeg', 0.92);

    stopCamera();
  }, [onCapture, stopCamera]);

  // Flip camera (front/back on mobile)
  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Re-start camera when facingMode changes (only if already active)
  useEffect(() => {
    if (active || streamRef.current) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="camera">
      {/* Error */}
      {error && (
        <div className="camera__error">
          <span>📷</span>
          <p>{error}</p>
        </div>
      )}

      {/* 
        Video element is ALWAYS in the DOM so videoRef is always available.
        We toggle visibility via CSS instead of conditional rendering.
      */}
      <div
        className="camera__viewfinder"
        style={{ display: active && !captured ? 'block' : 'none' }}
      >
        <video
          ref={videoRef}
          className="camera__video"
          playsInline
          muted
          autoPlay
        />
        <div className="camera__overlay">
          <div className="camera__guide-box" />
          <p className="camera__guide-text">Position leaf within frame</p>
        </div>

        {/* Controls */}
        <div className="camera__controls">
          <button className="camera__btn camera__btn--flip" onClick={flipCamera} title="Flip camera">
            🔄
          </button>
          <button className="camera__btn camera__btn--capture" onClick={captureFrame} title="Take photo">
            📸
          </button>
          <button className="camera__btn camera__btn--close" onClick={stopCamera} title="Close camera">
            ✕
          </button>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Start button (when not active) */}
      {!active && !captured && (
        <button
          className={`camera__start-btn ${disabled ? 'disabled' : ''}`}
          onClick={startCamera}
          disabled={disabled}
        >
          <span className="camera__start-icon">📷</span>
          <span>Open Camera</span>
          <small>Use device camera to capture leaf</small>
        </button>
      )}
    </div>
  );
}
