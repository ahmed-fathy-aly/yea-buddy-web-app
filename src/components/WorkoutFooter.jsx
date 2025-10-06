import React from 'react';

const WorkoutFooter = () => (
  <footer className="w-full max-w-4xl text-center mt-12 p-4 text-cyan-400/60 text-sm font-mono tracking-wider">
    <p>&copy; {new Date().getFullYear()} QUANTUM TRAINING MATRIX. All protocols reserved.</p>
    <p className="mt-1 text-cyan-300/80">POWERED BY ADVANCED NEURAL ARCHITECTURE v2.0</p>
    <div className="flex justify-center items-center mt-2 space-x-2">
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
    </div>
  </footer>
);

export default WorkoutFooter;