import React, { useState, useRef, useEffect } from 'react';

const CIRCLE_SIZE = 64;
const STROKE_WIDTH = 6;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const REST_DURATION = 5; // 5 seconds for testing

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

  const progress = restTime / REST_DURATION;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Format as mm:ss
  const minutes = Math.floor(restTime / 60);
  const seconds = restTime % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <>
      {/* Fullscreen overlay when timer finishes */}
      {showOverlay && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 animate-fade-in">
          <span className="text-5xl font-extrabold text-cyan-300 drop-shadow-lg">REST OVER!</span>
        </div>
      )}
      <button
        className="fixed bottom-6 right-6 z-50 shadow-lg rounded-full bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center justify-center"
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
        onClick={handleToggle}
        aria-label={timerRunning ? 'Stop rest timer' : 'Start rest timer'}
      >
        <svg
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#444"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            cx={CIRCLE_SIZE / 2}
            cy={CIRCLE_SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.3s linear',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <span className="relative z-10 text-lg font-bold text-cyan-300 select-none">
          {timerRunning || restTime !== REST_DURATION ? timeDisplay : <span className="text-cyan-400">&#9654;</span>}
        </span>
      </button>
    </>
  );
};

export default RestTimerButton;
