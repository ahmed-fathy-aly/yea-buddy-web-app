import React, { useState, useRef, useEffect } from 'react';

const CIRCLE_SIZE = 96;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const STORAGE_KEY = 'restTimerStartTime';

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

const RestTimerButton = ({ onRestOver, restDuration = 120, autoStartTrigger }) => {
  const [restTime, setRestTime] = useState(restDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const intervalRef = useRef(null);
  const overlayTimeoutRef = useRef(null);
  const autoStartTimeoutRef = useRef(null);

  // Initialize timer from localStorage if active
  useEffect(() => {
    const startTimeStr = localStorage.getItem(STORAGE_KEY);
    if (startTimeStr) {
      const startTime = parseInt(startTimeStr, 10);
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      if (elapsed < restDuration) {
        // Timer still running
        setRestTime(restDuration - elapsed);
        setTimerRunning(true);
      } else {
        // Timer already finished
        localStorage.removeItem(STORAGE_KEY);
        setRestTime(restDuration);
        setTimerRunning(false);
      }
    }
  }, [restDuration]);

  // Update timer based on start time
  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        const startTimeStr = localStorage.getItem(STORAGE_KEY);
        if (!startTimeStr) {
          setTimerRunning(false);
          setRestTime(restDuration);
          return;
        }

        const startTime = parseInt(startTimeStr, 10);
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = restDuration - elapsed;

        if (remaining <= 0) {
          clearInterval(intervalRef.current);
          setTimerRunning(false);
          setRestTime(0);
          localStorage.removeItem(STORAGE_KEY);
          setShowOverlay(true);
          overlayTimeoutRef.current = setTimeout(() => {
            setShowOverlay(false);
            setRestTime(restDuration);
            if (onRestOver) onRestOver();
          }, 2000);
        } else {
          setRestTime(remaining);
        }
      }, 100); // Check every 100ms for smoother updates
    } else {
      clearInterval(intervalRef.current);
    }
    
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, restDuration, onRestOver]);

  useEffect(() => {
    return () => {
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
      if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
    };
  }, []);

  const startTimer = () => {
    const startTime = Date.now();
    localStorage.setItem(STORAGE_KEY, startTime.toString());
    setRestTime(restDuration);
    setTimerRunning(true);
    setShowOverlay(false);
  };

  // Auto-start timer when autoStartTrigger changes (debounced)
  useEffect(() => {
    if (autoStartTrigger > 0) {
      // Clear any existing timeout
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
      
      // Debounce: wait 500ms after last change before starting timer
      autoStartTimeoutRef.current = setTimeout(() => {
        startTimer();
      }, 500);
    }
    
    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartTrigger]);

  const handleToggle = () => {
    if (timerRunning) {
      // Stop and reset
      localStorage.removeItem(STORAGE_KEY);
      setRestTime(restDuration);
      setTimerRunning(false);
    } else {
      // Start timer
      startTimer();
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center glass animate-fade-in">
          <span className="text-6xl font-extrabold text-cyan-300 drop-shadow-lg neon-glow">REST COMPLETE!</span>
        </div>
      )}
      {/* Progress bar to the left of the button when running */}
      {timerRunning && (
        <div className="fixed bottom-8 left-0 flex items-center z-40" style={{height: CIRCLE_SIZE}}>
          <div
            className="rounded-full overflow-hidden transition-all duration-500 glass"
            style={{
              width: `calc(100vw - 3.5rem - 2rem)`, // 3.5rem (button) + 2rem (gap)
              height: CIRCLE_SIZE,
              position: 'relative',
              marginRight: '2rem',
              boxShadow: '0 2px 16px 0 rgba(0, 255, 255, 0.1)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
            }}
          >
            <div
              className="absolute left-0 top-0 h-full transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${progressColor}, rgba(0, 255, 255, 0.1) 100%)`,
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
                background: 'rgba(0, 255, 255, 0.05)',
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
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-base font-bold shadow-2xl border-4 focus:outline-none transition-all duration-300 neon-glow ${
              timerRunning
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white animate-pulse ring-4 ring-cyan-300/40 border-cyan-400'
                : 'glass border-cyan-500/50 text-cyan-200 hover:bg-cyan-500/20 hover:text-white'
            }`}
            style={{ position: 'relative', zIndex: 2 }}
            onClick={handleToggle}
            type="button"
          >
            <span className="block leading-tight text-lg font-bold">{timerRunning ? 'RECOVERY' : 'REST'}</span>
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
