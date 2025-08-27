import React, { useState } from 'react';

const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

const SuggestWorkoutSection = ({ onWorkoutSuggested }) => {
  const [todaysWorkout, setTodaysWorkout] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [streamingStatus, setStreamingStatus] = useState([]);
  const [suggestedWorkout, setSuggestedWorkout] = useState(null);
  const [formattedText, setFormattedText] = useState('');
  const [recoveryRatings, setRecoveryRatings] = useState(null);
  const [dryRun, setDryRun] = useState(true);
  const [progressFolded, setProgressFolded] = useState(true);

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
    setStreamingStatus([]);
    setSuggestedWorkout(null);
    setFormattedText('');
    setRecoveryRatings(null);
    setTodaysWorkout(null);
    try {
      const url = `${API_BASE_URL}/suggest-workout?additional_input=${encodeURIComponent(additionalInput)}&dryRun=${dryRun}`;
      const res = await fetch(url);
      if (!res.body) throw new Error('No response body');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        let lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const obj = JSON.parse(line);
            setStreamingStatus(prev => [...prev, obj]);
            if (obj.workout) setSuggestedWorkout(obj.workout);
            if (obj.formattedText) setFormattedText(obj.formattedText);
            if (obj.recoveryRatings) setRecoveryRatings(obj.recoveryRatings);
          } catch (e) {
            // ignore parse errors for incomplete lines
          }
        }
      }
      setAdditionalInput('');
      // Fetch today's workouts after streaming is done
      const todayRes = await fetch(`${API_BASE_URL}/workouts/today`);
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodaysWorkout(todayData);
      }
      if (onWorkoutSuggested) onWorkoutSuggested();
    } catch (err) {
      setStreamingStatus(prev => [...prev, { status: 'Error', error: err.message }]);
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
      <div className="flex items-center mb-4">
        <span className="text-blue-200 font-semibold text-base mr-3">Dry Run:</span>
        <button
          type="button"
          onClick={() => setDryRun(!dryRun)}
          className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${dryRun ? 'bg-blue-600' : 'bg-zinc-700'}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${dryRun ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
        <span className={`ml-3 text-sm font-medium ${dryRun ? 'text-blue-400' : 'text-zinc-400'}`}>
          {dryRun ? 'Preview Only' : 'Save to DB'}
        </span>
      </div>
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

      {/* Streaming status/results UI */}
      {streamingStatus.length > 0 && streamingStatus[streamingStatus.length-1]?.nextStep !== 'Done' && (
        <div className="mb-6 mt-8 p-4 bg-zinc-950 border border-blue-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-blue-400 text-base flex items-center">
              <span className="mr-2"><i className="fas fa-robot animate-pulse"></i></span>
              Progress
            </div>
            <button
              className="text-xs text-blue-300 underline focus:outline-none"
              onClick={() => setProgressFolded(f => !f)}
            >
              {progressFolded ? 'Show All' : 'Hide All'}
            </button>
          </div>
          <div className="relative">
            <div className="absolute right-2 top-2">
              {/* AI-like animation */}
              <span className="inline-block w-6 h-6">
                <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                <span className="block w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s', marginTop: '2px'}}></span>
                <span className="block w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.4s', marginTop: '2px'}}></span>
              </span>
            </div>
            {progressFolded ? (
              <div className="text-blue-200 text-sm py-2">
                {streamingStatus[streamingStatus.length-1]?.status || streamingStatus[streamingStatus.length-1]?.error}
                {streamingStatus[streamingStatus.length-1]?.nextStep === 'Done' && (
                  <span className="ml-2 text-green-400 font-bold">Done <i className="fas fa-check-circle"></i></span>
                )}
              </div>
            ) : (
              <ul className="text-sm text-blue-200 space-y-1 max-h-40 overflow-y-auto">
                {streamingStatus.map((s, i) => (
                  <li key={i} className="flex items-center">
                    <span>{s.status || s.error}</span>
                    {s.nextStep === 'Done' && (
                      <span className="ml-2 text-green-400 font-bold">Done <i className="fas fa-check-circle"></i></span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Recovery Ratings UI - always shown when available */}
      {recoveryRatings && Array.isArray(recoveryRatings) && recoveryRatings.length > 0 && (
        <div className="mt-4">
          <div className="font-bold text-blue-300 mb-2">Recovery Ratings:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(recoveryRatings.slice().sort((a, b) => b.score - a.score)).map((r, idx) => (
              <div key={idx} className="mb-4 p-3 bg-zinc-900 rounded border border-blue-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-200 text-base">{r.muscle}</span>
                  <span className="font-bold text-blue-400">{r.score}</span>
                </div>
                <div className="w-full h-4 bg-zinc-800 rounded overflow-hidden mb-2">
                  <div
                    className="h-4 rounded"
                    style={{
                      width: `${Math.max(0, Math.min(100, r.score))}%`,
                      background: r.score >= 80 ? '#22c55e' : r.score >= 50 ? '#eab308' : '#ef4444',
                      transition: 'width 0.5s',
                    }}
                  ></div>
                </div>
                <div className="text-xs text-blue-100 italic">{r.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Suggested Workout UI - show parsed card if available */}
      {suggestedWorkout && (
        <div className="mb-6 mt-4 p-5 bg-gradient-to-br from-blue-900 via-zinc-900 to-blue-800 border border-blue-700 rounded-xl shadow">
          <div className="flex items-center mb-2">
            <span className="font-bold text-blue-300 text-lg mr-2">Suggested Workout</span>
            <span className="text-blue-400"><i className="fas fa-dumbbell"></i></span>
          </div>
          <div className="text-white font-bold text-xl mb-1">{suggestedWorkout.title || 'Workout'}</div>
          <div className="text-blue-200 mb-3 italic">{suggestedWorkout.subtitle}</div>
          {suggestedWorkout.exercises && (
            <ul className="list-none ml-0">
              {suggestedWorkout.exercises.map((ex, i) => (
                <li key={i} className="mb-4 p-3 bg-zinc-900 rounded-lg border border-blue-800 shadow">
                  <div className="flex items-center mb-1">
                    <span className="font-bold text-blue-200 text-base mr-2">{ex.name}</span>
                    <span className="text-xs text-blue-400">({ex.target_muscles})</span>
                    {ex.machine && <span className="ml-2 text-xs text-zinc-400">{ex.machine}</span>}
                  </div>
                  {ex.sets && (
                    <ul className="ml-2 text-blue-300 text-sm">
                      {ex.sets.map((set, j) => (
                        <li key={j} className="flex items-center mb-1">
                          <span className="font-bold">Set {j+1}:</span>
                          <span className="ml-2">{set.weight} {set.unit} x {set.reps}</span>
                          {set.ai_tips && (<span className="ml-2 text-yellow-300 italic">{set.ai_tips}</span>)}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {suggestedWorkout.ai_tips && (
            <div className="mt-2 text-blue-300 italic">{suggestedWorkout.ai_tips}</div>
          )}
        </div>
      )}
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
                    <div className="text-white text-sm mt-1">
                      {workout.exercises && workout.exercises.length > 0 ? (
                        <ul className="list-disc ml-4">
                          {workout.exercises.map((ex, exIdx) => (
                            <li key={exIdx} className="mb-1">
                              <span className="font-bold">{ex.name}</span> <span className="text-xs">({ex.target_muscles})</span>
                              {ex.sets && ex.sets.length > 0 && (
                                <ul className="ml-4 text-xs">
                                  {ex.sets.map((set, setIdx) => (
                                    <li key={setIdx}>
                                      Set {setIdx+1}: {set.weight} {set.unit} x {set.reps} {set.ai_tips && (<span className="text-yellow-300">- {set.ai_tips}</span>)}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-zinc-400">No exercises found for this workout.</div>
                      )}
                    </div>
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
