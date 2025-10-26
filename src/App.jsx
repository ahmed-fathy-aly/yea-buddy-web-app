import React, { useState, useEffect, useCallback, useRef } from 'react';
import MessageDisplay from './components/MessageDisplay';
import RestTimerButton from './components/RestTimerButton';
import SuggestWorkoutSection from './components/SuggestWorkoutSection';
import TodayWorkoutDisplay from './components/TodayWorkoutDisplay';
import WorkoutFooter from './components/WorkoutFooter';
import MuscleVolumeTracker from './components/MuscleVolumeTracker';

const App = () => {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [restDuration, setRestDuration] = useState(120);
  const [autoStartTimerTrigger, setAutoStartTimerTrigger] = useState(0);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const saveTimerRef = useRef(null);
  const setRefs = useRef({});

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
      
      // Auto-start rest timer when reps are entered (and value > 0)
      if (field === 'reps' && value && value > 0) {
        setAutoStartTimerTrigger(prev => prev + 1);
      }
      
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

  // Handle muscle filter toggle
  const handleMuscleToggle = useCallback((muscle) => {
    if (muscle === null) {
      // Clear all filters
      setSelectedMuscles([]);
    } else {
      setSelectedMuscles(prev => {
        if (prev.includes(muscle)) {
          // Remove muscle from selection
          return prev.filter(m => m !== muscle);
        } else {
          // Add muscle to selection
          return [...prev, muscle];
        }
      });
    }
  }, []);

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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-bg"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Main Content Container */}
        <main className="w-full max-w-4xl glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-cyan-500/20 relative z-10 backdrop-blur-xl">
          {/* AI Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-3 mb-4">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                <span className="whitespace-nowrap">NEURAL</span>
                <br className="sm:hidden" />
                <span className="sm:ml-2 whitespace-nowrap">WORKOUT MATRIX</span>
              </h1>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            <p className="text-cyan-300/80 text-sm font-mono tracking-wider">
              AI-POWERED FITNESS OPTIMIZATION SYSTEM v2.0
            </p>
          </div>

          <MessageDisplay loading={loading} error={error} message={message} />
          
          <SuggestWorkoutSection onWorkoutSuggested={fetchTodayWorkout} />

          {/* Muscle Volume Tracker */}
          {todayWorkout && (
            <MuscleVolumeTracker 
              workout={todayWorkout} 
              selectedMuscles={selectedMuscles}
              onMuscleToggle={handleMuscleToggle}
            />
          )}

          <TodayWorkoutDisplay
            todayWorkout={todayWorkout}
            loading={loading}
            error={error}
            handleSetChange={handleSetChange}
            setRefs={setRefs}
            refreshWorkout={fetchTodayWorkout}
            selectedMuscles={selectedMuscles}
          />
        </main>
        <WorkoutFooter />
      </div>
      <RestTimerButton
        onRestOver={scrollToFirstEmptySet}
        restDuration={restDuration}
        autoStartTrigger={autoStartTimerTrigger}
      />
    </>
  );
};

export default App;