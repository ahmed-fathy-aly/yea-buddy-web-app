import React from 'react';

const WorkoutFooter = () => (
  <footer className="w-full max-w-3xl text-center mt-12 p-4 text-zinc-600 text-sm">
    <p>&copy; {new Date().getFullYear()} Optimal Training System. All protocols reserved.</p>
    <p className="mt-1">POWERED BY ADVANCED NEURAL ARCHITECTURE</p>
  </footer>
);

export default WorkoutFooter;