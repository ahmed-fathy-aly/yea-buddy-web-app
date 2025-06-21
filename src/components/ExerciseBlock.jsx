import React from 'react';
import SetRow from './SetRow';

const ExerciseBlock = ({ exercise, exIndex, handleSetChange, fetchingTips, getExerciseTips }) => {
  const completedSetsForExercise = exercise.sets ? exercise.sets.filter(set => set.reps > 0).length : 0;
  const totalSetsForExercise = exercise.sets ? exercise.sets.length : 0;

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
      <p className="text-sm text-zinc-400 mb-1">Target Muscles: <span className="font-medium">{exercise.target_muscles || 'N/A'}</span></p>
      <p className="text-sm text-zinc-400 mb-1">Machine: <span className="font-medium">{exercise.machine || 'N/A'}</span></p>
      {exercise.attachments && <p className="text-sm text-zinc-400">Attachments: <span className="font-medium">{exercise.attachments}</span></p>}

      <div className="mt-4">
        <p className="font-bold text-zinc-300 mb-2 text-lg">Sets:</p>
        {exercise.sets && exercise.sets.length > 0 ? (
          <div className="space-y-3">
            {exercise.sets.map((set, setIndex) => (
              <SetRow key={setIndex} set={set} exIndex={exIndex} setIndex={setIndex} handleSetChange={handleSetChange} exercise={exercise} />
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm italic">NO SETS! COME ON, WE GOTTA GET SOME SETS IN!</p>
        )}
      </div>
      {exercise.id && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => getExerciseTips(exercise.id)}
            disabled={fetchingTips}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transform hover:scale-105 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
          >
            <i className="fas fa-lightbulb mr-2"></i> GET TIPS FOR THIS EXERCISE, YEAH BUDDY!
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseBlock;