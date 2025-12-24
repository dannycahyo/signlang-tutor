import { useEffect, useRef } from 'react';
import type { Keypoint, Hand } from '@tensorflow-models/hand-pose-detection';
import { drawHandSkeleton, drawConfidenceBar, clearCanvas } from '../utils/drawUtils';

interface HandOverlayProps {
  landmarks: Keypoint[] | null;
  confidence: number;
  width: number;
  height: number;
  streamWidth?: number;
  streamHeight?: number;
  showConfidenceBar?: boolean;
}

export function HandOverlay({
  landmarks,
  confidence,
  width,
  height,
  streamWidth = 640,
  streamHeight = 480,
  showConfidenceBar = true,
}: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    clearCanvas(ctx);

    frameCountRef.current++;

    if (!landmarks || landmarks.length === 0) {
      // Debug: log occasionally when no landmarks
      if (frameCountRef.current % 120 === 0) {
        console.log('HandOverlay: No landmarks to draw');
      }
      return;
    }

    // Debug: log occasionally when drawing
    if (frameCountRef.current % 120 === 0) {
      console.log('HandOverlay: Drawing', landmarks.length, 'keypoints');
    }

    // Apply mirror transform (match webcam flip)
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-width, 0);

    // Determine color based on confidence (with added blue level)
    let color: string | 'multicolor' = 'multicolor';

    // Use confidence-based colors if confidence is being tracked
    if (confidence > 0) {
      if (confidence > 0.9) {
        color = '#22c55e'; // green
      } else if (confidence > 0.7) {
        color = '#3b82f6'; // blue
      } else if (confidence > 0.5) {
        color = '#eab308'; // yellow
      } else {
        color = '#ef4444'; // red
      }
    }

    // Create Hand object for drawHandSkeleton
    const hand: Hand = {
      keypoints: landmarks,
      handedness: 'Right',
      score: confidence,
    };

    // Draw hand skeleton
    drawHandSkeleton(ctx, hand, color);

    ctx.restore();

    // Draw confidence bar (outside transform)
    if (showConfidenceBar) {
      const barWidth = 200;
      const barHeight = 30;
      const barX = width - barWidth - 20;
      const barY = 20;
      drawConfidenceBar(ctx, confidence, barX, barY, barWidth, barHeight);
    }
  }, [landmarks, confidence, width, height, streamWidth, streamHeight, showConfidenceBar]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 pointer-events-none"
      width={width}
      height={height}
    />
  );
}
