import { useReducer, useRef } from 'react';
import type { Hand } from '@tensorflow-models/hand-pose-detection';
import { Button } from '~/components/ui/button';
import type { ClassifierHook } from '../hooks/useClassifier';
import { Download, Upload, Trash2 } from 'lucide-react';
import type { MutableRefObject } from 'react';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface TrainingState {
  selectedLetter: string;
  isCapturing: boolean;
  sampleCounts: Record<string, number>;
}

type TrainingAction =
  | { type: 'SELECT_LETTER'; letter: string }
  | { type: 'SET_CAPTURING'; capturing: boolean }
  | { type: 'ADD_SAMPLE'; letter: string }
  | { type: 'CLEAR_LETTER'; letter: string }
  | { type: 'RESET' }
  | { type: 'SET_COUNTS'; counts: Record<string, number> };

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'SELECT_LETTER':
      return { ...state, selectedLetter: action.letter };
    case 'SET_CAPTURING':
      return { ...state, isCapturing: action.capturing };
    case 'ADD_SAMPLE':
      return {
        ...state,
        sampleCounts: {
          ...state.sampleCounts,
          [action.letter]: (state.sampleCounts[action.letter] || 0) + 1,
        },
      };
    case 'CLEAR_LETTER':
      return {
        ...state,
        sampleCounts: {
          ...state.sampleCounts,
          [action.letter]: 0,
        },
      };
    case 'RESET':
      return {
        ...state,
        sampleCounts: {},
      };
    case 'SET_COUNTS':
      return {
        ...state,
        sampleCounts: action.counts,
      };
    default:
      return state;
  }
}

interface TrainingPanelProps {
  classifier: ClassifierHook;
  currentLandmarksRef: MutableRefObject<Hand | null>;
  onExport: () => void;
  onImport: () => void;
}

export function TrainingPanel({
  classifier,
  currentLandmarksRef,
  onExport,
  onImport,
}: TrainingPanelProps) {
  const [state, dispatch] = useReducer(trainingReducer, {
    selectedLetter: 'A',
    isCapturing: false,
    sampleCounts: {},
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // Read from ref at the moment of button click
    const hand = currentLandmarksRef.current;
    const keypoints = hand?.keypoints;

    // Debug logging
    console.log('Capture attempt:', {
      hasHand: !!hand,
      hasKeypoints: !!keypoints,
      keypointsLength: keypoints?.length,
      keypointsType: Array.isArray(keypoints) ? 'array' : typeof keypoints
    });

    if (!keypoints) {
      alert('No hand detected. Position your hand in view.');
      return;
    }

    if (keypoints.length !== 21) {
      alert(`Invalid hand data: detected ${keypoints.length} keypoints, expected 21.`);
      return;
    }

    classifier.addExample(keypoints, state.selectedLetter);
    dispatch({ type: 'ADD_SAMPLE', letter: state.selectedLetter });

    // Visual feedback
    dispatch({ type: 'SET_CAPTURING', capturing: true });
    setTimeout(() => {
      dispatch({ type: 'SET_CAPTURING', capturing: false });
    }, 200);
  };

  const handleClearLetter = () => {
    classifier.clearClass(state.selectedLetter);
    dispatch({ type: 'CLEAR_LETTER', letter: state.selectedLetter });
  };

  const handleReset = () => {
    if (confirm('Clear all training data?')) {
      classifier.reset();
      dispatch({ type: 'RESET' });
    }
  };

  const getSampleCount = (letter: string): number => {
    return classifier.getSampleCount(letter);
  };

  const totalSamples = classifier.getTotalSamples();
  const readyLetters = ALPHABET.filter((l) => getSampleCount(l) >= 10).length;
  const isReady = readyLetters >= 3;

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Training Mode</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Collect hand pose samples for each letter. Minimum 10 samples per letter recommended.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center border rounded-lg p-3">
        <div>
          <div className="text-2xl font-bold">{totalSamples}</div>
          <div className="text-xs text-zinc-500">Total Samples</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{readyLetters}</div>
          <div className="text-xs text-zinc-500">Letters Ready</div>
        </div>
        <div>
          <div className={`text-2xl font-bold ${isReady ? 'text-green-600' : 'text-yellow-600'}`}>
            {isReady ? '✓' : '...'}
          </div>
          <div className="text-xs text-zinc-500">Status</div>
        </div>
      </div>

      {/* Letter Selector */}
      <div>
        <h4 className="text-sm font-medium mb-2">Select Letter</h4>
        <div className="grid grid-cols-13 gap-1 max-h-48 overflow-y-auto">
          {ALPHABET.map((letter) => {
            const count = getSampleCount(letter);
            const isSelected = letter === state.selectedLetter;
            const hasEnough = count >= 10;

            return (
              <Button
                key={letter}
                size="sm"
                variant={isSelected ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SELECT_LETTER', letter })}
                className="h-12 w-12 p-0 text-xs flex flex-col relative"
              >
                <span className="text-sm font-bold">{letter}</span>
                <span className={`text-[10px] ${hasEnough ? 'text-green-600' : 'text-zinc-500'}`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Capture Controls */}
      <div className="border-t pt-4">
        <div className="text-center mb-3">
          <div className="text-4xl font-bold mb-1">{state.selectedLetter}</div>
          <div className="text-sm text-zinc-500">
            {getSampleCount(state.selectedLetter)} samples collected
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleCapture}
            disabled={state.isCapturing}
            className="w-full"
            size="lg"
          >
            {state.isCapturing ? 'Captured!' : 'Capture Sample'}
          </Button>
          <Button
            onClick={handleClearLetter}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            Clear {state.selectedLetter}
          </Button>
        </div>
      </div>

      {/* Storage Controls */}
      <div className="border-t pt-4 space-y-2">
        <Button onClick={onExport} variant="outline" className="w-full" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export Classifier
        </Button>
        <Button onClick={onImport} variant="outline" className="w-full" size="sm">
          <Upload className="w-4 h-4 mr-2" />
          Import Classifier
        </Button>
        <Button onClick={handleReset} variant="outline" className="w-full" size="sm">
          <Trash2 className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
      />
    </div>
  );
}
