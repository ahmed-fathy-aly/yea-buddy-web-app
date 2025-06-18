import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- Component: WorkoutHeader ---
const WorkoutHeader = () => (
  <header className="w-full max-w-3xl bg-zinc-800 text-white p-6 sm:p-8 rounded-xl shadow-lg mb-8 text-center border border-zinc-700">
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight text-blue-400">
      <i className="fas fa-dumbbell mr-3 text-blue-300"></i> Yea Buddy
    </h1>
    <p className="text-lg sm:text-xl font-light opacity-90 text-zinc-400">Light Weight</p>
  </header>
);

// --- Component: MessageDisplay ---
const MessageDisplay = ({ loading, error, message }) => (
  <>
    {loading && (
      <div className="flex items-center justify-center p-4 my-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-blue-400">LOADING THOSE GAINS!</p>
      </div>
    )}

    {error && (
      <div className="bg-red-800 border border-red-600 text-red-200 px-5 py-4 rounded-lg relative mb-6 shadow-md text-center" role="alert">
        <strong className="font-bold text-lg">FAILURE!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    )}

    {message && (
      <div className={`px-5 py-4 rounded-lg relative mb-6 shadow-md text-center ${message.includes('SAVED') || message.includes('OVER') || message.includes('COMPLETED') ? 'bg-green-800 border border-green-600 text-green-200' : 'bg-yellow-800 border border-yellow-600 text-yellow-200'}`} role="alert">
        <span className="block sm:inline">{message}</span>
      </div>
    )}
  </>
);

