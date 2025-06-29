import React, { useState, useEffect, useCallback, useRef } from 'react';
import MessageDisplay from './components/MessageDisplay';
import RestTimerButton from './components/RestTimerButton';
import SuggestWorkoutSection from './components/SuggestWorkoutSection';
import TodayWorkoutDisplay from './components/TodayWorkoutDisplay';
import WorkoutFooter from './components/WorkoutFooter';
import WorkoutProgressBar from './components/WorkoutProgressBar';

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

  // Calculate completed/total sets
  const completedSets = todayWorkout
    ? todayWorkout.exercises.reduce(
        (acc, ex) =>
          acc +
          ex.sets.filter((set) => set.reps && set.weight).length,
        0
      )
    : 0;
  const totalSets = todayWorkout
    ? todayWorkout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)
    : 0;

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
      <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100 pt-16">
        <main className="w-full max-w-3xl bg-zinc-800 p-6 sm:p-8 rounded-xl shadow-xl border border-zinc-700">
          <MessageDisplay loading={loading} error={error} message={message} />
          {/* <div className="w-full mb-4">
            <GymTimer key={JSON.stringify(todayWorkout)} todayWorkout={todayWorkout} />
          </div> */}
          <SuggestWorkoutSection onWorkoutSuggested={fetchTodayWorkout} />

          {/* Suggest Rest Time Section */}
          <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
            <h2 className="text-3xl font-bold mb-5 text-center text-lime-400">SUGGEST REST TIME</h2>
            <textarea
              className="w-full p-4 border border-lime-500 rounded-lg bg-zinc-950 text-lime-200 placeholder-lime-400 focus:ring-2 focus:ring-lime-400 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base"
              rows="3"
              placeholder="Describe your workout or needs for rest... (e.g. 'Heavy legs day', 'Supersets', etc.)"
              value={restInput}
              onChange={e => setRestInput(e.target.value)}
              disabled={restLoading}
            ></textarea>
            <button
              className="w-full bg-lime-400 hover:bg-lime-500 text-zinc-900 font-extrabold py-3.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide"
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-lime-700 mr-3"></div>
                  SUGGESTING REST...
                </>
              ) : (
                <>
                  <i className="fas fa-bed mr-3 text-lime-700"></i> SUGGEST REST TIME
                </>
              )}
            </button>
            {restError && <div className="text-lime-300 mt-2">{restError}</div>}
          </section>

          <TodayWorkoutDisplay
            todayWorkout={todayWorkout}
            loading={loading}
            error={error}
            handleSetChange={handleSetChange}
            setRefs={setRefs}
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