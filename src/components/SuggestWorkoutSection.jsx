import React from 'react';

const SuggestWorkoutSection = ({ loading, additionalInput, setAdditionalInput, suggestNewWorkout }) => (
  <section className="mb-10 p-6 bg-zinc-900 rounded-xl shadow-lg border border-zinc-800">
    <h2 className="text-3xl font-bold mb-5 text-center text-blue-300">GET YOUR DAILY BEAST MODE ON!</h2>
    <textarea
      className="w-full p-4 border border-zinc-700 rounded-lg bg-zinc-950 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out resize-y mb-5 text-base"
      rows="4"
      placeholder="YEAH BUDDY! Tell me what you want: 'LIGHT WEIGHT! UPPER BODY! NO SLEEP!' Or leave it blank for a surprise!"
      value={additionalInput}
      onChange={(e) => setAdditionalInput(e.target.value)}
    ></textarea>
    <button
      onClick={suggestNewWorkout}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-lg shadow-md transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg tracking-wide"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          GENERATING MASS...
        </>
      ) : (
        <>
          <i className="fas fa-magic mr-3"></i> GET NEW WORKOUT PLAN, LIGHT WEIGHT!
        </>
      )}
    </button>
  </section>
);

export default SuggestWorkoutSection;