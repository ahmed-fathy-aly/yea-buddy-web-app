import React, { useState, useRef } from 'react';
import ConfettiCelebration from './ConfettiCelebration';
import SetRow from './SetRow';
import ExerciseReplaceModal from './ExerciseReplaceModal';

const API_BASE_URL = 'https://yea-buddy-be.onrender.com';

const ExerciseBlock = ({ exercise, exIndex, handleSetChange, setRefs, refreshWorkout }) => {
  const [tipsModalOpen, setTipsModalOpen] = useState(false);
  const [fetchingTips, setFetchingTips] = useState(false);
  const [exerciseTips, setExerciseTips] = useState('');
  const [exerciseTipsError, setExerciseTipsError] = useState(null);
  const [tipsAdditionalInput, setTipsAdditionalInput] = useState('');
  const [replaceModalOpen, setReplaceModalOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiMsg, setConfettiMsg] = useState('');
  const celebrationTimeout = useRef(null);

  // Handler for personal best (debounced)
  const handlePersonalBest = ({ reps, weight }) => {
    if (celebrationTimeout.current) {
      clearTimeout(celebrationTimeout.current);
    }
    celebrationTimeout.current = setTimeout(() => {
      setConfettiMsg(`🎉 New Personal Best! ${reps} reps @ ${weight} ${exercise.sets[0]?.unit || ''}`);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4000);
    }, 2000);
  };

  const completedSetsForExercise = exercise.sets ? exercise.sets.filter(set => set.reps > 0).length : 0;
  const totalSetsForExercise = exercise.sets ? exercise.sets.length : 0;

  const getExerciseTips = async () => {
    setFetchingTips(true);
    setExerciseTips('');
    setExerciseTipsError(null);
    setTipsModalOpen(true);
    try {
      const response = await fetch(`${API_BASE_URL}/exercise-tips/${exercise.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additional_input: tipsAdditionalInput }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }
      const tips = await response.text();
      setExerciseTips(tips);
    } catch (err) {
      setExerciseTipsError(`Couldn't get those tips: ${err.message}`);
    } finally {
      setFetchingTips(false);
    }
  };

  return (
    <div className="bg-zinc-800 p-5 rounded-lg shadow-md mb-5 border border-zinc-700">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xl sm:text-2xl font-semibold text-blue-200">{exercise.name}</h4>
        {totalSetsForExercise > 0 && (
          <span className="text-zinc-400 text-sm font-medium">
            {completedSetsForExercise} / {totalSetsForExercise} Sets
          </span>
        )}
      </div>
      <div className="exercise-targets">
        <span>
          Target Reps: {exercise.target_reps !== null && exercise.target_reps !== undefined ? exercise.target_reps : <em>Not set</em>}
        </span>
        <span style={{ marginLeft: '1em' }}>
          Target Weight: {exercise.target_weight !== null && exercise.target_weight !== undefined ? exercise.target_weight : <em>Not set</em>}
        </span>
      </div>
      <p className="text-sm text-zinc-400 mb-1">Target Muscles: <span className="font-medium">{exercise.target_muscles || 'N/A'}</span></p>
      <p className="text-sm text-zinc-400 mb-1">Machine: <span className="font-medium">{exercise.machine || 'N/A'}</span></p>
      {exercise.attachments && <p className="text-sm text-zinc-400">Attachments: <span className="font-medium">{exercise.attachments}</span></p>}

      <div className="mt-4">
        <p className="font-bold text-zinc-300 mb-2 text-lg">Sets:</p>
        {exercise.sets && exercise.sets.length > 0 ? (
          <div className="space-y-3">
            {exercise.sets.map((set, setIndex) => (
              <SetRow
                key={setIndex}
                set={{ ...set, onPersonalBest: handlePersonalBest }}
                exIndex={exIndex}
                setIndex={setIndex}
                handleSetChange={handleSetChange}
                setRefs={setRefs}
                exercise={exercise}
              />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm italic">NO SETS! COME ON, WE GOTTA GET SOME SETS IN!</p>
        )}
      </div>
      {exercise.id && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={getExerciseTips}
            disabled={fetchingTips}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            <i className="fas fa-lightbulb mr-2"></i> GET TIPS FOR THIS EXERCISE, YEAH BUDDY!
          </button>
          <button
            onClick={() => setReplaceModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out flex items-center justify-center text-sm"
          >
            <i className="fas fa-exchange-alt mr-2"></i> REPLACE EXERCISE
          </button>
        </div>
      )}

      {/* Modal for exercise tips */}
      {tipsModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-300">EXERCISE TIPS</h2>
              <button
                onClick={() => setTipsModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors duration-200"
              >
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <textarea
              className="w-full p-3 border border-zinc-700 rounded-md bg-zinc-900 text-white placeholder-zinc-500 focus:ring-1 focus:ring-blue-500 transition duration-300 ease-in-out resize-y mb-4"
              rows="3"
              placeholder="Ask for specific tips..."
              value={tipsAdditionalInput}
              onChange={e => setTipsAdditionalInput(e.target.value)}
            ></textarea>
            <button
              onClick={getExerciseTips}
              disabled={fetchingTips}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-md mb-4"
            >
              {fetchingTips ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  GETTING TIPS...
                </>
              ) : (
                <>
                  <i className="fas fa-sync-alt mr-2"></i> REGENERATE TIPS
                </>
              )}
            </button>
            {fetchingTips && <p className="text-blue-400 text-center mb-4">GETTING THE KNOWLEDGE!</p>}
            {exerciseTipsError && (
              <p className="text-red-400 text-center mb-4">{exerciseTipsError}</p>
            )}
            <div className="bg-zinc-700 p-4 rounded-md border border-zinc-600 whitespace-pre-wrap text-zinc-200 text-sm leading-relaxed">
              {exerciseTips || (fetchingTips ? "LOADING TIPS!" : "NO TIPS YET!")}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setTipsModalOpen(false)}
                className="bg-zinc-600 hover:bg-zinc-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Exercise Modal */}
      <ExerciseReplaceModal
        exerciseId={exercise.id}
        open={replaceModalOpen}
        onClose={() => setReplaceModalOpen(false)}
        onReplace={refreshWorkout}
      />
      <ConfettiCelebration show={showConfetti} message={confettiMsg} />
    </div>
  );
};

export default ExerciseBlock;