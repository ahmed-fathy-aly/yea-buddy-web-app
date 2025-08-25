// celebrationSound.js
export const playCelebrationSound = () => {
  if (typeof window !== 'undefined') {
    const audio = new window.Audio('/celebration.mp3');
    audio.volume = 0.7;
    audio.play();
  }
};
