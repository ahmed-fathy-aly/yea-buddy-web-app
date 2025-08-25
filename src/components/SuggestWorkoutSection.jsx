import React, { useState } from 'react';

const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

const SuggestWorkoutSection = ({ onWorkoutSuggested }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);

  const openHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/workouts?days=28`);
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      setWorkoutHistory(data);
    } catch (err) {
      setHistoryError('Could not load workout history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const closeHistory = () => {
    setShowHistory(false);
    setWorkoutHistory([]);
    setHistoryError(null);
  };
  const [loading, setLoading] = useState(false);
  const [additionalInput, setAdditionalInput] = useState('');

  const suggestNewWorkout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/suggest-workout?additional_input=${encodeURIComponent(additionalInput)}`);
      setAdditionalInput('');
      if (onWorkoutSuggested) onWorkoutSuggested(); // <-- trigger parent refresh
    } catch (err) {
      // Optionally: handle error here
    } finally {
      setLoading(false);
    }
  };

  return (
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
      <button
        onClick={openHistory}
        className="w-full mt-4 bg-zinc-700 hover:bg-zinc-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center text-base tracking-wide"
      >
        <i className="fas fa-history mr-2"></i> HISTORY
      </button>

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-zinc-900 p-8 rounded-xl shadow-lg max-w-lg w-full relative">
            <button
              onClick={closeHistory}
              className="absolute top-2 right-2 text-zinc-400 hover:text-white text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-blue-300 text-center">Workout History (Last 28 Days)</h3>
            {historyLoading ? (
              <div className="text-center text-blue-400">Loading...</div>
            ) : historyError ? (
              <div className="text-center text-red-400">{historyError}</div>
            ) : workoutHistory.length === 0 ? (
              <div className="text-center text-zinc-400">No workouts found.</div>
            ) : (
              <ul className="max-h-96 overflow-y-auto">
                {workoutHistory.map((workout, idx) => (
                  <li key={workout.id || idx} className="mb-4 p-4 bg-zinc-800 rounded-lg">
                    <div className="font-bold text-lg text-blue-200">
                      {(() => {
                        const rawDate = workout.day;
                        if (!rawDate) return 'Unknown Date';
                        const parsed = new Date(rawDate);
                        if (isNaN(parsed.getTime())) return rawDate;
                        const today = new Date();
                        parsed.setHours(0,0,0,0);
                        today.setHours(0,0,0,0);
                        const diffMs = today - parsed;
                        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                        const dateStr = parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
                        return `${dateStr} (${diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays + ' days ago'})`;
                      })()}
                    </div>
                    <div className="text-white">{workout.name || workout.title || 'Workout'}</div>
                    {workout.exercises && (
                      <ul className="mt-2 ml-4 list-disc text-zinc-300">
                        {workout.exercises.map((ex, i) => (
                          <li key={i}>{ex.name || ex.title || 'Exercise'}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SuggestWorkoutSection;