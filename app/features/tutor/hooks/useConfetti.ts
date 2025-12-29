import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
  const lastTriggerRef = useRef<number>(0);
  const COOLDOWN = 500; // ms between confetti triggers

  const celebrate = useCallback(() => {
    const now = Date.now();
    if (now - lastTriggerRef.current < COOLDOWN) return;
    lastTriggerRef.current = now;

    // Burst from bottom center
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55
    });

    fire(0.2, {
      spread: 60
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45
    });
  }, []);

  const fireworks = useCallback(() => {
    const duration = 2000;
    const end = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > end) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#22c55e', '#10b981', '#86efac'],
        zIndex: 9999
      });

      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#22c55e', '#10b981', '#86efac'],
        zIndex: 9999
      });
    }, 100);
  }, []);

  const stars = useCallback(() => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      shapes: ['star'] as confetti.Shape[],
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
      zIndex: 9999
    };

    confetti({
      ...defaults,
      particleCount: 40,
      scalar: 1.2,
      shapes: ['star'] as confetti.Shape[]
    });

    confetti({
      ...defaults,
      particleCount: 10,
      scalar: 0.75,
      shapes: ['circle'] as confetti.Shape[]
    });
  }, []);

  return { celebrate, fireworks, stars };
}
