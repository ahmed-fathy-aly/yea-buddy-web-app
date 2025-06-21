import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorkoutHeader from './components/WorkoutHeader';
import MessageDisplay from './components/MessageDisplay';
import GymTimer from './components/GymTimer';
import RestTimer from './components/RestTimer';
import SuggestWorkoutSection from './components/SuggestWorkoutSection';
import TodayWorkoutDisplay from './components/TodayWorkoutDisplay';
import WorkoutFooter from './components/WorkoutFooter';
import BackToRestTimerButton from './components/BackToRestTimerButton';

const App = () => {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const saveTimerRef = useRef(null);

  const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

  // Fetch today's workout from backend
  const fetchTodayWorkout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/today`);
      if (!response.ok) {
        if (response.status === 404) {
          setTodayWorkout(null);
          const todayDate = new Date().toDateString();
          setMessage(`AIN'T NOTHIN' BUT A PEANUT! No workout logged for today (${todayDate}). Hit that 'Get New Workout Plan' button, YEAH BUDDY!`);
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch today\'s workout.');
        }
      } else {
        const data = await response.json();
        setTodayWorkout(data);
        setMessage('');
      }
    } catch (err) {
      console.error('Error fetching today\'s workout:', err);
      setError(`STRANGE! Error loading today's workout: ${err.message}. Make sure the backend is FIRED UP and ready to go!`);
      setTodayWorkout(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Save workout changes (sets/reps/weights)
  const saveWorkoutChanges = useCallback(async (workoutToSave) => {
    if (!workoutToSave || !workoutToSave.id) {
      setError('NO WORKOUT LOADED! Can\'t save what ain\'t there!');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('Saving your GAINS...');
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/${workoutToSave.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutToSave),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save workout changes.');
      }

      setMessage('WORKOUT SAVED! YEAH BUDDY! Ain\'t nothin\' but a peanut!');
    } catch (err) {
      console.error('Error saving workout changes:', err);
      setError(`STRANGE! Failed to save your changes: ${err.message}. Check console, Light Weight!`);
      setMessage('Failed to save changes. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Handle set change from ExerciseBlock/SetRow
  const handleSetChange = useCallback((exIndex, setIndex, field, value) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setTodayWorkout(prevWorkout => {
      if (!prevWorkout) return prevWorkout;
      const updatedWorkout = JSON.parse(JSON.stringify(prevWorkout));
      updatedWorkout.exercises[exIndex].sets[setIndex][field] = value;

      saveTimerRef.current = setTimeout(() => {
        saveWorkoutChanges(updatedWorkout);
      }, 500);

      return updatedWorkout;
    });
  }, [saveWorkoutChanges]);

  // Fetch today's workout on mount
  useEffect(() => {
    fetchTodayWorkout();
  }, [fetchTodayWorkout]);

  // Ref for scrolling to RestTimer
  const restTimerRef = useRef(null);

  const scrollToRestTimer = useCallback(() => {
    if (restTimerRef.current) {
      restTimerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      restTimerRef.current.classList.add('animate-pulse');
      setTimeout(() => restTimerRef.current.classList.remove('animate-pulse'), 1000);
    }
  }, []);

  // Refs for each set row
  const setRefs = useRef({});

  // Function to scroll to the first empty set
  const scrollToFirstEmptySet = useCallback(() => {
    if (!todayWorkout) return;
    for (let exIndex = 0; exIndex < todayWorkout.exercises.length; exIndex++) {
      const exercise = todayWorkout.exercises[exIndex];
      for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
        const set = exercise.sets[setIndex];
        // Adjust the fields as per your data structure (e.g., reps, weight)
        if (!set.reps || !set.weight) {
          const refKey = `${exIndex}-${setIndex}`;
          const setRow = setRefs.current[refKey];
          if (setRow && setRow.scrollIntoView) {
            setRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setRow.classList.add('animate-pulse');
            setTimeout(() => setRow.classList.remove('animate-pulse'), 1000);
          }
          return;
        }
      }
    }
  }, [todayWorkout]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100">
      <WorkoutHeader />
      <main className="w-full max-w-3xl bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-xl border border-zinc-700">
        <MessageDisplay loading={loading} error={error} message={message} />
        <GymTimer />
        <div ref={restTimerRef}>
          <RestTimer scrollToFirstEmptySet={scrollToFirstEmptySet} />
        </div>
        <SuggestWorkoutSection />
        <TodayWorkoutDisplay
          todayWorkout={todayWorkout}
          loading={loading}
          error={error}
          handleSetChange={handleSetChange}
          setRefs={setRefs}
        />
      </main>
      <WorkoutFooter />
      <BackToRestTimerButton onClick={scrollToRestTimer} />
    </div>
  );
};

export default App;