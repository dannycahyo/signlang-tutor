import { useReducer, useRef, useEffect, useCallback } from 'react';
import type { Hand } from '@tensorflow-models/hand-pose-detection';
import { Button } from '~/components/ui/button';
import { SmartMirror } from '~/features/tutor/components/SmartMirror';
import { TrainingPanel } from '~/features/tutor/components/TrainingPanel';
import { FeedbackCard } from '~/features/tutor/components/FeedbackCard';
import { useClassifier } from '~/features/tutor/hooks/useClassifier';
import { useTutorStore } from '~/features/tutor/store';
import {
  exportClassifier,
  importClassifier,
  saveClassifier,
  loadClassifier,
} from '~/features/tutor/utils/classifierStorage';
import { toast } from 'sonner';

interface TutorPageState {
  mode: 'training' | 'practice';
}

type TutorAction = { type: 'TOGGLE_MODE' };

function tutorReducer(
  state: TutorPageState,
  action: TutorAction,
): TutorPageState {
  switch (action.type) {
    case 'TOGGLE_MODE':
      return {
        ...state,
        mode: state.mode === 'training' ? 'practice' : 'training',
      };
    default:
      return state;
  }
}

export default function TutorPage() {
  const [state, dispatch] = useReducer(tutorReducer, {
    mode: 'training',
  });

  const classifier = useClassifier();
  const { setTrainingMode } = useTutorStore();
  const currentLandmarksRef = useRef<Hand | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync training mode with store
  useEffect(() => {
    setTrainingMode(state.mode === 'training');
  }, [state.mode, setTrainingMode]);

  // Load saved classifier on mount
  useEffect(() => {
    const loadSavedClassifier = async () => {
      if (!classifier.isReady) return;

      try {
        const classifierRef = (classifier as any).classifierRef
          ?.current;
        if (!classifierRef) return;

        await loadClassifier(classifierRef);
        const totalSamples = classifier.getTotalSamples();
        if (totalSamples > 0) {
          toast.success(
            `Loaded classifier with ${totalSamples} samples`,
          );
        }
      } catch (error) {
        console.log('No saved classifier found');
      }
    };

    loadSavedClassifier();
  }, [classifier.isReady]);

  const handleLandmarksUpdate = useCallback(
    (landmarks: Hand | null) => {
      currentLandmarksRef.current = landmarks;

      // Debug: log when landmarks are updated
      if (landmarks && frameCountRef.current % 120 === 0) {
        console.log('Landmarks updated in parent:', {
          hasKeypoints: !!landmarks.keypoints,
          keypointsCount: landmarks.keypoints?.length,
        });
      }
      frameCountRef.current = (frameCountRef.current || 0) + 1;
    },
    [],
  );

  const frameCountRef = useRef(0);

  const handleExport = async () => {
    try {
      const classifierRef = (classifier as any).classifierRef
        ?.current;
      if (!classifierRef) {
        toast.error('No classifier to export');
        return;
      }
      await exportClassifier(classifierRef);
      await saveClassifier(classifierRef);
      toast.success('Classifier exported successfully');
    } catch (error) {
      toast.error('Failed to export classifier');
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const classifierRef = (classifier as any).classifierRef
        ?.current;
      if (!classifierRef) {
        toast.error('Classifier not ready');
        return;
      }

      await importClassifier(classifierRef, file);
      toast.success('Classifier imported successfully');
    } catch (error) {
      toast.error('Failed to import classifier');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleMode = () => {
    const totalSamples = classifier.getTotalSamples();

    if (state.mode === 'training' && totalSamples === 0) {
      toast.error('Please collect some training samples first');
      return;
    }

    if (state.mode === 'training' && totalSamples < 30) {
      toast.warning(
        'Recommended: 10+ samples per letter for best results',
      );
    }

    dispatch({ type: 'TOGGLE_MODE' });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Sign Language Tutor
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Learn sign language with real-time hand detection and
              feedback
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={
                state.mode === 'training' ? 'default' : 'outline'
              }
              onClick={handleToggleMode}
            >
              Training Mode
            </Button>
            <Button
              variant={
                state.mode === 'practice' ? 'default' : 'outline'
              }
              onClick={handleToggleMode}
            >
              Practice Mode
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-6">
          {/* Left Panel */}
          <div className="order-2 lg:order-1">
            {state.mode === 'training' ? (
              <TrainingPanel
                classifier={classifier}
                currentLandmarksRef={currentLandmarksRef}
                onExport={handleExport}
                onImport={handleImport}
              />
            ) : (
              <FeedbackCard />
            )}
          </div>

          {/* Right Panel - SmartMirror */}
          <div className="order-1 lg:order-2">
            <SmartMirror
              classifier={classifier}
              onLandmarksUpdate={handleLandmarksUpdate}
            />
          </div>
        </div>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
