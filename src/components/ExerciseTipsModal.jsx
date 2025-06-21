import React from 'react';

const ExerciseTipsModal = ({ isModalOpen, closeModal, tipsAdditionalInput, setTipsAdditionalInput, currentTipsExerciseId, getExerciseTips, fetchingTips, exerciseTipsError, exerciseTips }) => (
  isModalOpen && (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-300">EXERCISE TIPS, LIGHT WEIGHT!</h2>
          <button
            onClick={closeModal}
            className="text-zinc-500 hover:text-white transition-colors duration-200"
          >
            <i className="fas fa-times text-2xl"></i>
          </button>
        </div>
        <textarea
            className="w-full p-3 border border-zinc-700 rounded-md bg-zinc-900 text-white placeholder-zinc-500 focus:ring-1 focus:ring-blue-500 transition duration-300 ease-in-out resize-y mb-4"
            rows="3"
            placeholder="GOT A QUESTION? ASK ME! 'HOW DO I SQUAT HEAVY, YEAH BUDDY?!'"
            value={tipsAdditionalInput}
            onChange={(e) => setTipsAdditionalInput(e.target.value)}
        ></textarea>
        <button
            onClick={() => getExerciseTips(currentTipsExerciseId)}
            disabled={fetchingTips || !currentTipsExerciseId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-md mb-4"
        >
            {fetchingTips ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    GETTING THOSE TIPS...
                </>
            ) : (
                <>
                    <i className="fas fa-sync-alt mr-2"></i> REGENERATE TIPS, AIN'T NOTHIN' BUT A PEANUT!
                </>
            )}
        </button>
        {fetchingTips && <p className="text-blue-400 text-center mb-4">GETTING THE KNOWLEDGE!</p>}
        {exerciseTipsError && (
          <p className="text-red-400 text-center mb-4">{exerciseTipsError}</p>
        )}
        <div className="bg-zinc-700 p-4 rounded-md border border-zinc-600 whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">
          {exerciseTips || (fetchingTips ? "LOADING THOSE SWEET, SWEET TIPS!" : "NO TIPS YET! ASK ME SOMETHING, LIGHT WEIGHT!")}
        </div>
        <div className="flex justify-end mt-4">
            <button
                onClick={closeModal}
                className="bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
            >
                CLOSE IT! YEAH BUDDY!
            </button>
        </div>
      </div>
    </div>
  )
);

export default ExerciseTipsModal;