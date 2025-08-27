import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
// Removed extra particle effects and LightningBolts for performance

const pulseGlow = {
  animation: 'pulseGlow 1.2s infinite',
  boxShadow: '0 0 60px 20px #22d3ee, 0 0 120px 40px #f59e42',
};

const zoomAnim = {
  animation: 'zoomCelebration 0.7s',
};

const shakeAnim = {
  animation: 'screenShake 0.5s',
};

const gradientBg = {};

const emojiAnim = {
  animation: 'emojiBounce 1s infinite',
  fontSize: '3rem',
  marginBottom: '1rem',
};

const styles = `
@keyframes pulseGlow {
  0% { box-shadow: 0 0 60px 20px #22d3ee, 0 0 120px 40px #f59e42; }
  50% { box-shadow: 0 0 90px 40px #f59e42, 0 0 180px 60px #22d3ee; }
  100% { box-shadow: 0 0 60px 20px #22d3ee, 0 0 120px 40px #f59e42; }
}
@keyframes emojiBounce {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.3) translateY(-20px); }
}
@keyframes screenShake {
  0% { transform: translate(0px, 0px); }
  20% { transform: translate(-10px, 5px); }
  40% { transform: translate(10px, -5px); }
  60% { transform: translate(-10px, 5px); }
  80% { transform: translate(10px, -5px); }
  100% { transform: translate(0px, 0px); }
}
@keyframes textExplode {
  0% { letter-spacing: 0px; opacity: 0.5; transform: scale(0.8); }
  60% { letter-spacing: 10px; opacity: 1; transform: scale(1.2); }
  100% { letter-spacing: 2px; opacity: 1; transform: scale(1); }
}
@keyframes zoomCelebration {
  0% { transform: scale(1); }
  40% { transform: scale(1.25); }
  100% { transform: scale(1); }
}
`;

const ConfettiCelebration = ({ show, message }) => {
  const [colorIdx, setColorIdx] = useState(0);
  const colorCycle = [
    '#f59e42', '#22d3ee', '#e11d48', '#fff', '#0ea5e9', '#f43f5e', '#fde68a', '#18181b'
  ];

  useEffect(() => {
    if (show) {
      // Screen shake
      document.body.classList.add('confetti-shake');
      setTimeout(() => document.body.classList.remove('confetti-shake'), 700);
      // Vibration (mobile)
      if (window.navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100, 50, 200]);
      }
      // Dynamic color cycling
      let colorInterval = setInterval(() => {
        setColorIdx(idx => (idx + 1) % colorCycle.length);
      }, 120);
      setTimeout(() => clearInterval(colorInterval), 2200);
      return () => clearInterval(colorInterval);
    }
  }, [show]);

  if (!show) return null;
  // Simple text shadow for drama, no 3D/zoom effect
  const textShadow = {
    textShadow: '0 0 40px #e11d48, 0 0 20px #fff',
  };
  // Dynamic color
  const dynamicColor = colorCycle[colorIdx];
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
      <style>{styles}
        {`.confetti-shake { animation: screenShake 0.5s; }`}
      </style>
  {/* Only confetti animation retained for performance */}
  <Confetti numberOfPieces={120} recycle={false} colors={colorCycle} shapes={["circle", "star", "square"]} />
      <div style={{ position: 'absolute', top: '35%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100vw', pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ fontSize: '4.2rem', fontWeight: 900, color: dynamicColor, textShadow: '0 0 16px #fff, 0 0 32px #e11d48', marginBottom: '1rem', fontFamily: 'Arial Black, Impact, Oswald, sans-serif', letterSpacing: '2px' }}>
          🎉
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 900, color: dynamicColor, textShadow: '0 0 12px #fff', marginBottom: '0.7rem', fontFamily: 'Arial Black, Impact, Oswald, sans-serif', letterSpacing: '1px' }}>
          Personal Best
        </div>
        <div style={{ fontSize: '2.4rem', fontWeight: 900, color: dynamicColor, textShadow: '0 0 10px #fff', marginBottom: '0.7rem', fontFamily: 'Arial Black, Impact, Oswald, sans-serif', letterSpacing: '1px' }}>
          {message ? message.replace(/new personal best:?\s*/i, '').replace(/^!+\s*/, '') : ''}
        </div>
      </div>
    </div>
  );
};

export default ConfettiCelebration;
