import { create } from 'zustand';

export type LearningMode = 'practice' | 'quiz' | 'alphabet-run';

interface TutorState {
  // Current mode
  mode: LearningMode;

  // Target letter to practice
  targetLetter: string;

  // Current prediction
  currentPrediction: string | null;
  currentConfidence: number;

  // Feedback state
  isCorrect: boolean;
  feedbackMessage: string | null;

  // Quiz mode
  correctCount: number;
  totalAttempts: number;

  // Alphabet run
  alphabetProgress: number;
  startTime: number | null;

  // Actions
  setMode: (mode: LearningMode) => void;
  setTargetLetter: (letter: string) => void;
  updatePrediction: (prediction: string, confidence: number) => void;
  markCorrect: () => void;
  resetSession: () => void;
  nextLetter: () => void;
}

export const useTutorStore = create<TutorState>((set, get) => ({
  mode: 'practice',
  targetLetter: 'A',
  currentPrediction: null,
  currentConfidence: 0,
  isCorrect: false,
  feedbackMessage: null,
  correctCount: 0,
  totalAttempts: 0,
  alphabetProgress: 0,
  startTime: null,

  setMode: (mode) => set({ mode, correctCount: 0, totalAttempts: 0 }),

  setTargetLetter: (letter) =>
    set({
      targetLetter: letter,
      currentPrediction: null,
      currentConfidence: 0,
      isCorrect: false,
      feedbackMessage: null
    }),

  updatePrediction: (prediction, confidence) => {
    const { targetLetter } = get();
    const isCorrect = prediction === targetLetter && confidence > 0.9;

    set({
      currentPrediction: prediction,
      currentConfidence: confidence,
      isCorrect,
      feedbackMessage: isCorrect ? 'Correct!' : null
    });
  },

  markCorrect: () =>
    set((state) => ({
      correctCount: state.correctCount + 1,
      totalAttempts: state.totalAttempts + 1
    })),

  resetSession: () =>
    set({
      correctCount: 0,
      totalAttempts: 0,
      alphabetProgress: 0,
      startTime: null,
      currentPrediction: null,
      currentConfidence: 0,
      isCorrect: false,
      feedbackMessage: null
    }),

  nextLetter: () => {
    const { mode, targetLetter, alphabetProgress } = get();

    if (mode === 'alphabet-run') {
      const nextProgress = alphabetProgress + 1;
      if (nextProgress < 26) {
        const nextLetter = String.fromCharCode(65 + nextProgress);
        set({
          alphabetProgress: nextProgress,
          targetLetter: nextLetter,
          currentPrediction: null,
          currentConfidence: 0,
          isCorrect: false,
          startTime: alphabetProgress === 0 ? Date.now() : get().startTime
        });
      }
    } else if (mode === 'quiz') {
      // Random letter
      const randomLetter = String.fromCharCode(
        65 + Math.floor(Math.random() * 26)
      );
      set({
        targetLetter: randomLetter,
        currentPrediction: null,
        currentConfidence: 0,
        isCorrect: false
      });
    }
  }
}));
