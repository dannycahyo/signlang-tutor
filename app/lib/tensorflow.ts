import * as tf from '@tensorflow/tfjs';

let tfInitialized = false;

/**
 * Initialize TensorFlow.js with WebGL backend (singleton pattern)
 * Should be called once at app startup
 */
export async function initializeTensorFlow(): Promise<void> {
  if (tfInitialized) {
    return;
  }

  try {
    // Set backend to webgl for GPU acceleration
    await tf.setBackend('webgl');
    await tf.ready();

    tfInitialized = true;
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
  } catch (error) {
    console.error('Failed to initialize TensorFlow.js:', error);
    throw error;
  }
}

/**
 * Check if TensorFlow.js is initialized
 */
export function isTensorFlowReady(): boolean {
  return tfInitialized;
}

/**
 * Get TensorFlow.js backend info
 */
export function getBackendInfo() {
  return {
    backend: tf.getBackend(),
    memory: tf.memory()
  };
}
