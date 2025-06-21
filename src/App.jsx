import React, { useState, useEffect, useCallback, useRef } from 'react';
import WorkoutHeader from './components/WorkoutHeader';
import MessageDisplay from './components/MessageDisplay';
import GymTimer from './components/GymTimer';
import RestTimer from './components/RestTimer';
import SuggestWorkoutSection from './components/SuggestWorkoutSection';
import TodayWorkoutDisplay from './components/TodayWorkoutDisplay';
import ExerciseTipsModal from './components/ExerciseTipsModal';
import WorkoutFooter from './components/WorkoutFooter';
import BackToRestTimerButton from './components/BackToRestTimerButton';

const App = () => {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [additionalInput, setAdditionalInput] = useState('');
  const [message, setMessage] = useState('');
  const saveTimerRef = useRef(null);

  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const restTimerIntervalRef = useRef(null);

  const [gymTimerActive, setGymTimerActive] = useState(false);
  const [gymStartTime, setGymStartTime] = useState(null);
  const [gymElapsedTime, setGymElapsedTime] = useState(0);
  const gymTimerIntervalRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseTips, setExerciseTips] = useState('');
  const [fetchingTips, setFetchingTips] = useState(false);
  const [exerciseTipsError, setExerciseTipsError] = useState(null);
  const [tipsAdditionalInput, setTipsAdditionalInput] = useState('');
  const [currentTipsExerciseId, setCurrentTipsExerciseId] = useState(null);

  const TOTAL_REST_DURATION = 2 * 60;
  const LOCAL_STORAGE_REST_TIMER_KEY = 'workoutRestTimerEndTime';
  const LOCAL_STORAGE_GYM_START_TIME_KEY = 'workoutGymStartTime';

  const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

  // --- Helper Functions (passed as props) ---
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
  }, [API_BASE_URL, setMessage, setError, setLoading]);

  const suggestNewWorkout = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/suggest-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additional_input: additionalInput }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to suggest workout: ${errorText}`);
      }

      setMessage('NEW WORKOUT INCOMING! Light weight, refreshing... AIN\'T NOTHIN\' BUT A PEANUT!');
      setAdditionalInput('');
      await fetchTodayWorkout();
    } catch (err) {
      console.error('Error suggesting new workout:', err);
      setError(`YEAH BUDDY! Failed to generate a plan: ${err.message}. Try again, we ain't done yet!`);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, additionalInput, fetchTodayWorkout, setMessage, setError, setLoading]);

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
  }, [API_BASE_URL, setMessage, setError, setLoading]);

  const handleSetChange = useCallback((exIndex, setIndex, field, value) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const updatedWorkout = JSON.parse(JSON.stringify(todayWorkout));
    updatedWorkout.exercises[exIndex].sets[setIndex][field] = value;
    setTodayWorkout(updatedWorkout);

    saveTimerRef.current = setTimeout(() => {
      saveWorkoutChanges(updatedWorkout);
    }, 500);
  }, [todayWorkout, saveWorkoutChanges]);

  const startRestTimer = useCallback(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          proceedWithRestTimerStart();
        } else {
          setMessage('Notification permission denied. Timer will still run, but you won\'t hear me!');
          proceedWithRestTimerStart();
        }
      });
    } else if (Notification.permission === 'granted') {
      proceedWithRestTimerStart();
    } else {
      setMessage('Notifications are blocked by your browser settings. Timer will still run, but you won\'t hear me!');
      proceedWithRestTimerStart();
    }
  }, [TOTAL_REST_DURATION, setMessage, setTimerActive]);

  const proceedWithRestTimerStart = useCallback(() => {
    const endTime = Date.now() + TOTAL_REST_DURATION * 1000;
    localStorage.setItem(LOCAL_STORAGE_REST_TIMER_KEY, endTime);
    setTimerActive(true);
    setMessage(`Rest timer SET! ${TOTAL_REST_DURATION / 60} minutes, AIN'T NOTHIN' BUT A PEANUT!`);
  }, [TOTAL_REST_DURATION, LOCAL_STORAGE_REST_TIMER_KEY, setMessage, setTimerActive]);

  const resetRestTimer = useCallback(() => {
    clearInterval(restTimerIntervalRef.current);
    restTimerIntervalRef.current = null;
    setTimerActive(false);
    setTimeRemaining(0);
    localStorage.removeItem(LOCAL_STORAGE_REST_TIMER_KEY);
    setMessage('Rest Timer RESET! Let\'s go!');
  }, [restTimerIntervalRef, setTimerActive, setTimeRemaining, LOCAL_STORAGE_REST_TIMER_KEY, setMessage]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const displayMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const startGymWorkoutTimer = useCallback(() => {
    const startTime = Date.now();
    localStorage.setItem(LOCAL_STORAGE_GYM_START_TIME_KEY, startTime);
    setGymStartTime(startTime);
    setGymTimerActive(true);
    setMessage('WORKOUT STARTED! LIGHT WEIGHT! LET\'S GET THIS BREAD!');
  }, [LOCAL_STORAGE_GYM_START_TIME_KEY, setGymStartTime, setGymTimerActive, setMessage]);

  const endGymWorkoutTimer = useCallback(() => {
    if (gymTimerIntervalRef.current) {
      clearInterval(gymTimerIntervalRef.current);
    }
    setGymTimerActive(false);
    localStorage.removeItem(LOCAL_STORAGE_GYM_START_TIME_KEY);
    setMessage(`WORKOUT ENDED! Total time: ${formatTime(gymElapsedTime)}. YEAH BUDDY!`);
  }, [gymTimerIntervalRef, setGymTimerActive, LOCAL_STORAGE_GYM_START_TIME_KEY, setMessage, formatTime, gymElapsedTime]);

  const getExerciseTips = useCallback(async (exerciseId) => {
    setCurrentTipsExerciseId(exerciseId);
    setFetchingTips(true);
    setExerciseTipsError(null);
    setExerciseTips('');
    setIsModalOpen(true);

    try {
      const response = await fetch(`${API_BASE_URL}/exercise-tips/${exerciseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additional_input: tipsAdditionalInput }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch exercise tips: ${errorText}`);
      }

      const tips = await response.text();
      setExerciseTips(tips);
    } catch (err) {
      setExerciseTipsError(`ERROR! Couldn't get those tips: ${err.message}. Try again, YEAH BUDDY!`);
    } finally {
      setFetchingTips(false);
    }
  }, [API_BASE_URL, tipsAdditionalInput, setCurrentTipsExerciseId, setFetchingTips, setExerciseTipsError, setExerciseTips, setIsModalOpen]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setExerciseTips('');
    setTipsAdditionalInput('');
    setExerciseTipsError(null);
    setCurrentTipsExerciseId(null);
    setFetchingTips(false);
  }, [setIsModalOpen, setExerciseTips, setTipsAdditionalInput, setExerciseTipsError, setCurrentTipsExerciseId, setFetchingTips]);

  const calculateWorkoutProgress = useCallback(() => {
    if (!todayWorkout || !todayWorkout.exercises || todayWorkout.exercises.length === 0) {
      return { completedSets: 0, totalSets: 0, progressPercentage: 0 };
    }

    let totalSets = 0;
    let completedSets = 0;

    todayWorkout.exercises.forEach(exercise => {
      if (exercise.sets) {
        totalSets += exercise.sets.length;
        completedSets += exercise.sets.filter(set => set.reps > 0).length;
      }
    });

    const progressPercentage = totalSets > 0 ? Math.floor((completedSets / totalSets) * 100) : 0;
    return { completedSets, totalSets, progressPercentage };
  }, [todayWorkout]);

  const { completedSets, totalSets, progressPercentage } = calculateWorkoutProgress();

  const scrollToFirstEmptySet = useCallback(() => {
    if (!todayWorkout || !todayWorkout.exercises) return;

    for (let exIndex = 0; exIndex < todayWorkout.exercises.length; exIndex++) {
      const exercise = todayWorkout.exercises[exIndex];
      if (exercise.sets) {
        for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
          const set = exercise.sets[setIndex];
          if (set.reps === 0) {
            const setId = `set-${exIndex}-${setIndex}`;
            const element = document.getElementById(setId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.classList.add('animate-pulse');
              setTimeout(() => element.classList.remove('animate-pulse'), 1000);
              return;
            }
          }
        }
      }
    }
    setMessage('ALL SETS COMPLETE! TIME TO REST, YEAH BUDDY!');
    resetRestTimer();
  }, [todayWorkout, resetRestTimer, setMessage]);

  // --- Timer Logic ---
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        const now = Date.now();
        const endTime = localStorage.getItem(LOCAL_STORAGE_REST_TIMER_KEY);
        if (endTime) {
          const newTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
          setTimeRemaining(newTimeRemaining);
          if (newTimeRemaining === 0) {
            resetRestTimer();
            setMessage('IT\'S OVER! YEAH BUDDY! TIME TO WORK!');
            if (Notification.permission === 'granted') {
              new Notification('Workout Timer', {
                body: 'YOUR REST IS OVER! LIGHT WEIGHT!',
                icon: 'https://placehold.co/60x60/00FF00/FFFFFF?text=💪'
              });
            }
          }
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, resetRestTimer, LOCAL_STORAGE_REST_TIMER_KEY]);

  useEffect(() => {
    const storedEndTime = localStorage.getItem(LOCAL_STORAGE_REST_TIMER_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime);
      const now = Date.now();
      const calculatedTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));
      if (calculatedTimeRemaining > 0) {
        setTimeRemaining(calculatedTimeRemaining);
        setTimerActive(true);
      } else {
        resetRestTimer();
      }
    } else {
      setTimeRemaining(TOTAL_REST_DURATION);
    }
  }, [LOCAL_STORAGE_REST_TIMER_KEY, TOTAL_REST_DURATION, resetRestTimer]);

  useEffect(() => {
    if (gymTimerActive && gymStartTime !== null) {
      const interval = setInterval(() => {
        setGymElapsedTime(Math.floor((Date.now() - gymStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gymTimerActive, gymStartTime]);

  useEffect(() => {
    const storedStartTime = localStorage.getItem(LOCAL_STORAGE_GYM_START_TIME_KEY);
    if (storedStartTime) {
      const startTime = parseInt(storedStartTime);
      const now = Date.now();
      const calculatedElapsedTime = Math.floor((now - startTime) / 1000);
      setGymStartTime(startTime);
      setGymElapsedTime(calculatedElapsedTime);
      setGymTimerActive(true);
    }
  }, [LOCAL_STORAGE_GYM_START_TIME_KEY, setGymStartTime, setGymElapsedTime, setGymTimerActive]);

  useEffect(() => {
    fetchTodayWorkout();
  }, [fetchTodayWorkout]);

  // Add a ref for the RestTimer section
  const restTimerRef = useRef(null);

  // Function to scroll to RestTimer
  const scrollToRestTimer = useCallback(() => {
    if (restTimerRef.current) {
      restTimerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      restTimerRef.current.classList.add('animate-pulse');
      setTimeout(() => restTimerRef.current.classList.remove('animate-pulse'), 1000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100">
      <WorkoutHeader />
      <main className="w-full max-w-3xl bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-xl border border-zinc-700">
        <MessageDisplay loading={loading} error={error} message={message} />
        <GymTimer 
          gymTimerActive={gymTimerActive} 
          gymElapsedTime={gymElapsedTime} 
          startGymWorkoutTimer={startGymWorkoutTimer} 
          endGymWorkoutTimer={endGymWorkoutTimer} 
          formatTime={formatTime} 
        />
        {/* Attach the ref here */}
        <div ref={restTimerRef}>
          <RestTimer 
            timerActive={timerActive} 
            timeRemaining={timeRemaining} 
            startRestTimer={startRestTimer} 
            resetRestTimer={resetRestTimer} 
            formatTime={formatTime} 
            TOTAL_REST_DURATION={TOTAL_REST_DURATION} 
            scrollToFirstEmptySet={scrollToFirstEmptySet} 
          />
        </div>
        <SuggestWorkoutSection 
          loading={loading} 
          additionalInput={additionalInput} 
          setAdditionalInput={setAdditionalInput} 
          suggestNewWorkout={suggestNewWorkout} 
        />
        <TodayWorkoutDisplay 
          todayWorkout={todayWorkout} 
          loading={loading} 
          error={error} 
          fetchingTips={fetchingTips} 
          getExerciseTips={getExerciseTips} 
          handleSetChange={handleSetChange} 
          completedSets={completedSets} 
          totalSets={totalSets} 
          progressPercentage={progressPercentage} 
        />
      </main>
      <ExerciseTipsModal 
        isModalOpen={isModalOpen} 
        closeModal={closeModal} 
        tipsAdditionalInput={tipsAdditionalInput} 
        setTipsAdditionalInput={setTipsAdditionalInput} 
        currentTipsExerciseId={currentTipsExerciseId} 
        getExerciseTips={getExerciseTips} 
        fetchingTips={fetchingTips} 
        exerciseTipsError={exerciseTipsError} 
        exerciseTips={exerciseTips} 
      />
      <WorkoutFooter />
      {/* Floating Button */}
      <BackToRestTimerButton onClick={scrollToRestTimer} />
    </div>
  );
};

export default App;