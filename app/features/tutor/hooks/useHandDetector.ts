import { useEffect, useRef, useState } from 'react';
import * as handPoseDetection from '@tensorflow-models/hand-pose-detection';
import '@mediapipe/hands';
import { initializeTensorFlow } from '~/lib/tensorflow';

export function useHandDetector() {
  const detectorRef = useRef<handPoseDetection.HandDetector | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadDetector() {
      try {
        // Initialize TensorFlow.js backend first
        await initializeTensorFlow();

        // Create hand detector with MediaPipe
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
            modelType: 'full'
          };

        const detector = await handPoseDetection.createDetector(
          model,
          detectorConfig
        );

        if (mounted) {
          detectorRef.current = detector;
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load hand detector:', err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load hand detector'
          );
          setIsLoading(false);
        }
      }
    }

    loadDetector();

    return () => {
      mounted = false;
      if (detectorRef.current) {
        detectorRef.current.dispose();
      }
    };
  }, []);

  return {
    detector: detectorRef.current,
    isLoading,
    error
  };
}
