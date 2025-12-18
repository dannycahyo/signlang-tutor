import type { Hand, Keypoint } from '@tensorflow-models/hand-pose-detection';

// Hand landmark connections (MediaPipe hand model)
const HAND_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index finger
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle finger
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring finger
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky
  [5, 9],
  [9, 13],
  [13, 17] // Palm
];

/**
 * Draw hand skeleton on canvas
 */
export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  hand: Hand,
  color: string = '#00ff00',
  lineWidth: number = 2
): void {
  const keypoints = hand.keypoints;

  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = keypoints[startIdx];
    const end = keypoints[endIdx];

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  // Draw keypoints
  ctx.fillStyle = color;
  for (const point of keypoints) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Draw a ghost/guide hand overlay
 */
export function drawGuideHand(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  opacity: number = 0.5
): void {
  ctx.save();
  ctx.globalAlpha = opacity;

  // Draw connections
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = keypoints[startIdx];
    const end = keypoints[endIdx];

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  // Draw keypoints
  ctx.fillStyle = '#ffffff';
  for (const point of keypoints) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 6, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Clear canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draw confidence bar
 */
export function drawConfidenceBar(
  ctx: CanvasRenderingContext2D,
  confidence: number,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x, y, width, height);

  // Progress bar
  const progressWidth = width * confidence;
  const color =
    confidence > 0.9 ? '#00ff00' : confidence > 0.7 ? '#ffff00' : '#ff0000';

  ctx.fillStyle = color;
  ctx.fillRect(x, y, progressWidth, height);

  // Border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    `${Math.round(confidence * 100)}%`,
    x + width / 2,
    y + height / 2 + 6
  );
}
