import React, { useEffect, useRef, useState, useCallback } from 'react';

const LOCAL_STORAGE_GYM_START_TIME_KEY = 'workoutGymStartTime';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${displayMinutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

const GymTimer = ({ todayWorkout }) => {
  const [gymTimerActive, setGymTimerActive] = useState(false);
  const [gymStartTime, setGymStartTime] = useState(null);
  const [gymElapsedTime, setGymElapsedTime] = useState(0);
  const gymTimerIntervalRef = useRef(null);

  // Calculate total and completed sets
  let totalSets = 0;
  let completedSets = 0;
  if (todayWorkout && todayWorkout.exercises) {
    todayWorkout.exercises.forEach((exercise) => {
      if (exercise.sets) {
        totalSets += exercise.sets.length;
        completedSets += exercise.sets.filter(
          (set) =>
            (typeof set.reps === 'number' ? set.reps > 0 : !!set.reps) &&
            (typeof set.weight === 'number' ? set.weight > 0 : !!set.weight)
        ).length;
      }
    });
  }

  // Progress bar logic (same as workout progress bar)
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress =
    totalSets > 0 ? Math.min(completedSets / totalSets, 1) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const startGymWorkoutTimer = useCallback(() => {
    const startTime = Date.now();
    localStorage.setItem(LOCAL_STORAGE_GYM_START_TIME_KEY, startTime);
    setGymStartTime(startTime);
    setGymTimerActive(true);
  }, []);

  const endGymWorkoutTimer = useCallback(() => {
    if (gymTimerIntervalRef.current) {
      clearInterval(gymTimerIntervalRef.current);
    }
    setGymTimerActive(false);
    localStorage.removeItem(LOCAL_STORAGE_GYM_START_TIME_KEY);
  }, []);

  useEffect(() => {
    if (gymTimerActive && gymStartTime !== null) {
      gymTimerIntervalRef.current = setInterval(() => {
        setGymElapsedTime(Math.floor((Date.now() - gymStartTime) / 1000));
      }, 1000);
      return () => clearInterval(gymTimerIntervalRef.current);
    }
  }, [gymTimerActive, gymStartTime]);

  useEffect(() => {
    const storedStartTime = localStorage.getItem(LOCAL_STORAGE_GYM_START_TIME_KEY);
    if (storedStartTime) {
      const startTime = parseInt(storedStartTime, 10);
      const now = Date.now();
      const calculatedElapsedTime = Math.floor((now - startTime) / 1000);
      setGymStartTime(startTime);
      setGymElapsedTime(calculatedElapsedTime);
      setGymTimerActive(true);
    }
  }, []);

  // Format time as mm:ss or hh:mm:ss
  const timeStr = formatTime(gymElapsedTime);

  return (
    <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 text-center w-full max-w-xs mx-auto">
      <div className="flex justify-center mb-4">
        {!gymTimerActive ? (
          <button
            onClick={startGymWorkoutTimer}
            className="px-4 py-2 bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition font-semibold tracking-wide"
          >
            Start Workout Timer
          </button>
        ) : (
          <button
            onClick={endGymWorkoutTimer}
            className="px-4 py-2 bg-red-600 rounded-lg shadow hover:bg-red-700 transition font-semibold tracking-wide"
          >
            End Workout Timer
          </button>
        )}
      </div>
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
          {/* Centered text group */}
          <g>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy="-0.7em"
              fontSize="1.2em"
              fill="#38bdf8"
              fontWeight="bold"
              style={{ userSelect: 'none', fontFamily: 'inherit' }}
            >
              {completedSets}/{totalSets}
            </text>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dy="1.2em"
              fontSize="1.1em"
              fill="#fff"
              fontWeight="bold"
              style={{ userSelect: 'none', fontFamily: 'inherit' }}
            >
              {timeStr}
            </text>
          </g>
        </svg>
      </div>
    </section>
  );
};

export default GymTimer;