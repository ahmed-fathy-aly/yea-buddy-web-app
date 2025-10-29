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
  const [selectedDay, setSelectedDay] = useState(() => {
    // Default to today in yyyy-mm-dd format
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const saveTimerRef = useRef(null);
  const setRefs = useRef({});

  const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

  // Fetch workout for selected day from backend
  const fetchTodayWorkout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert selectedDay (yyyy-mm-dd) to Date string format expected by backend
      const dateObj = new Date(selectedDay + 'T00:00:00'); // Avoid timezone issues
      const dayParam = dateObj.toDateString(); // e.g., "Wed Oct 29 2025"
      
      const response = await fetch(`${API_BASE_URL}/workouts/today?day=${encodeURIComponent(dayParam)}`);
      if (!response.ok) {
        if (response.status === 404) {
          setTodayWorkout(null);
          setMessage(`AIN'T NOTHIN' BUT A PEANUT! No workout logged for selected day (${dayParam}). Hit that 'Get New Workout Plan' button, YEAH BUDDY!`);
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
      setError(`STRANGE! Error loading workout: ${err.message}. Make sure the backend is FIRED UP and ready to go!`);
      setTodayWorkout(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, selectedDay]);

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

  // Fetch workout when selectedDay changes
  useEffect(() => {
    fetchTodayWorkout();
  }, [fetchTodayWorkout, selectedDay]);

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

          {/* Day Selector */}
          <div className="mb-6">
            <div className="glass-card p-4 sm:p-6 rounded-xl border border-cyan-500/30 w-full">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    const currentDate = new Date(selectedDay + 'T00:00:00');
                    currentDate.setDate(currentDate.getDate() - 1);
                    setSelectedDay(currentDate.toISOString().slice(0, 10));
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-100 font-semibold text-sm rounded-lg transition-all duration-300 border border-cyan-500/30 hover:scale-105"
                  aria-label="Previous day"
                >
                  Previous
                </button>
                
                <div className="flex flex-col items-center px-4 flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="fas fa-calendar-day text-cyan-400"></i>
                    <span className="text-cyan-200 font-semibold text-xs sm:text-sm">Selected Date</span>
                  </div>
                  <div className="text-cyan-100 font-bold text-base sm:text-lg text-center">
                    {(() => {
                      const dateObj = new Date(selectedDay + 'T00:00:00');
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      dateObj.setHours(0, 0, 0, 0);
                      
                      const diffMs = today - dateObj;
                      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                      
                      const formattedDate = dateObj.toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                      });
                      
                      if (diffDays === 0) return `${formattedDate} (Today)`;
                      if (diffDays === 1) return `${formattedDate} (Yesterday)`;
                      if (diffDays === -1) return `${formattedDate} (Tomorrow)`;
                      if (diffDays > 0) return `${formattedDate} (${diffDays} days ago)`;
                      return `${formattedDate} (in ${Math.abs(diffDays)} days)`;
                    })()}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const currentDate = new Date(selectedDay + 'T00:00:00');
                    currentDate.setDate(currentDate.getDate() + 1);
                    setSelectedDay(currentDate.toISOString().slice(0, 10));
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-100 font-semibold text-sm rounded-lg transition-all duration-300 border border-cyan-500/30 hover:scale-105"
                  aria-label="Next day"
                >
                  Next
                </button>
                
                <button
                  onClick={() => {
                    setSelectedDay(new Date().toISOString().slice(0, 10));
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600/50 hover:bg-purple-500/50 text-purple-100 font-semibold text-sm rounded-lg transition-all duration-300 border border-purple-500/30 hover:scale-105"
                  aria-label="Go to today"
                >
                  Today
                </button>
              </div>
            </div>
          </div>

          <MessageDisplay loading={loading} error={error} message={message} />
          
          <SuggestWorkoutSection onWorkoutSuggested={fetchTodayWorkout} selectedDay={selectedDay} />

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
            selectedDay={selectedDay}
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