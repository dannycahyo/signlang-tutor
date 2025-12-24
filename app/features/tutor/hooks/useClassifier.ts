import { useCallback, useEffect, useRef, useState } from 'react';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import type { Keypoint } from '@tensorflow-models/hand-pose-detection';
import { scaleNormalizeHand } from '../utils/geometry';

export interface ClassifierResult {
  letter: string;
  confidence: number;
}

export interface ClassifierHook {
  classify: (landmarks: Keypoint[]) => Promise<ClassifierResult | null>;
  addExample: (landmarks: Keypoint[], letter: string) => void;
  clearClass: (letter: string) => void;
  getSampleCount: (letter: string) => number;
  getTotalSamples: () => number;
  isReady: boolean;
  reset: () => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function useClassifier(): ClassifierHook {
  const classifierRef = useRef<knnClassifier.KNNClassifier | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize KNN classifier
    classifierRef.current = knnClassifier.create();
    setIsReady(true);

    return () => {
      // Cleanup: dispose classifier
      classifierRef.current?.dispose();
    };
  }, []);

  const landmarksToTensor = useCallback(
    (landmarks: Keypoint[]): tf.Tensor2D => {
      return tf.tidy(() => {
        // Normalize landmarks (position and scale invariant)
        const normalized = scaleNormalizeHand(landmarks);

        // normalized is already a flat array: [x1, y1, z1, x2, y2, z2, ...]
        // Convert to tensor (shape: [1, 63])
        return tf.tensor2d([normalized], [1, 63]);
      });
    },
    []
  );

  const addExample = useCallback(
    (landmarks: Keypoint[], letter: string) => {
      if (!classifierRef.current || landmarks.length !== 21) return;

      tf.tidy(() => {
        const tensor = landmarksToTensor(landmarks);
        const classIndex = ALPHABET.indexOf(letter.toUpperCase());

        if (classIndex === -1) {
          console.error(`Invalid letter: ${letter}`);
          return;
        }

        classifierRef.current!.addExample(tensor, classIndex);
      });
    },
    [landmarksToTensor]
  );

  const classify = useCallback(
    async (landmarks: Keypoint[]): Promise<ClassifierResult | null> => {
      if (
        !classifierRef.current ||
        landmarks.length !== 21 ||
        classifierRef.current.getNumClasses() === 0
      ) {
        return null;
      }

      const tensor = landmarksToTensor(landmarks);
      const prediction = await classifierRef.current.predictClass(tensor);

      const letter = ALPHABET[prediction.classIndex];
      const confidence = prediction.confidences[prediction.classIndex];

      const result = {
        letter,
        confidence
      };

      // Dispose tensor
      tensor.dispose();

      return result;
    },
    [landmarksToTensor]
  );

  const clearClass = useCallback((letter: string) => {
    if (!classifierRef.current) return;

    const classIndex = ALPHABET.indexOf(letter.toUpperCase());
    if (classIndex === -1) return;

    classifierRef.current.clearClass(classIndex);
  }, []);

  const getSampleCount = useCallback((letter: string): number => {
    if (!classifierRef.current) return 0;

    const classIndex = ALPHABET.indexOf(letter.toUpperCase());
    if (classIndex === -1) return 0;

    return classifierRef.current.getClassExampleCount()[classIndex] || 0;
  }, []);

  const getTotalSamples = useCallback((): number => {
    if (!classifierRef.current) return 0;

    const counts = classifierRef.current.getClassExampleCount();
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }, []);

  const reset = useCallback(() => {
    classifierRef.current?.clearAllClasses();
  }, []);

  return {
    classify,
    addExample,
    clearClass,
    getSampleCount,
    getTotalSamples,
    isReady,
    reset
  };
}
