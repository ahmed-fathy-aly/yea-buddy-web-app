import React, { useState, useEffect, useRef, useCallback } from 'react';

const TOTAL_REST_DURATION = 2 * 60;
const LOCAL_STORAGE_REST_TIMER_KEY = 'workoutRestTimerEndTime';

const RestTimer = ({ scrollToFirstEmptySet }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_REST_DURATION);
  const intervalRef = useRef(null);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startRestTimer = useCallback(() => {
    const endTime = Date.now() + TOTAL_REST_DURATION * 1000;
    localStorage.setItem(LOCAL_STORAGE_REST_TIMER_KEY, endTime);
    setTimerActive(true);
  }, []);

  const resetRestTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
    setTimeRemaining(TOTAL_REST_DURATION);
    localStorage.removeItem(LOCAL_STORAGE_REST_TIMER_KEY);
  }, []);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const endTime = localStorage.getItem(LOCAL_STORAGE_REST_TIMER_KEY);
        if (endTime) {
          const newTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeRemaining(newTimeRemaining);
          if (newTimeRemaining === 0) {
            resetRestTimer();
          }
        }
      }, 1000);
      return () => clearInterval(intervalRef.current);
    }
  }, [timerActive, resetRestTimer]);

  useEffect(() => {
    const storedEndTime = localStorage.getItem(LOCAL_STORAGE_REST_TIMER_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      const calculatedTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      if (calculatedTimeRemaining > 0) {
        setTimeRemaining(calculatedTimeRemaining);
        setTimerActive(true);
      } else {
        resetRestTimer();
      }
    }
  }, [resetRestTimer]);

  return (
    <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800 text-center">
      <h2 className="text-3xl font-bold mb-5 text-blue-300">Rest Timer, AIN'T NOTHIN' BUT A PEANUT!</h2>
      <div className="text-6xl font-extrabold text-blue-400 mb-5 border-2 border-dashed border-blue-500 rounded-lg p-4 inline-block min-w-[180px] select-none">
        {formatTime(timeRemaining)}
      </div>
      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
        <button
          onClick={startRestTimer}
          disabled={timerActive}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          <i className="fas fa-hourglass-start mr-2"></i> START REST!
        </button>
        <button
          onClick={resetRestTimer}
          disabled={!timerActive && timeRemaining === TOTAL_REST_DURATION}
          className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
        >
          <i className="fas fa-stopwatch mr-2"></i> RESET REST!
        </button>
      </div>
      <button
        onClick={scrollToFirstEmptySet}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-full sm:w-auto mx-auto"
      >
        <i className="fas fa-arrow-down mr-2"></i> FIND NEXT SET, YEAH BUDDY!
      </button>
    </section>
  );
};

export default RestTimer;