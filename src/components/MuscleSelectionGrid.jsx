import React, { useState } from 'react';

const MuscleSelectionGrid = ({ selectedMuscles, onMuscleToggle, muscleRatings }) => {
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

  const getMuscleRating = (muscleName) => {
    if (!muscleRatings) return null;
    return muscleRatings.find(rating => rating.muscle === muscleName);
  };

  const getRatingColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
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
        Select the muscles you want to focus on (optional). Use recovery ratings to make informed choices!
      </p>
      
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        {muscles.map((muscle) => {
          const rating = getMuscleRating(muscle.name);
          return (
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
                
                {/* Rating display */}
                {rating && (
                  <div className="w-full">
                    {/* Score display */}
                    <div className="text-xs font-bold text-center mb-1">
                      {rating.score}/100
                    </div>
                    
                    {/* Rating bar */}
                    <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getRatingColor(rating.score)}`}
                        style={{ width: `${Math.min(100, Math.max(0, rating.score))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selection indicator */}
              {isMuscleSelected(muscle.name) && (
                <div className="absolute -top-1 -right-1 bg-blue-400 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <i className="fas fa-check text-xs"></i>
                </div>
              )}
            </button>
          );
        })}
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
      
      {/* Muscle ratings explanations */}
      {muscleRatings && (
        <div className="mt-6">
          <h4 className="text-lg font-bold text-center text-green-400 mb-4">
            <i className="fas fa-chart-line mr-2"></i>Recovery Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {muscleRatings
              .sort((a, b) => b.score - a.score)
              .map((rating, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border transition-colors duration-200 ${
                    selectedMuscles.includes(rating.muscle)
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-zinc-800 border-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white">{rating.muscle}</span>
                    <span className={`font-bold px-2 py-1 rounded text-xs ${
                      rating.score >= 80 ? 'bg-green-600 text-white' :
                      rating.score >= 60 ? 'bg-yellow-600 text-white' :
                      rating.score >= 40 ? 'bg-orange-600 text-white' :
                      'bg-red-600 text-white'
                    }`}>
                      {rating.score}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs italic">
                    {rating.explanation}
                  </p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default MuscleSelectionGrid;