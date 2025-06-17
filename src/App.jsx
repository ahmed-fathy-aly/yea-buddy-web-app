import React, { useState, useEffect, useCallback, useRef } from 'react';

// Main App component
const App = () => {
  // State to store today's workout data
  const [todayWorkout, setTodayWorkout] = useState(null);
  // State for loading indicators
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for additional input to the AI
  const [additionalInput, setAdditionalInput] = useState('');
  // State for user messages/feedback
  const [message, setMessage] = useState('');
  // Ref for the save debounce timer
  const saveTimerRef = useRef(null);

  // Timer states
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const timerIntervalRef = useRef(null); // Ref to hold the interval ID

  // Constants for timer
  const TOTAL_TIMER_DURATION = 2 * 60; // 2 minutes in seconds
  const LOCAL_STORAGE_TIMER_KEY = 'workoutTimerEndTime';

  // Base URL for your backend API
  const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

  // Function to fetch today's workout
  const fetchTodayWorkout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch workout data for today from the backend
      const response = await fetch(`${API_BASE_URL}/workouts/today`);
      if (!response.ok) {
        // If no workout found for today, set workout to null and message
        if (response.status === 404) {
          setTodayWorkout(null);
          setMessage("No workout found for today. Click 'Suggest New Workout' to get one!");
        } else {
          const errData = await response.json();
          throw new Error(errData.message || 'Failed to fetch today\'s workout.');
        }
      } else {
        // Parse and set the fetched workout data
        const data = await response.json();
        setTodayWorkout(data);
        setMessage(''); // Clear any previous messages
      }
    } catch (err) {
      console.error('Error fetching today\'s workout:', err);
      setError(`Error: ${err.message}`);
      setTodayWorkout(null); // Clear workout on error
    } finally {
      setLoading(false);
    }
  };

  // Function to suggest a new workout using the Gemini API
  const suggestNewWorkout = async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/suggest-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ additional_input: additionalInput }), // Send additional input
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for better error debugging
        throw new Error(`Failed to suggest workout: ${errorText}`);
      }

      setMessage('New workout suggested and saved! Refreshing...');
      setAdditionalInput(''); // Clear input field
      await fetchTodayWorkout(); // Refetch workout after suggestion to display the new one
    } catch (err) {
      console.error('Error suggesting new workout:', err);
      setError(`Error suggesting workout: ${err.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  // Function to save changes to the current workout - now called internally
  const saveWorkoutChanges = useCallback(async (workoutToSave) => {
    if (!workoutToSave || !workoutToSave.id) {
      setError('No workout loaded to save changes for.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage('Saving changes...');
    try {
      const response = await fetch(`${API_BASE_URL}/workouts/${workoutToSave.id}`, {
        method: 'PUT', // Use PUT for updating an existing resource
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutToSave), // Send the entire updated workout object
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save workout changes.');
      }

      setMessage('Workout changes saved successfully!');
    } catch (err) {
      console.error('Error saving workout changes:', err);
      setError(`Error saving changes: ${err.message}.`);
      setMessage('Failed to save changes. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Handler for changes in reps or weight input fields for a set
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    // Clear any existing debounce timer
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // Create a deep copy of the current workout data to avoid direct state mutation
    const updatedWorkout = JSON.parse(JSON.stringify(todayWorkout));
    // Update the specific set's field with the new value
    updatedWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
    // Update the state with the modified workout data
    setTodayWorkout(updatedWorkout);

    // Set a new debounce timer to save changes after a short delay
    saveTimerRef.current = setTimeout(() => {
      saveWorkoutChanges(updatedWorkout);
    }, 500); // Save after 500ms of no further changes
  };

  // Timer logic
  const startTimer = () => {
    const endTime = Date.now() + TOTAL_TIMER_DURATION * 1000; // Calculate end time in milliseconds
    localStorage.setItem(LOCAL_STORAGE_TIMER_KEY, endTime);
    setTimerActive(true);
  };

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setTimerActive(false);
    setTimeRemaining(0);
    localStorage.removeItem(LOCAL_STORAGE_TIMER_KEY);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Effect to manage the timer countdown
  useEffect(() => {
    if (timerActive) {
      timerIntervalRef.current = setInterval(() => {
        const endTime = parseInt(localStorage.getItem(LOCAL_STORAGE_TIMER_KEY));
        const now = Date.now();
        const newTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

        setTimeRemaining(newTimeRemaining);

        if (newTimeRemaining === 0) {
          resetTimer();
          setMessage('Timer finished! Great job!');
        }
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive]);

  // Effect to initialize timer state from localStorage on mount
  useEffect(() => {
    const storedEndTime = localStorage.getItem(LOCAL_STORAGE_TIMER_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime);
      const now = Date.now();
      const calculatedTimeRemaining = Math.max(0, Math.floor((endTime - now) / 1000));

      if (calculatedTimeRemaining > 0) {
        setTimeRemaining(calculatedTimeRemaining);
        setTimerActive(true);
      } else {
        resetTimer(); // Clear stale timer data
      }
    } else {
      setTimeRemaining(TOTAL_TIMER_DURATION); // Set initial time when no timer is active
    }
  }, []); // Run only once on mount

  // Fetch today's workout when the component mounts
  useEffect(() => {
    fetchTodayWorkout();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Cleanup the debounce timer when component unmounts
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-100">
      <header className="w-full max-w-3xl bg-gradient-to-br from-green-600 to-emerald-800 text-white p-6 sm:p-8 rounded-xl shadow-2xl mb-8 text-center border border-green-700 transform hover:scale-102 transition-transform duration-300 ease-in-out">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
          <i className="fas fa-dumbbell mr-3 text-green-300"></i> AI Workout Forge
        </h1>
        <p className="text-lg sm:text-xl font-light opacity-90">Crafting Your Strength, Intelligently.</p>
      </header>

      <main className="w-full max-w-3xl bg-gray-900 p-6 sm:p-8 rounded-xl shadow-xl border border-gray-800">
        {loading && (
          <div className="flex items-center justify-center p-4 my-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-500"></div>
            <p className="ml-4 text-xl text-green-400">Forging your plan...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-5 py-4 rounded-lg relative mb-6 shadow-md text-center" role="alert">
            <strong className="font-bold text-lg">Oops!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {message && (
          <div className={`px-5 py-4 rounded-lg relative mb-6 shadow-md text-center ${message.includes('saved successfully') || message.includes('Timer finished') ? 'bg-emerald-800 border border-emerald-600 text-emerald-100' : 'bg-yellow-800 border border-yellow-600 text-yellow-100'}`} role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {/* Timer Section */}
        <section className="mb-10 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 text-center">
            <h2 className="text-3xl font-bold mb-5 text-green-300">Rest Timer</h2>
            <div className="text-6xl font-extrabold text-teal-400 mb-5 border-2 border-dashed border-teal-500 rounded-lg p-4 inline-block min-w-[180px] select-none">
                {formatTime(timeRemaining)}
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={startTimer}
                    disabled={timerActive}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                    <i className="fas fa-play mr-2"></i> Start 2 Min Timer
                </button>
                <button
                    onClick={resetTimer}
                    disabled={!timerActive && timeRemaining === TOTAL_TIMER_DURATION}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                    <i className="fas fa-stop mr-2"></i> Reset Timer
                </button>
            </div>
        </section>


        {/* Suggest Workout Section */}
        <section className="mb-10 p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-3xl font-bold mb-5 text-center text-green-300">Summon Today's Regime</h2>
          <textarea
            className="w-full p-4 border border-gray-700 rounded-lg bg-gray-950 text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base"
            rows="4"
            placeholder="e.g., 'Focus on strength, heavy squats. Avoid shoulders.' Or leave blank for a general plan."
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
          ></textarea>
          <button
            onClick={suggestNewWorkout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-extrabold py-3.5 px-6 rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Generating Power...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-3"></i> Get New Workout Plan
              </>
            )}
          </button>
        </section>

        {/* Today's Workout Display */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-green-300">
            <i className="fas fa-calendar-alt mr-2 text-emerald-400"></i>Today's <span className="text-teal-400">Workout</span>
          </h2>
          {todayWorkout ? (
            <div className="border border-emerald-700 p-6 rounded-xl bg-gray-850 shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{todayWorkout.title}</h3>
              {todayWorkout.subtitle && <p className="text-gray-300 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
              {todayWorkout.ai_tips && (
                <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-200 p-4 rounded-md mb-6 shadow-md text-sm sm:text-base">
                  <p className="font-bold mb-1">🧠 AI Insight (Workout):</p>
                  <p>{todayWorkout.ai_tips}</p>
                </div>
              )}

              {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
                todayWorkout.exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-gray-700 p-5 rounded-lg shadow-md mb-5 border border-gray-600">
                    <h4 className="text-xl sm:text-2xl font-semibold text-green-200 mb-3">{exercise.name}</h4>
                    <p className="text-sm text-gray-300 mb-1">Target Muscles: <span className="font-medium">{exercise.target_muscles || 'N/A'}</span></p>
                    <p className="text-sm text-gray-300 mb-1">Machine: <span className="font-medium">{exercise.machine || 'N/A'}</span></p>
                    {exercise.attachments && <p className="text-sm text-gray-300">Attachments: <span className="font-medium">{exercise.attachments}</span></p>}

                    <div className="mt-4">
                      <p className="font-bold text-gray-200 mb-2 text-lg">Sets:</p>
                      {exercise.sets && exercise.sets.length > 0 ? (
                        <div className="space-y-3">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="flex flex-col sm:flex-row items-start sm:items-center bg-gray-800 p-4 rounded-md border border-gray-700 shadow-inner">
                              <span className="font-semibold text-emerald-100 text-base mb-2 sm:mb-0 sm:mr-4">Set {setIndex + 1}:</span>
                              
                              <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                                <label htmlFor={`reps-${exIndex}-${setIndex}`} className="sr-only">Reps</label>
                                {/* Reps input field - now allows any number */}
                                <input
                                  id={`reps-${exIndex}-${setIndex}`}
                                  type="number"
                                  step="1"
                                  min="0"
                                  className="w-24 p-2 border border-gray-600 rounded-md bg-gray-950 text-gray-100 text-center text-base focus:ring-1 focus:ring-emerald-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  value={set.reps}
                                  onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                  aria-label={`Reps for ${exercise.name} Set ${setIndex + 1}`}
                                />
                                <span className="text-gray-300 ml-2 text-base">reps</span>
                              </div>
                              <div className="flex items-center">
                                <label htmlFor={`weight-${exIndex}-${setIndex}`} className="sr-only">Weight</label>
                                <input
                                  id={`weight-${exIndex}-${setIndex}`}
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  className="w-28 p-2 border border-gray-600 rounded-md bg-gray-950 text-gray-100 text-center text-base focus:ring-1 focus:ring-emerald-500"
                                  value={set.weight}
                                  onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                  aria-label={`Weight for ${exercise.name} Set ${setIndex + 1}`}
                                />
                                {/* Unit Selector */}
                                <label htmlFor={`unit-${exIndex}-${setIndex}`} className="sr-only">Unit</label>
                                <select
                                  id={`unit-${exIndex}-${setIndex}`}
                                  className="w-20 p-2 border border-gray-600 rounded-md bg-gray-950 text-gray-100 text-center text-base focus:ring-1 focus:ring-emerald-500 appearance-none pl-2 pr-2 ml-2" // Adjusted padding for arrow
                                  value={set.unit}
                                  onChange={(e) => handleSetChange(exIndex, setIndex, 'unit', e.target.value)}
                                  aria-label={`Unit for ${exercise.name} Set ${setIndex + 1}`}
                                >
                                  <option value="kg">kg</option>
                                  <option value="lbs">lbs</option>
                                </select>
                              </div>
                              {set.ai_tips && (
                                <p className="text-xs sm:text-sm text-blue-400 italic ml-0 sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-gray-600 sm:pl-4 w-full sm:w-auto">
                                  <span className="font-semibold">Tip:</span> {set.ai_tips}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No sets defined for this exercise.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center text-lg mt-8">No exercises found for this workout. Try suggesting one!</p>
              )}
            </div>
          ) : (
            !loading && !error && <p className="text-center text-gray-400 text-lg mt-8">Start by suggesting a workout above!</p>
          )}
        </section>
      </main>

      <footer className="w-full max-w-3xl text-center mt-12 p-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Workout Buddy. All rights reserved.</p>
        <p className="mt-1">Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;