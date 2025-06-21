import React from 'react';

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

export default GymTimer;