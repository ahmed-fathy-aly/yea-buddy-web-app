import React from 'react';

const MessageDisplay = ({ loading, error, message }) => (
  <>
    {loading && (
      <div className="flex items-center justify-center p-4 my-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
        <p className="ml-4 text-xl text-blue-400">LOADING THOSE GAINS!</p>
      </div>
    )}
    {error && (
      <div className="bg-red-800 border border-red-600 text-red-200 px-5 py-4 rounded-lg relative mb-6 shadow-md text-center" role="alert">
        <strong className="font-bold text-lg">FAILURE!</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    )}
    {message && (
      <div className={`px-5 py-4 rounded-lg relative mb-6 shadow-md text-center ${message.includes('SAVED') || message.includes('OVER') || message.includes('COMPLETED') ? 'bg-green-800 border border-green-600 text-green-200' : 'bg-yellow-800 border border-yellow-600 text-yellow-200'}`} role="alert">
        <span className="block sm:inline">{message}</span>
      </div>
    )}
  </>
);

export default MessageDisplay;