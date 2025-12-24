import { useEffect, useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import type { Hand } from '@tensorflow-models/hand-pose-detection';
import * as tf from '@tensorflow/tfjs';
import { useHandDetector } from '../hooks/useHandDetector';
import type { ClassifierHook } from '../hooks/useClassifier';
import { useTutorStore } from '../store';
import { drawHandSkeleton, drawConfidenceBar, clearCanvas } from '../utils/drawUtils';

interface SmartMirrorProps {
  classifier: ClassifierHook;
  onLandmarksUpdate?: (landmarks: Hand | null) => void;
  width?: number;
  height?: number;
}

export function SmartMirror({
  classifier,
  onLandmarksUpdate,
  width = 640,
  height = 480,
}: SmartMirrorProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const frameCountRef = useRef(0);
  const landmarksRef = useRef<Hand | null>(null);
  const [hasHand, setHasHand] = useState(false);

  const { detector, isLoading, error } = useHandDetector();
  const { isTrainingMode, updatePrediction, currentConfidence } = useTutorStore();

  const detectLoop = useCallback(async () => {
    if (!detector || !webcamRef.current?.video) {
      rafIdRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    const video = webcamRef.current.video;

    // Check if video is ready
    if (video.readyState !== 4) {
      rafIdRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    frameCountRef.current++;

    // Frame skipping for performance (every other frame)
    if (frameCountRef.current % 2 !== 0) {
      rafIdRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    try {
      // Detect hands (tf.tidy is handled internally by detector)
      const hands = await detector.estimateHands(video);

      landmarksRef.current = hands[0] || null;

      // Update hasHand state for visual indicator
      const handDetected = landmarksRef.current !== null;
      if (handDetected !== hasHand) {
        setHasHand(handDetected);
      }

      // Debug logging (only log every 30 frames to avoid spam)
      if (frameCountRef.current % 60 === 0) {
        console.log('Detection status:', {
          handsDetected: hands.length,
          hasLandmarks: !!landmarksRef.current,
          keypointsCount: landmarksRef.current?.keypoints?.length || 0
        });
      }

      // Draw on canvas immediately after detection
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          // Clear canvas
          clearCanvas(ctx);

          if (landmarksRef.current) {
            // Debug: log when actually drawing (throttled)
            if (frameCountRef.current % 120 === 0) {
              console.log('Drawing skeleton on canvas');
            }

            // Apply mirror transform (match webcam flip)
            ctx.save();
            ctx.scale(-1, 1);
            ctx.translate(-width, 0);

            // Use multicolor in training mode, confidence-based in practice mode
            let color: string | 'multicolor' = 'multicolor';

            if (!isTrainingMode) {
              // In practice mode, use confidence-based colors
              if (currentConfidence > 0.9) {
                color = '#22c55e'; // green
              } else if (currentConfidence > 0.7) {
                color = '#3b82f6'; // blue
              } else if (currentConfidence > 0.5) {
                color = '#eab308'; // yellow
              } else {
                color = '#ef4444'; // red
              }
            }

            // Draw hand skeleton
            drawHandSkeleton(ctx, landmarksRef.current, color);

            ctx.restore();

            // Draw confidence bar (outside transform)
            const barWidth = 200;
            const barHeight = 30;
            const barX = width - barWidth - 20;
            const barY = 20;
            drawConfidenceBar(ctx, currentConfidence, barX, barY, barWidth, barHeight);
          }
        }
      }

      // Notify parent component
      if (onLandmarksUpdate) {
        onLandmarksUpdate(landmarksRef.current);
      }

      // Only classify if in practice mode (not training) and classifier is ready
      if (!isTrainingMode && landmarksRef.current && classifier.isReady) {
        const result = await classifier.classify(landmarksRef.current.keypoints);

        if (result && result.confidence > 0.5) {
          updatePrediction(result.letter, result.confidence);
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    rafIdRef.current = requestAnimationFrame(detectLoop);
  }, [detector, isTrainingMode, classifier, updatePrediction, onLandmarksUpdate, width, height, currentConfidence, hasHand]);

  useEffect(() => {
    if (!isLoading && detector) {
      console.log('Starting detection loop');
      rafIdRef.current = requestAnimationFrame(detectLoop);
    }

    return () => {
      if (rafIdRef.current) {
        console.log('Stopping detection loop');
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [detector, isLoading, detectLoop]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-zinc-900 rounded-lg" style={{ width, height }}>
        <div className="text-center p-6">
          <div className="text-red-500 mb-2">Failed to load hand detector</div>
          <div className="text-sm text-zinc-400">{error}</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-zinc-900 rounded-lg" style={{ width, height }}>
        <div className="text-center">
          <div className="text-white mb-2">Initializing TensorFlow...</div>
          <div className="text-sm text-zinc-400">This may take a few seconds</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden border" style={{ width, height }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        width={width}
        height={height}
        screenshotFormat="image/jpeg"
        videoConstraints={{
          width,
          height,
          facingMode: 'user',
        }}
        className="absolute top-0 left-0"
        mirrored
      />

      {/* Canvas overlay for hand skeleton drawing */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 pointer-events-none"
        width={width}
        height={height}
      />

      {/* Debug status indicators */}
      <div className="absolute top-4 left-4 space-y-2">
        {!detector && (
          <div className="bg-black/70 text-white px-3 py-2 rounded text-sm">
            Loading detector...
          </div>
        )}
        {detector && (
          <div className={`px-3 py-2 rounded text-sm ${hasHand ? 'bg-green-600/80' : 'bg-red-600/80'} text-white`}>
            {hasHand ? '✓ Hand detected' : '○ No hand detected'}
          </div>
        )}
      </div>
    </div>
  );
}
