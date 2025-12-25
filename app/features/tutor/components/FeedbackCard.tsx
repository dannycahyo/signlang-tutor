import { motion } from 'framer-motion';
import { useTutorStore } from '../store';
import { Button } from '~/components/ui/button';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function FeedbackCard() {
  const {
    targetLetter,
    currentPrediction,
    currentConfidence,
    isCorrect,
    setTargetLetter,
  } = useTutorStore();

  const hasDetection = currentPrediction !== null;

  return (
    <div className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-900 rounded-lg border">
      {/* Letter Selector */}
      <div>
        <h3 className="text-sm font-medium mb-2">
          Select Letter to Practice
        </h3>
        <div className="grid grid-cols-13 gap-1">
          {ALPHABET.map((letter) => (
            <Button
              key={letter}
              size="sm"
              variant={
                letter === targetLetter ? 'default' : 'outline'
              }
              onClick={() => setTargetLetter(letter)}
              className="h-8 w-8 p-0 text-xs"
            >
              {letter}
            </Button>
          ))}
        </div>
      </div>

      {/* Target Display */}
      <div className="text-center py-8 border-t">
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          Target Letter
        </div>
        <div className="text-8xl font-bold text-zinc-900 dark:text-white">
          {targetLetter}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Sign: {targetLetter}
        </div>
      </div>

      {/* Feedback Display */}
      <div className="border-t pt-4">
        {!hasDetection ? (
          <div className="text-center text-zinc-500 dark:text-zinc-400">
            Position your hand in view
          </div>
        ) : isCorrect ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ✓ Correct!
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">
              Great job! Try another letter.
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Current:{' '}
              <span className="font-bold">{currentPrediction}</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Confidence: {Math.round(currentConfidence * 100)}%
            </div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              Keep practicing {targetLetter}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
