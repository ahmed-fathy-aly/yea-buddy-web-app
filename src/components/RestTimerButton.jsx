import React, { useState, useRef, useEffect } from 'react';

const CIRCLE_SIZE = 96;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getProgressColor(progress) {
  // progress: 1 = full, 0 = empty
  if (progress > 0.5) {
    // Green to yellow
    const percent = (progress - 0.5) * 2; // 1 at full, 0 at 0.5
    return `rgb(${255 - Math.round(155 * percent)}, 255, 80)`; // #a3ff50 to #ffff50
  } else {
    // Yellow to red
    const percent = progress * 2; // 1 at 0.5, 0 at 0
    return `rgb(255, ${255 - Math.round(205 * (1 - percent))}, 80)`; // #ffff50 to #ff5050
  }
}

const RestTimerButton = ({ onRestOver, restDuration = 120 }) => {
  const [restTime, setRestTime] = useState(restDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const intervalRef = useRef(null);
  const overlayTimeoutRef = useRef(null);

  useEffect(() => {
    setRestTime(restDuration);
  }, [restDuration]);

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
      setRestTime(restDuration);
      setTimerRunning(false);
    } else {
      if (restTime === 0) setRestTime(restDuration);
      setTimerRunning(true);
    }
  };

  // Progress for circular bar (full circle at start, empty at 0)
  const progress = restTime / restDuration;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const progressColor = getProgressColor(progress);

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
      {/* Progress bar to the left of the button when running */}
      {timerRunning && (
        <div className="fixed bottom-8 left-0 flex items-center z-40" style={{height: CIRCLE_SIZE}}>
          <div
            className="rounded-full overflow-hidden transition-all duration-500"
            style={{
              width: `calc(100vw - 3.5rem - 2rem)`, // 3.5rem (button) + 2rem (gap)
              height: CIRCLE_SIZE,
              background: '#222',
              position: 'relative',
              marginRight: '2rem',
              boxShadow: '0 2px 16px 0 #0004',
            }}
          >
            <div
              className="absolute left-0 top-0 h-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${progressColor}, #222 100%)`,
                borderRadius: '9999px',
                zIndex: 1,
                boxShadow: '0 0 16px 0 ' + progressColor,
                transition: 'width 0.5s, background 0.5s',
              }}
            ></div>
            {/* Empty bar background */}
            <div
              className="absolute left-0 top-0 w-full h-full"
              style={{
                background: '#222',
                opacity: 0.3,
                borderRadius: '9999px',
                zIndex: 0,
              }}
            ></div>
          </div>
        </div>
      )}
      <div className="fixed bottom-8 right-8 flex flex-col items-center z-50">
        <div className="relative flex items-center justify-center rounded-full overflow-hidden" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
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
              stroke={timerRunning ? progressColor : '#a3e635'}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.5s' }}
              strokeLinecap="round"
              filter={timerRunning ? `drop-shadow(0 0 8px ${progressColor})` : 'drop-shadow(0 0 8px #a3e635)'}
            />
          </svg>
          <button
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-base font-bold shadow-lg border-4 border-zinc-700 focus:outline-none transition-all duration-300 ${timerRunning ? 'bg-sky-500 text-white animate-pulse ring-4 ring-sky-300/40' : 'bg-lime-400 text-zinc-900 hover:bg-lime-300'}`}
            style={{ position: 'relative', zIndex: 2 }}
            onClick={handleToggle}
            type="button"
          >
            <span className="block leading-tight text-lg font-bold">{timerRunning ? 'RESTING' : 'REST'}</span>
            <span className="text-sm font-mono mt-1">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default RestTimerButton;
