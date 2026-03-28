import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";

const FaceVerify = ({ storedDescriptor, onVerified, onCancel }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("Initializing face verification...");
  const [verified, setVerified] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const verifyCountRef = useRef(0);

  const MATCH_THRESHOLD = 0.5; // Lower = stricter
  const REQUIRED_MATCHES = 3;

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        console.log("Loading face-api models for verification...");
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        ]);

        if (!mounted) return;
        
        console.log("Models loaded, requesting camera for verification...");
        setStatus("Starting camera for verification...");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: "user" },
        });
        
        if (!mounted) { 
          stream.getTracks().forEach(t => t.stop()); 
          return; 
        }

        console.log("Camera stream obtained for verification");
        streamRef.current = stream;

        if (!videoRef.current) {
          console.error("Video ref not available");
          setStatus("Video element error. Try again.");
          setLoading(false);
          return;
        }

        // Set handlers BEFORE assigning srcObject
        let metadataLoaded = false;
        let playTimeout = null;

        const playVideo = () => {
          console.log("Starting verification video playback");
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Verification video playing");
                if (mounted) {
                  setLoading(false);
                  setStatus("Look directly at the camera...");
                  startVerification();
                }
              })
              .catch((err) => {
                console.error("Verification play error:", err);
                if (mounted) {
                  setStatus("Video playback failed: " + err.message);
                  setLoading(false);
                }
              });
          }
        };

        videoRef.current.onloadedmetadata = () => {
          console.log("Verification video metadata loaded");
          metadataLoaded = true;
          clearTimeout(playTimeout);
          playVideo();
        };

        playTimeout = setTimeout(() => {
          if (!metadataLoaded && mounted) {
            console.warn("Metadata didn't load, attempting to play anyway");
            playVideo();
          }
        }, 5000);

        // NOW assign srcObject to trigger metadata load
        videoRef.current.srcObject = stream;

      } catch (err) {
        console.error("Face verify init error:", err);
        if (mounted) {
          if (err.name === "NotAllowedError") {
            setStatus("Camera permission denied. Please allow camera access.");
          } else if (err.name === "NotFoundError") {
            setStatus("No camera device found.");
          } else {
            setStatus("Error: " + err.message);
          }
          setLoading(false);
        }
      }
    };
    
    init();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);

  const startVerification = () => {
    const verify = async () => {
      if (!videoRef.current || !streamRef.current) return;
      const video = videoRef.current;
      if (video.paused || video.ended) return;

      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (detection) {
            const box = detection.detection.box;
            // Compare with stored descriptor
            const storedArray = new Float32Array(storedDescriptor);
            const distance = faceapi.euclideanDistance(detection.descriptor, storedArray);
            const score = Math.max(0, Math.min(100, Math.round((1 - distance) * 100)));
            setMatchScore(score);

            if (distance < MATCH_THRESHOLD) {
              ctx.strokeStyle = "#22c55e";
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              verifyCountRef.current += 1;
              setStatus(`✓ Face matched! (${score}% confidence) ${verifyCountRef.current}/${REQUIRED_MATCHES}`);

              if (verifyCountRef.current >= REQUIRED_MATCHES) {
                setVerified(true);
                setStatus("✓ Identity verified successfully!");
                stopCamera();
                setTimeout(() => { if (onVerified) onVerified(); }, 1500);
                return;
              }
            } else {
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 3;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              verifyCountRef.current = Math.max(0, verifyCountRef.current - 1);
              setStatus(`Face does not match (${score}% match). Try adjusting position.`);
            }
          } else {
            setStatus("No face detected. Please look at the camera.");
            verifyCountRef.current = Math.max(0, verifyCountRef.current - 1);
          }
        }
      } catch (err) {
        console.error("Verification frame error:", err);
      }

      if (streamRef.current) {
        animFrameRef.current = requestAnimationFrame(verify);
      }
    };
    verify();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🔐</span> Identity Verification Required
          </h3>
          {verified && (
            <button onClick={() => { stopCamera(); onCancel?.(); }} className="text-gray-400 hover:text-white text-xl transition" title="Close after verification">
              ✕
            </button>
          )}
        </div>

        <p className="text-sm text-[var(--text-muted)]">
          {verified 
            ? "Your identity has been verified successfully. You may now vote."
            : "Please look directly at the camera to verify your identity before voting. This is required for all votes."}
        </p>

        <div className="relative rounded-xl overflow-hidden bg-black" style={{ minHeight: "280px" }}>
          {/* Video element - always in DOM for ref access */}
          <video 
            ref={videoRef} 
            style={{ 
              width: "100%", 
              height: "100%",
              objectFit: "cover",
              display: loading ? "none" : "block",
              minHeight: "320px"
            }} 
            muted 
            playsInline 
            autoPlay
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
              display: loading ? "none" : "block"
            }} 
          />

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center h-[280px]">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[var(--nepal-red)] border-t-transparent rounded-full mx-auto" style={{ animation: "spin 1s linear infinite" }} />
                <p className="text-sm text-[var(--text-muted)]">Loading verification...</p>
              </div>
            </div>
          )}

          {/* Verified state overlay */}
          {verified && (
            <div className="absolute inset-0 bg-green-900/80 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-6xl">✅</div>
                <p className="text-xl font-bold text-green-300">Identity Verified!</p>
              </div>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className={`p-3 rounded-lg text-sm font-medium text-center ${
          verified ? "bg-green-500/20 text-green-300" :
          matchScore !== null && matchScore > 60 ? "bg-green-500/10 text-green-400" :
          matchScore !== null ? "bg-red-500/10 text-red-400" :
          "bg-[var(--bg-card)] text-[var(--text-muted)]"
        }`}>
          {status}
        </div>

        {/* Progress bar */}
        {!verified && !loading && (
          <div className="h-2 bg-[var(--bg-card)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${(verifyCountRef.current / REQUIRED_MATCHES) * 100}%`,
                background: `linear-gradient(90deg, var(--nepal-red), var(--nepal-gold))`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FaceVerify;
