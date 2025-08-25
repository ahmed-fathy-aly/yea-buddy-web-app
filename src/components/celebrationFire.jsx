// celebrationFire.jsx
import React from 'react';

export const FireBurst = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%, 0)', zIndex: 4, pointerEvents: 'none' }}>
      <div className="fire-animation" />
      <style>{`
        .fire-animation {
          width: 180px;
          height: 80px;
          background: radial-gradient(circle at 50% 60%, #f59e42 0%, #e11d48 60%, transparent 100%);
          border-radius: 50% 50% 60% 60%;
          filter: blur(8px) brightness(1.5);
          animation: fireBurstAnim 1.2s infinite alternate;
        }
        @keyframes fireBurstAnim {
          0% { transform: scale(1) rotate(-5deg); opacity: 0.7; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(-5deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};
