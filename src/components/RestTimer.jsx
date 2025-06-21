import React, { useState, useEffect, useRef } from 'react';

const REST_DURATION = 5; // 5 seconds for testing

const RestTimer = ({ scrollToFirstEmptySet }) => {
  const [secondsLeft, setSecondsLeft] = useState(REST_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showFinishAnim, setShowFinishAnim] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    }
    if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowFinishAnim(true);
      setTimeout(() => setShowFinishAnim(false), 1200); // Animation duration
      if (scrollToFirstEmptySet) scrollToFirstEmptySet();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, secondsLeft, scrollToFirstEmptySet]);

  const startTimer = () => {
    setSecondsLeft(REST_DURATION);
    setIsRunning(true);
    setShowFinishAnim(false);
  };

  // Pie progress calculations
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = (REST_DURATION - secondsLeft) / REST_DURATION;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative my-6 flex flex-col items-center w-full">
      <div className="w-full max-w-xs bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl p-6 flex flex-col items-center">
        <button
          onClick={startTimer}
          className="mb-4 px-4 py-2 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition font-semibold tracking-wide"
        >
          Start Rest Timer
        </button>
        <div className="relative flex flex-col items-center justify-center mb-2">
          <svg height={radius * 2} width={radius * 2}>
            <circle
              stroke="#334155"
              fill="none"
              strokeWidth={stroke}
              cx={radius}
              cy={radius}
              r={normalizedRadius}
            />
            <circle
              stroke="#22d3ee"
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference + ' ' + circumference}
              strokeDashoffset={strokeDashoffset}
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              style={{
                transition: 'stroke-dashoffset 0.5s linear',
                filter: 'drop-shadow(0 0 8px #22d3ee88)',
              }}
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy=".3em"
              fontSize="2.2em"
              fill="#fff"
              fontWeight="bold"
              style={{ userSelect: 'none', fontFamily: 'inherit' }}
            >
              {secondsLeft}s
            </text>
          </svg>
        </div>
        <div className="text-lg text-cyan-300 font-semibold tracking-wide mb-2">
          {isRunning ? "Resting..." : "Ready for next set?"}
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-zinc-400">Duration:</span>
          <span className="text-xs text-zinc-200">{REST_DURATION} sec</span>
        </div>
      </div>
      {/* Fullscreen finish animation */}
      {showFinishAnim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyan-500 bg-opacity-90 animate-fadeOut">
          <span className="text-6xl font-extrabold text-white drop-shadow-lg animate-bounce">
            REST OVER! YEAH BUDDY!
          </span>
        </div>
      )}
      {/* Animation keyframes */}
      <style>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeOut {
          animation: fadeOut 1.2s forwards;
        }
      `}</style>
    </div>
  );
};

export default RestTimer;