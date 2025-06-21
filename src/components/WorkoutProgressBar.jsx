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
    <div className="sticky top-0 left-0 right-0 w-full z-50 bg-gradient-to-r from-green-900 via-zinc-900 to-green-900 border-b border-zinc-700 shadow-lg flex items-center px-4 py-3 backdrop-blur-md">
      <div className="flex-1 flex items-center">
        <span className="mr-3 font-bold text-base text-green-300 tracking-wide drop-shadow">
          Sets: <span className="text-green-400">{completedSets}</span> / <span className="text-green-200">{totalSets}</span>
        </span>
        <div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden mx-3 shadow-inner border border-green-900">
          <div
            className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-700 animate-pulse transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <div className="flex items-center ml-6">
        <span className="font-mono text-lg text-green-200 mr-3 tracking-widest shadow-sm">
          {formatTime(timer)}
        </span>
        <button
          onClick={timerRunning ? onResetTimer : onStartTimer}
          className={`ml-1 px-3 py-1.5 rounded-full text-sm font-extrabold shadow-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${
            timerRunning
              ? 'bg-green-700 border-green-400 text-white hover:bg-green-800'
              : 'bg-zinc-800 border-green-700 text-green-200 hover:bg-green-600 hover:text-white'
          }`}
        >
          {timerRunning ? (
            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>Reset</span>
          ) : (
            <span className="flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>Start</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default WorkoutProgressBar;