// --- Component: GymTimer ---
const GymTimer = ({ gymTimerActive, gymElapsedTime, startGymWorkoutTimer, endGymWorkoutTimer, formatTime }) => (
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

// --- Component: RestTimer ---
const RestTimer = ({ timerActive, timeRemaining, startRestTimer, resetRestTimer, formatTime, TOTAL_REST_DURATION, scrollToFirstEmptySet }) => (
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

// --- Component: SuggestWorkoutSection ---
const SuggestWorkoutSection = ({ loading, additionalInput, setAdditionalInput, suggestNewWorkout }) => (
  <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
    <h2 className="text-3xl font-bold mb-5 text-center text-blue-300">GET YOUR DAILY BEAST MODE ON!</h2>
    <textarea
      className="w-full p-4 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base"
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
);

// --- Component: SetRow ---
// Now accepts 'exercise' prop to access exercise.name for aria-label
const SetRow = ({ set, exIndex, setIndex, handleSetChange, exercise }) => (
  <div key={setIndex} id={`set-${exIndex}-${setIndex}`} className={`p-4 rounded-md shadow-inner border ${set.reps > 0 ? 'bg-green-900 border-green-700' : 'bg-zinc-900 border-zinc-700'}`}>
    <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
      <span className="font-semibold text-blue-100 text-base mb-2 sm:mb-0 sm:mr-4 w-full sm:w-auto">Set {setIndex + 1}:</span>
      
      <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
        <label htmlFor={`reps-${exIndex}-${setIndex}`} className="sr-only">Reps</label>
        <div className="flex items-center">
            <button
                onClick={() => handleSetChange(exIndex, setIndex, 'reps', Math.max(0, (set.reps || 0) - 1))}
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
                aria-label="Decrease reps"
            >
                -
            </button>
            <input
                id={`reps-${exIndex}-${setIndex}`}
                type="number"
                step="1"
                min="0"
                className="w-16 p-2 mx-1 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                value={set.reps}
                onChange={(e) => handleSetChange(exIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                aria-label={`Reps for ${exercise.name} Set ${setIndex + 1}`}
            />
            <button
                onClick={() => handleSetChange(exIndex, setIndex, 'reps', (set.reps || 0) + 1)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
                aria-label="Increase reps"
            >
                +
            </button>
        </div>
        <span className="text-zinc-400 ml-2 text-base">reps</span>
      </div>
      <div className="flex items-center">
        <label htmlFor={`weight-${exIndex}-${setIndex}`} className="sr-only">Weight</label>
        <input
          id={`weight-${exIndex}-${setIndex}`}
          type="number"
          step="0.5"
          min="0"
          className="w-28 p-2 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500"
          value={set.weight}
          onChange={(e) => handleSetChange(exIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
          aria-label={`Weight for ${exercise.name} Set ${setIndex + 1}`}
        />
        <label htmlFor={`unit-${exIndex}-${setIndex}`} className="sr-only">Unit</label>
        <select
          id={`unit-${exIndex}-${setIndex}`}
          className="w-20 p-2 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500 appearance-none pl-2 pr-2 ml-2"
          value={set.unit}
          onChange={(e) => handleSetChange(exIndex, setIndex, 'unit', e.target.value)}
          aria-label={`Unit for ${exercise.name} Set ${setIndex + 1}`}
        >
          <option value="kg">kg</option>
          <option value="lbs">lbs</option>
        </select>
      </div>
    </div>
    {set.ai_tips && (
      <p className="text-xs sm:text-sm text-blue-400 italic mt-2 w-full">
        <span className="font-semibold">Tip:</span> {set.ai_tips}
      </p>
    )}
  </div>
);

// --- Component: ExerciseBlock ---
const ExerciseBlock = ({ exercise, exIndex, handleSetChange, fetchingTips, getExerciseTips }) => {
  const completedSetsForExercise = exercise.sets ? exercise.sets.filter(set => set.reps > 0).length : 0;
  const totalSetsForExercise = exercise.sets ? exercise.sets.length : 0;

  return (
    <div className="bg-zinc-800 p-5 rounded-lg shadow-md mb-5 border border-zinc-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xl sm:text-2xl font-semibold text-blue-200">{exercise.name}</h4>
        {totalSetsForExercise > 0 && (
          <span className="text-zinc-400 text-sm font-medium">
            {completedSetsForExercise} / {totalSetsForExercise} Sets
          </span>
        )}
      </div>
      <p className="text-sm text-zinc-400 mb-1">Target Muscles: <span className="font-medium">{exercise.target_muscles || 'N/A'}</span></p>
      <p className="text-sm text-zinc-400 mb-1">Machine: <span className="font-medium">{exercise.machine || 'N/A'}</span></p>
      {exercise.attachments && <p className="text-sm text-zinc-400">Attachments: <span className="font-medium">{exercise.attachments}</span></p>}

      <div className="mt-4">
        <p className="font-bold text-zinc-300 mb-2 text-lg">Sets:</p>
        {exercise.sets && exercise.sets.length > 0 ? (
          <div className="space-y-3">
            {exercise.sets.map((set, setIndex) => (
              // Pass 'exercise' prop to SetRow
              <SetRow key={setIndex} set={set} exIndex={exIndex} setIndex={setIndex} handleSetChange={handleSetChange} exercise={exercise} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm italic">NO SETS! COME ON, WE GOTTA GET SOME SETS IN!</p>
        )}
      </div>
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
  );
};

// --- Component: TodayWorkoutDisplay ---
const TodayWorkoutDisplay = ({ todayWorkout, loading, error, fetchingTips, getExerciseTips, handleSetChange, completedSets, totalSets, progressPercentage }) => (
  <section>
    <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-blue-300">
      <i className="fas fa-calendar-alt mr-2 text-blue-400"></i>TODAY'S <span className="text-blue-500">MASSIVE WORKOUT!</span>
    </h2>

    {totalSets > 0 && (
      <div className="mb-6 p-4 bg-zinc-900 rounded-lg border border-zinc-800 shadow-inner">
        <div className="flex justify-between items-center mb-2">
          <span className="text-zinc-300 font-semibold">Workout Progress:</span>
          <span className="text-blue-400 font-bold">{completedSets} / {totalSets} Sets ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    )}

    {todayWorkout ? (
      <div className="border border-blue-700 p-6 rounded-xl bg-zinc-900 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{todayWorkout.title}</h3>
        {todayWorkout.subtitle && <p className="text-zinc-300 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
        {todayWorkout.ai_tips && (
          <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-200 p-4 rounded-md mb-6 shadow-sm text-sm sm:text-base">
            <p className="font-bold mb-1">🧠 AI INSIGHTS, YEAH BUDDY!</p>
            <p>{todayWorkout.ai_tips}</p>
          </div>
        )}

        {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
          todayWorkout.exercises.map((exercise, exIndex) => (
            <ExerciseBlock
              key={exercise.id || exIndex} // Use exercise.id for key if available
              exercise={exercise}
              exIndex={exIndex}
              handleSetChange={handleSetChange}
              fetchingTips={fetchingTips}
              getExerciseTips={getExerciseTips}
            />
          ))
        ) : (
          <p className="text-zinc-500 text-center text-lg mt-8">
            NO EXERCISES TODAY! LIGHT WEIGHT! Hit that "Get New Workout Plan" button and LET'S GO!
            <br />
            (Looking for workout for today: {new Date().toDateString()})
          </p>
        )}
      </div>
    ) : (
      !loading && !error && (
        <p className="text-zinc-500 text-center text-lg mt-8">
          NO WORKOUT LOADED! WE NEED A PLAN! Hit that "Get New Workout Plan" button, LIGHT WEIGHT!
          <br />
          (Looking for workout for today: {new Date().toDateString()})
        </p>
      )
    )}
  </section>
);

// --- Component: ExerciseTipsModal ---
const ExerciseTipsModal = ({ isModalOpen, closeModal, tipsAdditionalInput, setTipsAdditionalInput, currentTipsExerciseId, getExerciseTips, fetchingTips, exerciseTipsError, exerciseTips }) => (
  isModalOpen && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-300">EXERCISE TIPS, LIGHT WEIGHT!</h2>
          <button
            onClick={closeModal}
            className="text-zinc-500 hover:text-white transition-colors duration-200"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        <textarea
            className="w-full p-3 border border-zinc-700 rounded-md bg-zinc-900 text-white placeholder-zinc-500 focus:ring-1 focus:ring-blue-500 transition duration-300 ease-in-out resize-y mb-4"
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
        {fetchingTips && <p className="text-blue-400 text-center mb-4">GETTING THE KNOWLEDGE!</p>}
        {exerciseTipsError && (
          <p className="text-red-400 text-center mb-4">{exerciseTipsError}</p>
        )}
        <div className="bg-zinc-700 p-4 rounded-md border border-zinc-600 whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">
          {exerciseTips || (fetchingTips ? "LOADING THOSE SWEET, SWEET TIPS!" : "NO TIPS YET! ASK ME SOMETHING, LIGHT WEIGHT!")}
        </div>
        <div className="flex justify-end mt-4">
            <button
                onClick={closeModal}
                className="bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
                CLOSE IT! YEAH BUDDY!
            </button>
        </div>
      </div>
    </div>
  )
);

// --- Component: WorkoutFooter ---
const WorkoutFooter = () => (
  <footer className="w-full max-w-3xl text-center mt-12 p-4 text-zinc-600 text-sm">
    <p>&copy; {new Date().getFullYear()} Yea Buddy! All rights reserved.</p>
    <p className="mt-1">POWERED BY GEMINI AI, YEAH BUDDY!</p>
  </footer>
);


// --- Main App Component (Refactored) ---
const App = () => {
  // All state and core logic remains in the App component
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
  }, [API_BASE_URL, setMessage, setError, setLoading]); // Added dependencies

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
  }, [API_BASE_URL, additionalInput, fetchTodayWorkout, setMessage, setError, setLoading]); // Added dependencies

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
  }, [API_BASE_URL, setMessage, setError, setLoading]); // Added dependencies

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
  }, [todayWorkout, saveWorkoutChanges]); // Added dependencies

  const startRestTimer = useCallback(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
          proceedWithRestTimerStart();
        } else {
          console.warn('Notification permission denied.');
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
  }, [TOTAL_REST_DURATION, setMessage, setTimerActive]); // Added dependencies

  const proceedWithRestTimerStart = useCallback(() => {
    const endTime = Date.now() + TOTAL_REST_DURATION * 1000;
    localStorage.setItem(LOCAL_STORAGE_REST_TIMER_KEY, endTime);
    setTimerActive(true);
    setMessage(`Rest timer SET! ${TOTAL_REST_DURATION / 60} minutes, AIN'T NOTHIN' BUT A PEANUT!`);
  }, [TOTAL_REST_DURATION, LOCAL_STORAGE_REST_TIMER_KEY, setMessage, setTimerActive]); // Added dependencies

  const resetRestTimer = useCallback(() => {
    clearInterval(restTimerIntervalRef.current);
    restTimerIntervalRef.current = null;
    setTimerActive(false);
    setTimeRemaining(0);
    localStorage.removeItem(LOCAL_STORAGE_REST_TIMER_KEY);
    setMessage('Rest Timer RESET! Let\'s go!');
  }, [restTimerIntervalRef, setTimerActive, setTimeRemaining, LOCAL_STORAGE_REST_TIMER_KEY, setMessage]); // Added dependencies

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const hours = Math.floor(minutes / 60);
    const displayMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${displayMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []); // No dependencies

  const startGymWorkoutTimer = useCallback(() => {
    const startTime = Date.now();
    localStorage.setItem(LOCAL_STORAGE_GYM_START_TIME_KEY, startTime);
    setGymStartTime(startTime);
    setGymTimerActive(true);
    setMessage('WORKOUT STARTED! LIGHT WEIGHT! LET\'S GET THIS BREAD!');
  }, [LOCAL_STORAGE_GYM_START_TIME_KEY, setGymStartTime, setGymTimerActive, setMessage]); // Added dependencies

  const endGymWorkoutTimer = useCallback(() => {
    if (gymTimerIntervalRef.current) {
      clearInterval(gymTimerIntervalRef.current);
    }
    setGymTimerActive(false);
    localStorage.removeItem(LOCAL_STORAGE_GYM_START_TIME_KEY);
    setMessage(`WORKOUT ENDED! Total time: ${formatTime(gymElapsedTime)}. YEAH BUDDY!`);
  }, [gymTimerIntervalRef, setGymTimerActive, LOCAL_STORAGE_GYM_START_TIME_KEY, setMessage, formatTime, gymElapsedTime]); // Added dependencies

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
    }
    // Corrected variable name from `calculatedTimeTimeRemaining` to `calculatedTimeRemaining`
    // No explicit changes to this section as the error was outside this specific block
    catch (err) {
      console.error('Error fetching exercise tips:', err);
      setExerciseTipsError(`ERROR! Couldn't get those tips: ${err.message}. Try again, YEAH BUDDY!`);
    } finally {
      setFetchingTips(false);
    }
  }, [API_BASE_URL, tipsAdditionalInput, setCurrentTipsExerciseId, setFetchingTips, setExerciseTipsError, setExerciseTips, setIsModalOpen]); // Added dependencies

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setExerciseTips('');
    setTipsAdditionalInput('');
    setExerciseTipsError(null);
    setCurrentTipsExerciseId(null);
    setFetchingTips(false);
  }, [setIsModalOpen, setExerciseTips, setTipsAdditionalInput, setExerciseTipsError, setCurrentTipsExerciseId, setFetchingTips]); // Added dependencies

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
  }, [todayWorkout]); // Dependency

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
    setMessage("ALL SETS COMPLETED! YEAH BUDDY! You crushed it!");
  }, [todayWorkout, setMessage]);


  // --- Effects (same as before, but with corrected variable name) ---
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        const endTime = parseInt(localStorage.getItem(LOCAL_STORAGE_REST_TIMER_KEY));
        const now = Date.now();
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
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timerActive, resetRestTimer, LOCAL_STORAGE_REST_TIMER_KEY]); // Dependencies

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
  }, [LOCAL_STORAGE_REST_TIMER_KEY, TOTAL_REST_DURATION, resetRestTimer]); // Dependencies

  useEffect(() => {
    if (gymTimerActive && gymStartTime !== null) {
      const interval = setInterval(() => {
        setGymElapsedTime(Math.floor((Date.now() - gymStartTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gymTimerActive, gymStartTime]); // Dependencies

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
  }, [LOCAL_STORAGE_GYM_START_TIME_KEY, setGymStartTime, setGymElapsedTime, setGymTimerActive]); // Dependencies

  useEffect(() => {
    fetchTodayWorkout();
  }, [fetchTodayWorkout]); // Dependency

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
        <RestTimer 
          timerActive={timerActive} 
          timeRemaining={timeRemaining} 
          startRestTimer={startRestTimer} 
          resetRestTimer={resetRestTimer} 
          formatTime={formatTime} 
          TOTAL_REST_DURATION={TOTAL_REST_DURATION} 
          scrollToFirstEmptySet={scrollToFirstEmptySet} 
        />
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
    </div>
  );
};

export default App;