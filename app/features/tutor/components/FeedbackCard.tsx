import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { useTutorStore } from '../store';
import { Button } from '~/components/ui/button';
import { useConfetti } from '../hooks/useConfetti';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function FeedbackCard() {
  const {
    targetLetter,
    currentPrediction,
    currentConfidence,
    isCorrect,
    setTargetLetter,
  } = useTutorStore();

  const { celebrate } = useConfetti();
  const prevIsCorrectRef = useRef(false);
  const hasDetection = currentPrediction !== null;

  // Trigger confetti when isCorrect becomes true
  useEffect(() => {
    if (isCorrect && !prevIsCorrectRef.current) {
      celebrate();
    }
    prevIsCorrectRef.current = isCorrect;
  }, [isCorrect, celebrate]);

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
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{
              scale: [0.5, 1.2, 1],
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            className="text-center py-4"
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1, 1.1, 1]
              }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                repeat: Infinity,
                repeatDelay: 2
              }}
              className="text-6xl mb-3"
            >
              🎉
            </motion.div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Perfect!
            </div>
            <div className="text-lg text-zinc-700 dark:text-zinc-200 font-medium">
              You nailed the {targetLetter} sign!
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-3">
              Ready for another challenge?
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="text-2xl mb-2">👋</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-300 mb-1">
              Detected:{' '}
              <span className="font-bold text-lg">{currentPrediction}</span>
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {Math.round(currentConfidence * 100)}% confident
            </div>
            <div className="mt-3 px-4 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Try forming the letter {targetLetter}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                You're doing great! Keep going
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
