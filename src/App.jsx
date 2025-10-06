import React, { useState, useEffect, useCallback, useRef } from 'react';
import MessageDisplay from './components/MessageDisplay';
import RestTimerButton from './components/RestTimerButton';
import SuggestWorkoutSection from './components/SuggestWorkoutSection';
import TodayWorkoutDisplay from './components/TodayWorkoutDisplay';
import WorkoutFooter from './components/WorkoutFooter';
import WorkoutProgressBar from './components/WorkoutProgressBar';
import ExerciseReplaceModal from './components/ExerciseReplaceModal';

const App = () => {
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [restDuration, setRestDuration] = useState(120);
  const [restInput, setRestInput] = useState("");
  const [restLoading, setRestLoading] = useState(false);
  const [restError, setRestError] = useState("");
  const saveTimerRef = useRef(null);
  const timerIntervalRef = useRef(null);
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

  // Calculate completed/total sets using group-based logic
  const calculateGroupBasedProgress = (workout, chosenExercises = {}) => {
    if (!workout || !workout.exercises || workout.exercises.length === 0) {
      return { completedSets: 0, totalSets: 0 };
    }

    let total = 0;
    let completed = 0;
    
    // Group all exercises
    const allGroups = {};
    workout.exercises.forEach(exercise => {
      const groupName = exercise.exercise_group || 'Ungrouped';
      if (!allGroups[groupName]) {
        allGroups[groupName] = [];
      }
      allGroups[groupName].push(exercise);
    });

    // Calculate progress for each group
    Object.entries(allGroups).forEach(([groupName, exercises]) => {
      const chosenExerciseId = chosenExercises[groupName];
      let exerciseToCount;

      if (chosenExerciseId) {
        // If an exercise is chosen, use that one
        exerciseToCount = exercises.find(ex => ex.id === chosenExerciseId);
      } else {
        // If no exercise is chosen, use the one with the maximum number of sets
        exerciseToCount = exercises.reduce((maxEx, currentEx) => {
          const maxSets = maxEx?.sets?.length || 0;
          const currentSets = currentEx?.sets?.length || 0;
          return currentSets > maxSets ? currentEx : maxEx;
        }, exercises[0]);
      }

      // Count sets from the selected exercise for this group
      if (exerciseToCount && exerciseToCount.sets) {
        total += exerciseToCount.sets.length;
        completed += exerciseToCount.sets.filter(set => set.reps > 0).length;
      }
    });

    return { completedSets: completed, totalSets: total };
  };

  const { completedSets, totalSets } = calculateGroupBasedProgress(todayWorkout);

  // Timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  const handleStartTimer = () => {
    if (!timerRunning) setTimerRunning(true);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimer(0);
  };

  return (
    <>
      <WorkoutProgressBar
        completedSets={completedSets}
        totalSets={totalSets}
        timer={timer}
        timerRunning={timerRunning}
        onStartTimer={handleStartTimer}
        onResetTimer={handleResetTimer}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 grid-bg"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>

        {/* Main Content Container */}
        <main className="w-full max-w-4xl glass-card p-6 sm:p-8 rounded-2xl shadow-2xl border border-cyan-500/20 relative z-10 mt-16 backdrop-blur-xl">
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
          {/* <div className="w-full mb-4">
            <GymTimer key={JSON.stringify(todayWorkout)} todayWorkout={todayWorkout} />
          </div> */}
          <SuggestWorkoutSection onWorkoutSuggested={fetchTodayWorkout} />

          {/* Rest Calculator Section */}
          <section className="mb-10 p-6 glass-card rounded-xl shadow-lg border border-cyan-500/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-purple-400"></div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-center text-cyan-300 flex flex-col sm:flex-row items-center justify-center gap-2">
              <i className="fas fa-brain text-cyan-400"></i>
              <span className="whitespace-nowrap">RECOVERY</span>
              <span className="whitespace-nowrap">CALCULATOR</span>
            </h2>
            <textarea
              className="w-full p-4 border border-cyan-500/30 rounded-lg bg-slate-900/50 text-cyan-100 placeholder-cyan-400/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base backdrop-blur-sm"
              rows="3"
              placeholder="Input physiological parameters for AI recovery optimization"
              value={restInput}
              onChange={e => setRestInput(e.target.value)}
              disabled={restLoading}
            ></textarea>
            <button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 font-extrabold py-3.5 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide neon-glow"
              onClick={async () => {
                setRestLoading(true);
                setRestError("");
                try {
                  const res = await fetch("https://yea-buddy-be.onrender.com/suggest-rest-time", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_input: restInput })
                  });
                  if (!res.ok) throw new Error("Failed to get rest time");
                  const data = await res.json();
                  if (typeof data.rest_time_seconds === "number") {
                    setRestDuration(data.rest_time_seconds);
                  } else {
                    setRestError("No rest time returned");
                  }
                } catch (err) {
                  setRestError("Error: " + err.message);
                } finally {
                  setRestLoading(false);
                }
              }}
              disabled={restLoading || !restInput.trim()}
            >
              {restLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-700 mr-3"></div>
                  PROCESSING...
                </>
              ) : (
                <>
                  <i className="fas fa-cog mr-3 text-slate-700"></i> CALCULATE RECOVERY
                </>
              )}
            </button>
            {restError && <div className="text-cyan-300 mt-2 font-mono">{restError}</div>}
          </section>

          <TodayWorkoutDisplay
            todayWorkout={todayWorkout}
            loading={loading}
            error={error}
            handleSetChange={handleSetChange}
            setRefs={setRefs}
            refreshWorkout={fetchTodayWorkout}
          />
        </main>
        <WorkoutFooter />
      </div>
      <RestTimerButton
        onRestOver={scrollToFirstEmptySet}
        timer={timer}
        timerRunning={timerRunning}
        onToggleTimer={() => setTimerRunning((r) => !r)}
        restDuration={restDuration}
      />
    </>
  );
};

export default App;