import React from 'react';

const MessageDisplay = ({ loading, error, message }) => (
  <>
    {loading && (
      <div className="flex items-center justify-center p-4 my-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-cyan-400"></div>
        <p className="ml-4 text-xl text-cyan-300 font-mono tracking-wider">PROCESSING...</p>
      </div>
    )}
    {error && (
      <div className="glass-card border border-red-500/30 text-red-200 px-5 py-4 rounded-lg relative mb-6 shadow-2xl text-center neon-glow" role="alert">
        <strong className="font-bold text-lg text-red-300">SYSTEM ERROR DETECTED</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    )}
    {message && (
      <div className={`glass-card px-5 py-4 rounded-lg relative mb-6 shadow-2xl text-center border ${
        message.includes('SAVED') || message.includes('OVER') || message.includes('COMPLETED')
          ? 'border-green-500/30 text-green-200 neon-glow-green'
          : 'border-yellow-500/30 text-yellow-200'
      }`} role="alert">
        <span className="block sm:inline">{message}</span>
      </div>
    )}
  </>
);

export default MessageDisplay;