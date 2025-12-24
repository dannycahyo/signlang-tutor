import type { Hand, Keypoint } from '@tensorflow-models/hand-pose-detection';

// Hand landmark connections organized by finger/palm
const THUMB_CONNECTIONS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4]
];
const INDEX_CONNECTIONS = [
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8]
];
const MIDDLE_CONNECTIONS = [
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12]
];
const RING_CONNECTIONS = [
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16]
];
const PINKY_CONNECTIONS = [
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20]
];
const PALM_CONNECTIONS = [
  [5, 9],
  [9, 13],
  [13, 17]
];

// All connections combined (for single-color mode)
const HAND_CONNECTIONS = [
  ...THUMB_CONNECTIONS,
  ...INDEX_CONNECTIONS,
  ...MIDDLE_CONNECTIONS,
  ...RING_CONNECTIONS,
  ...PINKY_CONNECTIONS,
  ...PALM_CONNECTIONS
];

// Color scheme for multi-color mode
const FINGER_COLORS = {
  thumb: '#ef4444', // red
  index: '#eab308', // yellow
  middle: '#3b82f6', // blue
  ring: '#22c55e', // green
  pinky: '#a855f7', // purple
  palm: '#ffffff' // white
};

/**
 * Draw connections with a specific color
 */
function drawConnections(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  connections: number[][],
  color: string,
  lineWidth: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  for (const [startIdx, endIdx] of connections) {
    const start = keypoints[startIdx];
    const end = keypoints[endIdx];

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }
}

/**
 * Draw keypoints with a specific color
 */
function drawKeypoints(
  ctx: CanvasRenderingContext2D,
  keypoints: Keypoint[],
  indices: number[],
  color: string,
  radius: number = 4
): void {
  ctx.fillStyle = color;
  for (const idx of indices) {
    const point = keypoints[idx];
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Draw hand skeleton on canvas
 */
export function drawHandSkeleton(
  ctx: CanvasRenderingContext2D,
  hand: Hand,
  color: string | 'multicolor' = 'multicolor',
  lineWidth: number = 2
): void {
  const keypoints = hand.keypoints;

  if (color === 'multicolor') {
    // Draw each finger in a different color
    drawConnections(
      ctx,
      keypoints,
      THUMB_CONNECTIONS,
      FINGER_COLORS.thumb,
      lineWidth
    );
    drawConnections(
      ctx,
      keypoints,
      INDEX_CONNECTIONS,
      FINGER_COLORS.index,
      lineWidth
    );
    drawConnections(
      ctx,
      keypoints,
      MIDDLE_CONNECTIONS,
      FINGER_COLORS.middle,
      lineWidth
    );
    drawConnections(
      ctx,
      keypoints,
      RING_CONNECTIONS,
      FINGER_COLORS.ring,
      lineWidth
    );
    drawConnections(
      ctx,
      keypoints,
      PINKY_CONNECTIONS,
      FINGER_COLORS.pinky,
      lineWidth
    );
    drawConnections(
      ctx,
      keypoints,
      PALM_CONNECTIONS,
      FINGER_COLORS.palm,
      lineWidth
    );

    // Draw keypoints for each finger
    drawKeypoints(ctx, keypoints, [0, 1, 2, 3, 4], FINGER_COLORS.thumb);
    drawKeypoints(ctx, keypoints, [5, 6, 7, 8], FINGER_COLORS.index);
    drawKeypoints(ctx, keypoints, [9, 10, 11, 12], FINGER_COLORS.middle);
    drawKeypoints(ctx, keypoints, [13, 14, 15, 16], FINGER_COLORS.ring);
    drawKeypoints(ctx, keypoints, [17, 18, 19, 20], FINGER_COLORS.pinky);
  } else {
    // Single color mode
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
