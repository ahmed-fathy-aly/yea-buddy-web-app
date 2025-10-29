import React, { useState } from 'react';
import MuscleSelectionGrid from './MuscleSelectionGrid';

const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

const SuggestWorkoutSection = ({ onWorkoutSuggested, selectedDay }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [streamingStatus, setStreamingStatus] = useState([]);
  const [progressFolded, setProgressFolded] = useState(true);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [muscleRatings, setMuscleRatings] = useState(null);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [additionalInput, setAdditionalInput] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [formCollapsed, setFormCollapsed] = useState(true);

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

  const handleMuscleToggle = (muscle) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const getMuscleRatings = async () => {
    setRatingsLoading(true);
    try {
      const allMuscles = ['Back', 'Chest', 'Traps', 'Triceps', 'Biceps', 'Legs', 'Core', 'Calves', 'Shoulders'];
      const musclesParam = allMuscles.join(', ');
      
      const response = await fetch(`${API_BASE_URL}/muscle-ratings?muscles=${encodeURIComponent(musclesParam)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch muscle ratings');
      }
      const data = await response.json();
      setMuscleRatings(data);
    } catch (err) {
      console.error('Error fetching muscle ratings:', err);
      setMuscleRatings([
        { muscle: 'Back', score: 85, explanation: 'Well recovered, ready for heavy lifting' },
        { muscle: 'Chest', score: 60, explanation: 'Moderately recovered, light to medium intensity' },
        { muscle: 'Traps', score: 75, explanation: 'Good recovery, suitable for training' },
        { muscle: 'Triceps', score: 45, explanation: 'Still recovering, avoid heavy pushing movements' },
        { muscle: 'Biceps', score: 90, explanation: 'Fully recovered, ready for intense training' },
        { muscle: 'Legs', score: 30, explanation: 'Heavy fatigue, recommend rest or light activity' },
        { muscle: 'Core', score: 80, explanation: 'Strong recovery, good for stability work' },
        { muscle: 'Calves', score: 95, explanation: 'Excellent condition, ready for explosive movements' },
        { muscle: 'Shoulders', score: 55, explanation: 'Moderate fatigue, be cautious with overhead movements' }
      ]);
    } finally {
      setRatingsLoading(false);
    }
  };

  const suggestNewWorkout = async () => {
    setLoading(true);
    setStreamingStatus([]);
    try {
      // Build URL with parameters
      const params = new URLSearchParams({
        additional_input: additionalInput,
        duration_minutes: durationMinutes.toString()
      });
      // Add specific_muscles parameter if muscles are selected
      if (selectedMuscles.length > 0) {
        params.append('specific_muscles', selectedMuscles.join(', '));
      }
      // Add day parameter if selectedDay is provided, converting to DateString format
      if (selectedDay) {
        const dateObj = new Date(selectedDay + 'T00:00:00');
        const dayParam = dateObj.toDateString();
        params.append('day', dayParam);
      }
      const url = `${API_BASE_URL}/suggest-workout?${params.toString()}`;
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
          } catch (e) {
            // ignore parse errors for incomplete lines
          }
        }
      }
      setAdditionalInput('');
      // Refresh the workout display
      if (onWorkoutSuggested) onWorkoutSuggested();
    } catch (err) {
      setStreamingStatus(prev => [...prev, { status: 'Error', error: err.message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mb-10 p-6 glass-card rounded-xl shadow-2xl border border-cyan-500/20 relative overflow-hidden">
      {/* Holographic overlay */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"></div>
      <div className="absolute inset-0 holographic opacity-10"></div>

      <h2 className="text-2xl sm:text-3xl font-bold mb-5 text-center text-cyan-300 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
          <i className="fas fa-brain mr-2 text-cyan-400"></i>
          <span className="whitespace-nowrap">QUANTUM</span>
        </div>
        <div className="flex items-center">
          <span className="text-purple-400 whitespace-nowrap">PROTOCOL</span>
          <span className="hidden sm:inline ml-2">GENERATOR</span>
          <span className="sm:hidden ml-2">GEN</span>
          <div className="w-3 h-3 bg-purple-400 rounded-full ml-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </h2>
      
      <div className="mb-4 flex justify-center relative z-10">
        <button
          onClick={() => setFormCollapsed(!formCollapsed)}
          className="text-cyan-300 hover:text-cyan-200 font-semibold text-sm px-4 py-2 rounded-lg border border-cyan-500/30 hover:border-cyan-500/50 transition-all bg-slate-900/30 hover:bg-slate-900/50 flex items-center gap-2"
        >
          {formCollapsed ? (
            <>
              <span>Show Options</span>
              <i className="fas fa-chevron-down"></i>
            </>
          ) : (
            <>
              <span>Hide Options</span>
              <i className="fas fa-chevron-up"></i>
            </>
          )}
        </button>
      </div>

      {!formCollapsed && (
        <>
          <MuscleSelectionGrid 
            selectedMuscles={selectedMuscles}
            onMuscleToggle={handleMuscleToggle}
            muscleRatings={muscleRatings}
          />
          
          <textarea
            className="w-full p-4 border border-cyan-500/30 rounded-lg bg-slate-900/50 text-cyan-100 placeholder-cyan-400/60 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base backdrop-blur-sm relative z-10"
            rows="4"
            placeholder="Neural input: Specify parameters or leave blank for automated protocol"
            value={additionalInput}
            onChange={(e) => setAdditionalInput(e.target.value)}
          ></textarea>
          
          <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
            <span className="text-cyan-200 font-semibold text-base">Workout Duration:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDurationMinutes(prev => Math.max(15, prev - 5))}
                className="w-10 h-10 bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-100 font-bold rounded-lg transition-all duration-300 flex items-center justify-center border border-cyan-500/30"
                aria-label="Decrease duration by 5 minutes"
              >
                <i className="fas fa-minus"></i>
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-cyan-500/30 rounded-lg">
                <span className="text-cyan-100 font-bold text-lg">{durationMinutes}</span>
                <span className="text-cyan-300 text-sm">min</span>
              </div>
              <button
                onClick={() => setDurationMinutes(prev => Math.min(180, prev + 5))}
                className="w-10 h-10 bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-100 font-bold rounded-lg transition-all duration-300 flex items-center justify-center border border-cyan-500/30"
                aria-label="Increase duration by 5 minutes"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <button
            onClick={getMuscleRatings}
            disabled={ratingsLoading}
            className="w-full mb-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base tracking-wide neon-glow relative z-10"
          >
            {ratingsLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                ANALYZING RECOVERY...
              </>
            ) : (
              <>
                <i className="fas fa-heartbeat mr-3"></i> RECOVERY ANALYSIS
              </>
            )}
          </button>
        </>
      )}
      
      <button
        onClick={suggestNewWorkout}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-900 font-extrabold py-3.5 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide neon-glow relative z-10"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
            GENERATING PROTOCOL...
          </>
        ) : (
          <>
            <i className="fas fa-magic mr-3"></i> GENERATE PROTOCOL
          </>
        )}
      </button>
      <button
        onClick={openHistory}
        className="w-full mt-4 bg-slate-700/50 hover:bg-slate-600/50 text-cyan-300 font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 ease-in-out flex items-center justify-center text-base tracking-wide border border-cyan-500/30 relative z-10"
      >
        <i className="fas fa-history mr-2"></i> HISTORY
      </button>

      {streamingStatus.length > 0 && streamingStatus[streamingStatus.length-1]?.nextStep !== 'Done' && (
        <div className="mb-6 mt-8 p-4 glass-card border border-cyan-500/30 rounded-lg relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-cyan-400 text-base flex items-center">
              <span className="mr-2"><i className="fas fa-robot animate-pulse text-cyan-400"></i></span>
              Progress
            </div>
            <button
              className="text-xs text-cyan-300 underline focus:outline-none"
              onClick={() => setProgressFolded(f => !f)}
            >
              {progressFolded ? 'Show All' : 'Hide All'}
            </button>
          </div>
          <div className="relative">
            {progressFolded ? (
              <div className="text-blue-200 text-sm py-2 flex items-center justify-between pr-10">
                <span>{streamingStatus[streamingStatus.length-1]?.status || streamingStatus[streamingStatus.length-1]?.error}</span>
                <div className="absolute right-2 top-2">
                  {/* AI-like animation */}
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                    <span className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-blue-200 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                  </span>
                </div>
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
      
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl shadow-2xl max-w-lg w-full relative border border-cyan-500/20">
            <button
              onClick={closeHistory}
              className="absolute top-2 right-2 text-cyan-400 hover:text-cyan-300 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4 text-cyan-300 text-center flex items-center justify-center">
              <i className="fas fa-history mr-2"></i>
              Workout History (Last 28 Days)
            </h3>
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
