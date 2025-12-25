import * as knnClassifier from '@tensorflow-models/knn-classifier';

const STORAGE_KEY = 'signlang-tutor-classifier';

export async function saveClassifier(
  classifier: knnClassifier.KNNClassifier
): Promise<void> {
  try {
    const dataset = classifier.getClassifierDataset();
    const datasetObj: Record<string, number[][]> = {};

    // Convert tensors to arrays for serialization
    Object.keys(dataset).forEach((key) => {
      const data = dataset[key as any].dataSync() as Float32Array;
      const shape = dataset[key as any].shape;
      datasetObj[key] = Array.from(data) as any;
      (datasetObj[key] as any).shape = shape;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(datasetObj));
  } catch (error) {
    console.error('Failed to save classifier:', error);
    throw error;
  }
}

export async function loadClassifier(
  classifier: knnClassifier.KNNClassifier
): Promise<boolean> {
  try {
    const datasetJson = localStorage.getItem(STORAGE_KEY);
    if (!datasetJson) {
      return false;
    }

    const datasetObj = JSON.parse(datasetJson);

    // Convert arrays back to tensors
    const dataset: Record<string, any> = {};
    Object.keys(datasetObj).forEach((key) => {
      const data = datasetObj[key];
      const shape = (data as any).shape;
      const values = data.slice(0, -1); // Remove shape from array
      dataset[key] = require('@tensorflow/tfjs').tensor(values, shape);
    });

    classifier.setClassifierDataset(dataset);
    return true;
  } catch (error) {
    console.error('Failed to load classifier:', error);
    return false;
  }
}

export function clearStoredClassifier(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function hasStoredClassifier(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

export async function exportClassifier(
  classifier: knnClassifier.KNNClassifier
): Promise<void> {
  try {
    const dataset = classifier.getClassifierDataset();
    const datasetObj: Record<string, any> = {};

    Object.keys(dataset).forEach((key) => {
      const data = dataset[key as any].arraySync();
      datasetObj[key] = data;
    });

    const blob = new Blob([JSON.stringify(datasetObj, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signlang-classifier-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export classifier:', error);
    throw error;
  }
}

export async function importClassifier(
  classifier: knnClassifier.KNNClassifier,
  file: File
): Promise<void> {
  try {
    const text = await file.text();
    const datasetObj = JSON.parse(text);

    const tf = require('@tensorflow/tfjs');
    const dataset: Record<string, any> = {};

    Object.keys(datasetObj).forEach((key) => {
      dataset[key] = tf.tensor(datasetObj[key]);
    });

    classifier.setClassifierDataset(dataset);

    // Also save to localStorage
    await saveClassifier(classifier);
  } catch (error) {
    console.error('Failed to import classifier:', error);
    throw error;
  }
}
