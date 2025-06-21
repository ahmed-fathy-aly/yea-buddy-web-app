import React from 'react';

const BackToRestTimerButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed z-50 bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
    aria-label="Back to Rest Timer"
    style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.25)' }}
  >
    <span className="text-2xl font-bold">▲</span>
  </button>
);

export default BackToRestTimerButton;