import React from 'react';

const WorkoutProgressBar = ({
  completedSets,
  totalSets,
  timer,
  timerRunning,
  onStartTimer,
  onResetTimer,
}) => {
  const percent = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);

  // Format timer as mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="sticky top-0 left-0 right-0 w-full z-50 glass border-b border-cyan-500/20 shadow-2xl flex items-center px-4 py-3 backdrop-blur-xl">
      <div className="flex-1 flex items-center">
        <span className="mr-3 font-bold text-base text-cyan-300 tracking-wide drop-shadow">
          <i className="fas fa-chart-line mr-2 text-cyan-400"></i>
          Sets: <span className="text-cyan-400">{completedSets}</span> / <span className="text-cyan-200">{totalSets}</span>
        </span>
        <div className="flex-1 h-4 glass rounded-full overflow-hidden mx-3 shadow-inner border border-cyan-500/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 animate-pulse transition-all duration-500 neon-glow"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center ml-6">
        <span className="font-mono text-lg text-cyan-200 mr-3 tracking-widest shadow-sm">
          {formatTime(timer)}
        </span>
        <button
          onClick={timerRunning ? onResetTimer : onStartTimer}
          className={`ml-1 px-3 py-1.5 rounded-full text-sm font-extrabold shadow-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 ${
            timerRunning
              ? 'bg-cyan-700 border-cyan-400 text-white hover:bg-cyan-800 neon-glow'
              : 'glass border-cyan-500/30 text-cyan-200 hover:bg-cyan-600/20 hover:text-white'
          }`}
        >
          {timerRunning ? (
            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reset</span>
          ) : (
            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>Initialize</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
