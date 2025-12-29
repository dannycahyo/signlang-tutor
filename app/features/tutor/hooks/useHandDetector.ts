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
    let initTimeout: NodeJS.Timeout;

    async function loadDetector() {
      try {
        console.log('Initializing hand detector...');

        // Add delay for client-side navigation to prevent MediaPipe WASM conflicts
        await new Promise((resolve) => {
          initTimeout = setTimeout(resolve, 300);
        });

        if (!mounted) return;

        // Initialize TensorFlow.js backend first
        await initializeTensorFlow();
        console.log('TensorFlow.js ready');

        if (!mounted) return;

        // Create hand detector with MediaPipe
        const model = handPoseDetection.SupportedModels.MediaPipeHands;
        const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
          {
            runtime: 'mediapipe',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',
            modelType: 'full'
          };

        console.log('Creating hand detector with config:', detectorConfig);
        const detector = await handPoseDetection.createDetector(
          model,
          detectorConfig
        );

        if (mounted) {
          detectorRef.current = detector;
          setIsLoading(false);
          console.log('Hand detector initialized successfully');
        } else {
          detector.dispose();
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
      clearTimeout(initTimeout);
      if (detectorRef.current) {
        detectorRef.current.dispose();
        detectorRef.current = null;
      }
    };
  }, []);

  return {
    detector: detectorRef.current,
    isLoading,
    error
  };
}
