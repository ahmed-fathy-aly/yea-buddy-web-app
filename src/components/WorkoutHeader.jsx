import React from 'react';

const WorkoutHeader = () => (
  <header className="w-full max-w-3xl bg-zinc-800 text-white p-6 sm:p-8 rounded-xl shadow-lg mb-8 text-center border border-zinc-700">
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight text-blue-400">
      <i className="fas fa-dumbbell mr-3 text-blue-300"></i> Yea Buddy
    </h1>
    <p className="text-lg sm:text-xl font-light opacity-90 text-zinc-400">Light Weight</p>
  </header>
);

export default WorkoutHeader;