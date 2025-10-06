import React, { useState } from 'react';

const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

const ExerciseReplaceModal = ({ exerciseId, open, onClose, onReplace }) => {
  const [userInput, setUserInput] = useState('');
  const [fetching, setFetching] = useState(false);
  const [replaceError, setReplaceError] = useState(null);
  const [replacement, setReplacement] = useState(null);

  const handleReplace = async () => {
    if (!exerciseId) return;
    setFetching(true);
    setReplaceError(null);
    setReplacement(null);
    try {
      const response = await fetch(`${API_BASE_URL}/replace-workout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: userInput, exerciseId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const data = await response.json();
      setReplacement(data.replacement);
      if (onReplace) onReplace();
    } catch (err) {
      setReplaceError(`Couldn't replace exercise: ${err.message}`);
    } finally {
      setFetching(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-300">REPLACE EXERCISE</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors duration-200"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        <textarea
          className="w-full p-3 border border-zinc-700 rounded-md bg-zinc-900 text-white placeholder-zinc-500 focus:ring-1 focus:ring-blue-500 transition duration-300 ease-in-out resize-y mb-4"
          rows="3"
          placeholder="Input replacement specifications and optimization criteria"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
        ></textarea>
        <button
          onClick={handleReplace}
          disabled={fetching || !exerciseId}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-md mb-4"
        >
          {fetching ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              REPLACING...
            </>
          ) : (
            <>
              <i className="fas fa-exchange-alt mr-2"></i> REPLACE
            </>
          )}
        </button>
        {replaceError && (
          <p className="text-red-400 text-center mb-4">{replaceError}</p>
        )}
        {replacement && (
          <div className="bg-zinc-700 p-4 rounded-md border border-zinc-600 whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed mt-4">
            <div className="mb-2 font-bold text-green-300">Exercise replacement protocol executed successfully</div>
            <div><span className="font-semibold">Name:</span> {replacement.name}</div>
            <div><span className="font-semibold">Target Muscles:</span> {replacement.target_muscles}</div>
            <div><span className="font-semibold">Machine:</span> {replacement.machine}</div>
            {replacement.attachments && <div><span className="font-semibold">Attachments:</span> {replacement.attachments}</div>}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            TERMINATE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseReplaceModal;
