import type { Keypoint } from '@tensorflow-models/hand-pose-detection';

/**
 * Normalize hand landmarks to be relative to the wrist (position-invariant)
 */
export function normalizeHandLandmarks(keypoints: Keypoint[]): number[] {
  if (keypoints.length !== 21) {
    throw new Error('Expected 21 keypoints');
  }

  const wrist = keypoints[0];
  const normalized: number[] = [];

  // Convert all points to be relative to wrist
  for (const point of keypoints) {
    normalized.push(
      point.x - wrist.x,
      point.y - wrist.y,
      (point.z || 0) - (wrist.z || 0)
    );
  }

  return normalized;
}

/**
 * Calculate scale-invariant landmarks by normalizing hand size
 * Uses distance between wrist and middle finger MCP as reference
 */
export function scaleNormalizeHand(keypoints: Keypoint[]): number[] {
  const wrist = keypoints[0];
  const middleFingerMCP = keypoints[9]; // Middle finger base

  // Calculate reference distance
  const dx = middleFingerMCP.x - wrist.x;
  const dy = middleFingerMCP.y - wrist.y;
  const dz = (middleFingerMCP.z || 0) - (wrist.z || 0);
  const refDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (refDistance === 0) {
    return normalizeHandLandmarks(keypoints);
  }

  const normalized: number[] = [];

  // Normalize by reference distance
  for (const point of keypoints) {
    const relX = (point.x - wrist.x) / refDistance;
    const relY = (point.y - wrist.y) / refDistance;
    const relZ = ((point.z || 0) - (wrist.z || 0)) / refDistance;
    normalized.push(relX, relY, relZ);
  }

  return normalized;
}

/**
 * Calculate angle between three points (in degrees)
 */
export function calculateAngle(
  p1: Keypoint,
  p2: Keypoint,
  p3: Keypoint
): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(p1: Keypoint, p2: Keypoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dz = (p2.z || 0) - (p1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
