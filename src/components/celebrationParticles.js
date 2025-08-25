// celebrationParticles.js
import confetti from 'canvas-confetti';

export function fireExplosion() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 60,
    colors: ['#e11d48', '#f59e42', '#22d3ee', '#fff'],
    shapes: ['circle', 'star'],
    scalar: 1.5,
  });
}

export function fireFireworks() {
  confetti({
    particleCount: 120,
    angle: 60,
    spread: 100,
    origin: { x: 0.2, y: 0.2 },
    colors: ['#f59e42', '#22d3ee', '#fff'],
    shapes: ['circle', 'square'],
    scalar: 1.2,
  });
  confetti({
    particleCount: 120,
    angle: 120,
    spread: 100,
    origin: { x: 0.8, y: 0.2 },
    colors: ['#e11d48', '#22d3ee', '#fff'],
    shapes: ['circle', 'square'],
    scalar: 1.2,
  });
}

export function fireStars() {
  confetti({
    particleCount: 60,
    angle: 90,
    spread: 120,
    origin: { x: 0.5, y: 0.7 },
    colors: ['#fff', '#f59e42', '#22d3ee'],
    shapes: ['star'],
    scalar: 2,
  });
}
