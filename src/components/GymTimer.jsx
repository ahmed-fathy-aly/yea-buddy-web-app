import React, { useState, useEffect, useRef, useCallback } from 'react';

const LOCAL_STORAGE_GYM_START_TIME_KEY = 'workoutGymStartTime';

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const displayMinutes = minutes % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const GymTimer = () => {
  const [gymTimerActive, setGymTimerActive] = useState(false);
  const [gymStartTime, setGymStartTime] = useState(null);
  const [gymElapsedTime, setGymElapsedTime] = useState(0);
  const gymTimerIntervalRef = useRef(null);

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

  return (
    <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 text-center">
      <h2 className="text-3xl font-bold mb-5 text-blue-300">Total Gym Time, YEAH BUDDY!</h2>
      <div className="text-6xl font-extrabold text-blue-400 mb-5 border-2 border-dashed border-blue-500 rounded-lg p-4 inline-block min-w-[180px] select-none">
        {formatTime(gymElapsedTime)}
      </div>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
        {!gymTimerActive ? (
          <button
            onClick={startGymWorkoutTimer}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center text-lg"
          >
            <i className="fas fa-play-circle mr-2"></i> START WORKOUT!
          </button>
        ) : (
          <button
            onClick={endGymWorkoutTimer}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center text-lg"
          >
            <i className="fas fa-stop-circle mr-2"></i> END WORKOUT!
          </button>
        )}
      </div>
    </section>
  );
};

export default GymTimer;