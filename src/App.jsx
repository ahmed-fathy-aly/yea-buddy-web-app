import React, { useState, useEffect, useCallback, useRef } from 'react';

// Main App component
const App = () => {
  // State to store today's workout data
  const [todayWorkout, setTodayWorkout] = useState(null);
  // State for loading indicators
  const [loading, setLoading] = useState(false);
  // State for error messages
  const [error, setError] = useState(null);
  // State for additional input to the AI (for main workout suggestion)
  const [additionalInput, setAdditionalInput] = useState('');
  // State for user messages/feedback
  const [message, setMessage] = useState('');
  // Ref for the save debounce timer
  const saveTimerRef = useRef(null);

  // Timer states
  const [timerActive, setTimerActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const timerIntervalRef = useRef(null); // Ref to hold the interval ID

  // Exercise Tips Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exerciseTips, setExerciseTips] = useState('');
  const [fetchingTips, setFetchingTips] = useState(false);
  const [exerciseTipsError, setExerciseTipsError] = useState(null);
  const [tipsAdditionalInput, setTipsAdditionalInput] = useState(''); // Input for exercise tips prompt within modal
  const [currentTipsExerciseId, setCurrentTipsExerciseId] = useState(null); // Stores ID of exercise currently being tipped

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
  };

  // Function to save changes to the current workout - now called internally
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

  // Handler for changes in reps or weight input fields for a set
  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    const updatedWorkout = JSON.parse(JSON.stringify(todayWorkout));
    updatedWorkout.exercises[exerciseIndex].sets[setIndex][field] = value;
    setTodayWorkout(updatedWorkout);

    saveTimerRef.current = setTimeout(() => {
      saveWorkoutChanges(updatedWorkout);
    }, 500);
  };

  // Timer logic
  const startTimer = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          proceedWithTimerStart();
        } else {
          console.warn('Notification permission denied.');
          setMessage('Notification permission denied. Timer will still run, but you won\'t hear me!');
          proceedWithTimerStart();
        }
      });
    } else if (Notification.permission === 'granted') {
      proceedWithTimerStart();
    } else {
      setMessage('Notifications are blocked by your browser settings. Timer will still run, but you won\'t hear me!');
      proceedWithTimerStart();
    }
  };

  const proceedWithTimerStart = () => {
    const endTime = Date.now() + TOTAL_TIMER_DURATION * 1000;
    localStorage.setItem(LOCAL_STORAGE_TIMER_KEY, endTime);
    setTimerActive(true);
    setMessage(`Rest timer SET! ${TOTAL_TIMER_DURATION / 60} minutes, AIN'T NOTHIN' BUT A PEANUT!`);
  };

  const resetTimer = () => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setTimerActive(false);
    setTimeRemaining(0);
    localStorage.removeItem(LOCAL_STORAGE_TIMER_KEY);
    setMessage('Timer RESET! Let\'s go!');
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
          setMessage('IT\'S OVER! YEAH BUDDY! TIME TO WORK!');
          if (Notification.permission === 'granted') {
            new Notification('Workout Timer', {
              body: 'YOUR REST IS OVER! LIGHT WEIGHT!',
              icon: 'https://placehold.co/60x60/00FF00/FFFFFF?text=💪'
            });
          }
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
        resetTimer();
      }
    } else {
      setTimeRemaining(TOTAL_TIMER_DURATION);
    }
  }, []);

  // Fetch today's workout when the component mounts
  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  // Function to fetch exercise-specific tips
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
      console.error('Error fetching exercise tips:', err);
      setExerciseTipsError(`ERROR! Couldn't get those tips: ${err.message}. Try again, YEAH BUDDY!`);
    } finally {
      setFetchingTips(false);
    }
  }, [API_BASE_URL, tipsAdditionalInput]);

  const closeModal = () => {
    setIsModalOpen(false);
    setExerciseTips('');
    setTipsAdditionalInput('');
    setExerciseTipsError(null);
    setCurrentTipsExerciseId(null);
    setFetchingTips(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6 font-sans text-gray-800">
      <header className="w-full max-w-3xl bg-white text-gray-800 p-6 sm:p-8 rounded-lg shadow-md mb-8 text-center border border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight text-blue-600">
          <i className="fas fa-dumbbell mr-3 text-blue-400"></i> Yea Buddy
        </h1>
        <p className="text-lg sm:text-xl font-light opacity-90 text-gray-600">Light Weight</p>
      </header>

      <main className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200">
        {loading && (
          <div className="flex items-center justify-center p-4 my-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-xl text-blue-600">LOADING THOSE GAINS!</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-5 py-4 rounded-lg relative mb-6 shadow-sm text-center" role="alert">
            <strong className="font-bold text-lg">FAILURE!</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}

        {message && (
          <div className={`px-5 py-4 rounded-lg relative mb-6 shadow-sm text-center ${message.includes('SAVED') || message.includes('OVER') ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-yellow-100 border border-yellow-400 text-yellow-700'}`} role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        {/* Timer Section */}
        <section className="mb-10 p-6 bg-gray-100 rounded-lg shadow-md border border-gray-200 text-center">
            <h2 className="text-3xl font-bold mb-5 text-blue-600">Rest Timer, AIN'T NOTHIN' BUT A PEANUT!</h2>
            <div className="text-6xl font-extrabold text-blue-700 mb-5 border-2 border-dashed border-blue-400 rounded-lg p-4 inline-block min-w-[180px] select-none">
                {formatTime(timeRemaining)}
            </div>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                    onClick={startTimer}
                    disabled={timerActive}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                    <i className="fas fa-play mr-2"></i> START THIS SET!
                </button>
                <button
                    onClick={resetTimer}
                    disabled={!timerActive && timeRemaining === TOTAL_TIMER_DURATION}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
                >
                    <i className="fas fa-stop mr-2"></i> RESET THIS MOTHAF****!
                </button>
            </div>
        </section>


        {/* Suggest Workout Section */}
        <section className="mb-10 p-6 bg-gray-100 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-3xl font-bold mb-5 text-center text-blue-600">GET YOUR DAILY BEAST MODE ON!</h2>
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base"
            rows="4"
            placeholder="YEAH BUDDY! Tell me what you want: 'LIGHT WEIGHT! UPPER BODY! NO SLEEP!' Or leave it blank for a surprise!"
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
          ></textarea>
          <button
            onClick={suggestNewWorkout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                GENERATING MASS...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-3"></i> GET NEW WORKOUT PLAN, LIGHT WEIGHT!
              </>
            )}
          </button>
        </section>

        {/* Today's Workout Display */}
        <section>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-blue-600">
            <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>TODAY'S <span className="text-blue-700">MASSIVE WORKOUT!</span>
          </h2>
          {todayWorkout ? (
            <div className="border border-blue-300 p-6 rounded-lg bg-white shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">{todayWorkout.title}</h3>
              {todayWorkout.subtitle && <p className="text-gray-600 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
              {todayWorkout.ai_tips && (
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-md mb-6 shadow-sm text-sm sm:text-base">
                  <p className="font-bold mb-1">🧠 AI INSIGHTS, YEAH BUDDY!</p>
                  <p>{todayWorkout.ai_tips}</p>
                </div>
              )}

              {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
                todayWorkout.exercises.map((exercise, exIndex) => (
                  <div key={exIndex} className="bg-gray-50 p-5 rounded-lg shadow-md mb-5 border border-gray-200">
                    <h4 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-3">{exercise.name}</h4>
                    <p className="text-sm text-gray-600 mb-1">Target Muscles: <span className="font-medium">{exercise.target_muscles || 'N/A'}</span></p>
                    <p className="text-sm text-gray-600 mb-1">Machine: <span className="font-medium">{exercise.machine || 'N/A'}</span></p>
                    {exercise.attachments && <p className="text-sm text-gray-600">Attachments: <span className="font-medium">{exercise.attachments}</span></p>}

                    <div className="mt-4">
                      <p className="font-bold text-gray-700 mb-2 text-lg">Sets:</p>
                      {exercise.sets && exercise.sets.length > 0 ? (
                        <div className="space-y-3">
                          {exercise.sets.map((set, setIndex) => (
                            <div key={setIndex} className="bg-white p-4 rounded-md border border-gray-300 shadow-inner">
                              {/* Controls (reps, weight, unit) */}
                              <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
                                <span className="font-semibold text-gray-700 text-base mb-2 sm:mb-0 sm:mr-4 w-full sm:w-auto">Set {setIndex + 1}:</span>
                                
                                <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                                  <label htmlFor={`reps-${exIndex}-${setIndex}`} className="sr-only">Reps</label>
                                  {/* Reps +/- buttons */}
                                  <div className="flex items-center">
                                      <button
                                          onClick={() => handleSetChange(exIndex, setIndex, 'reps', Math.max(0, (set.reps || 0) - 1))}
                                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
                                          aria-label="Decrease reps"
                                      >
                                          -
                                      </button>
                                      <input
                                          id={`reps-${exIndex}-${setIndex}`}
                                          type="number"
                                          step="1"
                                          min="0"
                                          className="w-16 p-2 mx-1 border border-gray-400 rounded-md bg-gray-100 text-gray-800 text-center text-base focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                          value={set.reps}
                                          onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                                          aria-label={`Reps for ${exercise.name} Set ${setIndex + 1}`}
                                      />
                                      <button
                                          onClick={() => handleSetChange(exIndex, setIndex, 'reps', (set.reps || 0) + 1)}
                                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
                                          aria-label="Increase reps"
                                      >
                                          +
                                      </button>
                                  </div>
                                  <span className="text-gray-600 ml-2 text-base">reps</span>
                                </div>
                                <div className="flex items-center">
                                  <label htmlFor={`weight-${exIndex}-${setIndex}`} className="sr-only">Weight</label>
                                  <input
                                    id={`weight-${exIndex}-${setIndex}`}
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    className="w-28 p-2 border border-gray-400 rounded-md bg-gray-100 text-gray-800 text-center text-base focus:ring-1 focus:ring-blue-500"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                                    aria-label={`Weight for ${exercise.name} Set ${setIndex + 1}`}
                                  />
                                  {/* Unit Selector */}
                                  <label htmlFor={`unit-${exIndex}-${setIndex}`} className="sr-only">Unit</label>
                                  <select
                                    id={`unit-${exIndex}-${setIndex}`}
                                    className="w-20 p-2 border border-gray-400 rounded-md bg-gray-100 text-gray-800 text-center text-base focus:ring-1 focus:ring-blue-500 appearance-none pl-2 pr-2 ml-2"
                                    value={set.unit}
                                    onChange={(e) => handleSetChange(exIndex, setIndex, 'unit', e.target.value)}
                                    aria-label={`Unit for ${exercise.name} Set ${setIndex + 1}`}
                                  >
                                    <option value="kg">kg</option>
                                    <option value="lbs">lbs</option>
                                  </select>
                                </div>
                              </div> {/* End of flex row for controls */}

                             {/* AI Tips for Set - moved here, below the controls */}
                              {set.ai_tips && (
                                <p className="text-xs sm:text-sm text-blue-600 italic mt-2 w-full">
                                  <span className="font-semibold">Tip:</span> {set.ai_tips}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm italic">NO SETS! COME ON, WE GOTTA GET SOME SETS IN!</p>
                      )}
                    </div>
                    {/* "Get Tips" button moved inside each exercise block */}
                    {exercise.id && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => getExerciseTips(exercise.id)}
                                disabled={fetchingTips}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
                            >
                                <i className="fas fa-lightbulb mr-2"></i> GET TIPS FOR THIS EXERCISE, YEAH BUDDY!
                            </button>
                        </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-center text-lg mt-8">
                  NO EXERCISES TODAY! LIGHT WEIGHT! Hit that "Get New Workout Plan" button and LET'S GO!
                  <br />
                  (Looking for workout for today: {new Date().toDateString()})
                </p>
              )}
            </div>
          ) : (
            !loading && !error && (
              <p className="text-center text-gray-600 text-lg mt-8">
                NO WORKOUT LOADED! WE NEED A PLAN! Hit that "Get New Workout Plan" button, LIGHT WEIGHT!
                <br />
                (Looking for workout for today: {new Date().toDateString()})
              </p>
            )
          )}
        </section>
      </main>

      <footer className="w-full max-w-3xl text-center mt-12 p-4 text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Yea Buddy! All rights reserved.</p>
        <p className="mt-1">POWERED BY GEMINI AI, YEAH BUDDY!</p>
      </footer>

      {/* Full-screen Dialog (Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-600">EXERCISE TIPS, LIGHT WEIGHT!</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 transition-colors duration-200"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <textarea
                className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-1 focus:ring-blue-500 transition duration-300 ease-in-out resize-y mb-4"
                rows="3"
                placeholder="GOT A QUESTION? ASK ME! 'HOW DO I SQUAT HEAVY, YEAH BUDDY?!'"
                value={tipsAdditionalInput}
                onChange={(e) => setTipsAdditionalInput(e.target.value)}
            ></textarea>
            <button
                onClick={() => getExerciseTips(currentTipsExerciseId)}
                disabled={fetchingTips || !currentTipsExerciseId}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-md mb-4"
            >
                {fetchingTips ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        GETTING THOSE TIPS...
                    </>
                ) : (
                    <>
                        <i className="fas fa-sync-alt mr-2"></i> REGENERATE TIPS, AIN'T NOTHIN' BUT A PEANUT!
                    </>
                )}
            </button>
            {fetchingTips && <p className="text-blue-600 text-center mb-4">GETTING THE KNOWLEDGE!</p>}
            {exerciseTipsError && (
              <p className="text-red-700 text-center mb-4">{exerciseTipsError}</p>
            )}
            <div className="bg-gray-100 p-4 rounded-md border border-gray-200 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
              {exerciseTips || (fetchingTips ? "LOADING THOSE SWEET, SWEET TIPS!" : "NO TIPS YET! ASK ME SOMETHING, LIGHT WEIGHT!")}
            </div>
            <div className="flex justify-end mt-4">
                <button
                    onClick={closeModal}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
                >
                    CLOSE IT! YEAH BUDDY!
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
