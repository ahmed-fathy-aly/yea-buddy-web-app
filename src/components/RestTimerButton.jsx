import React, { useState, useRef, useEffect } from 'react';

const CIRCLE_SIZE = 80;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const REST_DURATION = 120; // 120 seconds default

const RestTimerButton = ({ onRestOver }) => {
  const [restTime, setRestTime] = useState(REST_DURATION);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const intervalRef = useRef(null);
  const overlayTimeoutRef = useRef(null);

  useEffect(() => {
    if (timerRunning && restTime > 0) {
      intervalRef.current = setInterval(() => {
        setRestTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            setShowOverlay(true);
            overlayTimeoutRef.current = setTimeout(() => {
              setShowOverlay(false);
              if (onRestOver) onRestOver();
            }, 2000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!timerRunning || restTime === 0) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, restTime, onRestOver]);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, []);

  const handleToggle = () => {
    if (timerRunning) {
      setRestTime(REST_DURATION);
      setTimerRunning(false);
    } else {
      if (restTime === 0) setRestTime(REST_DURATION);
      setTimerRunning(true);
    }
  };

  // Progress for circular bar (full circle at start, empty at 0)
  const progress = restTime / REST_DURATION;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Format as mm:ss
  const minutes = Math.floor(restTime / 60);
  const seconds = restTime % 60;

  return (
    <>
      {/* Fullscreen overlay when timer finishes */}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
          <span className="text-5xl font-extrabold text-cyan-300 drop-shadow-lg">REST OVER!</span>
        </div>
      )}
      <div className="fixed bottom-8 right-8 flex flex-col items-center z-50">
        <div className="relative flex items-center justify-center" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
          <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="absolute top-0 left-0" style={{ zIndex: 1 }}>
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="#333"
              strokeWidth={STROKE_WIDTH}
            />
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={timerRunning ? '#38bdf8' : '#a3e635'}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              strokeLinecap="round"
              filter={timerRunning ? 'drop-shadow(0 0 8px #38bdf8)' : 'drop-shadow(0 0 8px #a3e635)'}
            />
          </svg>
          <button
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-lg font-bold shadow-lg border-4 border-zinc-700 focus:outline-none transition-all duration-300 ${timerRunning ? 'bg-sky-500 text-white animate-pulse ring-4 ring-sky-300/40' : 'bg-lime-400 text-zinc-900 hover:bg-lime-300'}`}
            style={{ position: 'relative', zIndex: 2 }}
            onClick={handleToggle}
            type="button"
          >
            {timerRunning ? 'RESTING' : 'REST'}
            <span className="text-xs font-mono mt-1">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </button>
        </div>
        {/* Removed the 'Done Resting' button */}
      </div>
    </>
  );
};

export default RestTimerButton;
