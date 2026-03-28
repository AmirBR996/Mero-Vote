import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";

const FaceCapture = ({ onCapture, existingPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(existingPhoto || null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [status, setStatus] = useState("Click to start camera");
  const [loading, setLoading] = useState(false);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);
      setStatus("Loading face detection models...");
      try {
        console.log("Loading face-api models from /models/...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);
        setIsModelLoaded(true);
        setStatus("Models loaded. Click to start camera.");
        console.log("All models loaded successfully");
      } catch (err) {
        console.error("Failed to load models:", err);
        setStatus("Failed to load models. Ensure /public/models folder exists with all .webassembly and .weights files.");
        setLoading(false);
        return;
      }
      setLoading(false);
    };
    
    // Don't attempt to load models if they're already loading
    if (!isModelLoaded && !loading) {
      loadModels();
    }
    
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
    setFaceDetected(false);
  }, []);

  const startCamera = async () => {
    if (!isModelLoaded) {
      setStatus("Models are not loaded yet. Please wait...");
      return;
    }
    
    try {
      setStatus("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 480 }, 
          height: { ideal: 360 }, 
          facingMode: "user" 
        },
      });
      
      console.log("Camera stream obtained:", stream);
      streamRef.current = stream;

      if (!videoRef.current) {
        setStatus("Video element not found. Try again.");
        return;
      }

      // Set handlers BEFORE assigning srcObject to ensure events are captured
      let metadataLoaded = false;
      let playTimeout = null;

      videoRef.current.onloadedmetadata = () => {
        console.log("Video metadata loaded");
        metadataLoaded = true;
        clearTimeout(playTimeout);
        playVideo();
      };

      const playVideo = () => {
        console.log("Attempting to play video");
        setIsCameraOn(true);
        setCapturedImage(null);
        setStatus("Position your face in the frame");
        
        // Try to play
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Video playing successfully");
              detectFace();
            })
            .catch((err) => {
              console.error("Play error:", err);
              setStatus("Video playback failed: " + err.message);
            });
        } else {
          // Older browsers don't return a promise
          detectFace();
        }
      };

      // Timeout in case metadata never loads
      playTimeout = setTimeout(() => {
        if (!metadataLoaded) {
          console.warn("Metadata didn't load after 5s, attempting to play anyway");
          playVideo();
        }
      }, 5000);

      // NOW assign srcObject to trigger the metadata load
      videoRef.current.srcObject = stream;

    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setStatus("Camera permission denied. Please allow camera access in browser settings.");
      } else if (err.name === "NotFoundError") {
        setStatus("No camera device found. Please connect a camera.");
      } else {
        setStatus("Camera error: " + err.message);
      }
    }
  };

  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const detect = async () => {
      // FIX: Use streamRef as source of truth to avoid stale closure on isCameraOn
      if (!streamRef.current || !video || video.paused || video.ended) return;

      // FIX: Guard against running detection before video dimensions are ready
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        animFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks();

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length === 1) {
          setFaceDetected(true);
          setStatus("✓ Face detected! Click Capture.");
          const box = detections[0].detection.box;
          ctx.strokeStyle = "#22c55e";
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        } else if (detections.length > 1) {
          setFaceDetected(false);
          setStatus("Multiple faces detected. Only one face allowed.");
        } else {
          setFaceDetected(false);
          setStatus("No face detected. Adjust position.");
        }
      } catch (err) {
        console.warn("Detection error:", err);
      }

      // Only schedule next frame if stream is still active
      if (streamRef.current) {
        animFrameRef.current = requestAnimationFrame(detect);
      }
    };

    detect();
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !faceDetected) return;
    setLoading(true);
    setStatus("Capturing and analyzing face...");

    try {
      const video = videoRef.current;

      // FIX: Run face detection FIRST on the live video before drawing to canvas
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("Face not captured properly. Try again.");
        setLoading(false);
        return;
      }

      // Now draw the frame after we've confirmed detection
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const tCtx = tempCanvas.getContext("2d");
      tCtx.drawImage(video, 0, 0);
      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.8);

      const descriptor = Array.from(detection.descriptor);

      if (!descriptor || descriptor.length === 0) {
        setStatus("Face verification data not captured. Try again.");
        setLoading(false);
        return;
      }

      setCapturedImage(dataUrl);
      stopCamera();
      setStatus("✓ Face captured and verified successfully!");

      if (onCapture) {
        onCapture(dataUrl, descriptor);
      }
    } catch (err) {
      console.error("Capture error:", err);
      setStatus("Capture failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
        Face Photo <span className="text-[var(--nepal-red)]">*</span>
      </label>

      <div
        className="relative rounded-xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border-subtle)]"
        style={{ minHeight: "320px" }}
      >
        {/* Video element - always in DOM, visibility controlled by isCameraOn */}
        <video
          ref={videoRef}
          style={{ 
            width: "100%", 
            height: "100%",
            objectFit: "cover",
            display: isCameraOn ? "block" : "none",
            backgroundColor: "#000"
          }}
          autoPlay
          muted
          playsInline
        />
        
        {/* Canvas overlay - always in DOM */}
        <canvas
          ref={canvasRef}
          style={{ 
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            display: isCameraOn ? "block" : "none"
          }}
        />

        {/* Captured image view */}
        {capturedImage && !isCameraOn && (
          <div className="flex flex-col items-center p-4 gap-3 h-full justify-center">
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-40 h-40 rounded-xl object-cover border-2 border-green-500/50"
            />
            <button
              type="button"
              onClick={startCamera}
              className="btn-secondary text-xs py-2 px-4"
              disabled={!isModelLoaded}
            >
              Retake Photo
            </button>
          </div>
        )}

        {/* Initial state - show button to start camera */}
        {!isCameraOn && !capturedImage && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="text-4xl">📸</div>
            <button
              type="button"
              onClick={startCamera}
              className="btn-primary text-xs py-2 px-6"
              disabled={!isModelLoaded || loading}
            >
              {loading ? "Loading..." : "Start Camera"}
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className={`text-xs ${faceDetected ? "text-green-400" : "text-[var(--text-muted)]"}`}>
          {status}
        </p>
        {isCameraOn && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!faceDetected || loading}
              className="btn-primary text-xs py-2 px-4"
            >
              {loading ? "Processing..." : "📸 Capture"}
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="btn-secondary text-xs py-2 px-4 border-gray-500 text-gray-400"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceCapture;