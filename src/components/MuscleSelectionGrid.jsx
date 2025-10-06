import React, { useState } from 'react';

const MuscleSelectionGrid = ({ selectedMuscles, onMuscleToggle }) => {
  const muscles = [
    { name: 'Back', icon: '💪' },
    { name: 'Chest', icon: '🫁' },
    { name: 'Traps', icon: '🔺' },
    { name: 'Triceps', icon: '💪' },
    { name: 'Biceps', icon: '💪' },
    { name: 'Legs', icon: '🦵' },
    { name: 'Core', icon: '⚡' },
    { name: 'Calves', icon: '🦵' },
    { name: 'Shoulders', icon: '🏋️' }
  ];

  const isMuscleSelected = (muscle) => {
    return selectedMuscles.includes(muscle);
  };

  const handleMuscleClick = (muscle) => {
    onMuscleToggle(muscle);
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-4 text-center text-blue-400">
        <i className="fas fa-crosshairs mr-2"></i>TARGET SPECIFIC MUSCLES
      </h3>
      <p className="text-sm text-zinc-400 text-center mb-4">
        Select the muscles you want to focus on (optional). Leave empty for a full-body approach!
      </p>
      
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {muscles.map((muscle) => (
          <button
            key={muscle.name}
            onClick={() => handleMuscleClick(muscle.name)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-300 ease-in-out
              transform hover:scale-105 hover:shadow-lg
              ${isMuscleSelected(muscle.name)
                ? 'bg-blue-600 border-blue-400 text-white shadow-blue-400/30 shadow-lg'
                : 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:border-blue-500 hover:bg-zinc-700'
              }
            `}
          >
            <div className="flex flex-col items-center space-y-2">
              <span className="text-2xl">{muscle.icon}</span>
              <span className={`text-sm font-bold ${
                isMuscleSelected(muscle.name) ? 'text-white' : 'text-zinc-300'
              }`}>
                {muscle.name}
              </span>
            </div>
            
            {/* Selection indicator */}
            {isMuscleSelected(muscle.name) && (
              <div className="absolute -top-1 -right-1 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center">
                <i className="fas fa-check text-xs"></i>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {selectedMuscles.length > 0 && (
        <div className="mt-4 p-3 bg-zinc-800 rounded-lg border border-blue-500">
          <div className="text-center">
            <span className="text-blue-400 font-bold">Selected: </span>
            <span className="text-white">
              {selectedMuscles.join(', ')}
            </span>
            <button
              onClick={() => selectedMuscles.forEach(muscle => onMuscleToggle(muscle))}
              className="ml-3 text-xs text-zinc-400 hover:text-white underline"
            >
              Clear All
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MuscleSelectionGrid;