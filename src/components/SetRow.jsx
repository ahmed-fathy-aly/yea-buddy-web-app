import React, { useState } from 'react';

const SetRow = ({ set, exIndex, setIndex, handleSetChange, exercise, setRefs }) => {
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weight);
  const [unit, setUnit] = useState(set.unit);

  // Notify parent if needed
  const notifyChange = (field, value) => {
    if (handleSetChange) {
      handleSetChange(exIndex, setIndex, field, value);
    }
  };

  const handleRepsChange = (value) => {
    setReps(value);
    notifyChange('reps', value);
  };

  const handleWeightChange = (value) => {
    setWeight(value);
    notifyChange('weight', value);
  };

  const handleUnitChange = (value) => {
    setUnit(value);
    notifyChange('unit', value);
  };

  return (
    <div
      ref={el => {
        if (setRefs && setRefs.current) {
          setRefs.current[`${exIndex}-${setIndex}`] = el;
        }
      }}
      id={`set-${exIndex}-${setIndex}`}
      className={`p-4 rounded-md shadow-inner border ${reps > 0 ? 'bg-green-900 border-green-700' : 'bg-zinc-900 border-zinc-700'}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2">
        <span className="font-semibold text-blue-100 text-base mb-2 sm:mb-0 sm:mr-4 w-full sm:w-auto">Set {setIndex + 1}:</span>
        <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
          <label htmlFor={`reps-${exIndex}-${setIndex}`} className="sr-only">Reps</label>
          <div className="flex items-center">
            <button
              onClick={() => handleRepsChange(Math.max(0, (reps || 0) - 1))}
              className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
              aria-label="Decrease reps"
            >
              -
            </button>
            <input
              id={`reps-${exIndex}-${setIndex}`}
              type="number"
              step="1"
              min="0"
              className="w-16 p-2 mx-1 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={set.reps}
              onChange={(e) => handleRepsChange(parseInt(e.target.value) || 0)}
              aria-label={`Reps for ${exercise.name} Set ${setIndex + 1}`}
            />
            <button
              onClick={() => handleRepsChange((reps || 0) + 1)}
              className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-md w-8 h-8 flex items-center justify-center text-lg font-bold transition-colors duration-200"
              aria-label="Increase reps"
            >
              +
            </button>
          </div>
          <span className="text-zinc-400 ml-2 text-base">reps</span>
        </div>
        <div className="flex items-center">
          <label htmlFor={`weight-${exIndex}-${setIndex}`} className="sr-only">Weight</label>
          <input
            id={`weight-${exIndex}-${setIndex}`}
            type="number"
            step="0.5"
            min="0"
            className="w-28 p-2 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500"
            value={set.weight}
            onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
            aria-label={`Weight for ${exercise.name} Set ${setIndex + 1}`}
          />
          <label htmlFor={`unit-${exIndex}-${setIndex}`} className="sr-only">Unit</label>
          <select
            id={`unit-${exIndex}-${setIndex}`}
            className="w-20 p-2 border border-zinc-600 rounded-md bg-zinc-950 text-white text-center text-base focus:ring-1 focus:ring-blue-500 appearance-none pl-2 pr-2 ml-2"
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            aria-label={`Unit for ${exercise.name} Set ${setIndex + 1}`}
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>
      </div>
      {set.ai_tips && (
        <p className="text-xs sm:text-sm text-blue-400 italic mt-2 w-full">
          <span className="font-semibold">Tip:</span> {set.ai_tips}
        </p>
      )}
    </div>
  );
};

export default SetRow;