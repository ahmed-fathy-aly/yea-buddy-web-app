import React, { useMemo } from 'react';

const MuscleVolumeTracker = ({ workout, selectedMuscles, onMuscleToggle }) => {
  const muscleProgress = useMemo(() => {
    if (!workout) {
      return [];
    }

    // Use muscle_points_targets or recommended_points as fallback
    const targets = workout.muscle_points_targets || workout.recommended_points || {};
    if (Object.keys(targets).length === 0) {
      return [];
    }
    
    const progress = [];

    Object.keys(targets).forEach(muscle => {
      const targetPoints = targets[muscle];
      let completedPoints = 0;

      // Sum points for this muscle across all exercises and all completed sets
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          if (exercise.muscle_points && exercise.sets) {
            // For each completed set, add the muscle_points for this muscle
            const points = exercise.muscle_points[muscle] || 0;
            const completedSets = exercise.sets.filter(set => set.reps > 0).length;
            completedPoints += points * completedSets;
          }
        });
      }

      const percentage = targetPoints > 0 ? Math.round((completedPoints / targetPoints) * 100) : 0;
      
      progress.push({
        muscle,
        completed: completedPoints,
        target: targetPoints,
        percentage
      });
    });

    return progress.sort((a, b) => b.percentage - a.percentage);
  }, [workout]);

  if (muscleProgress.length === 0) {
    return null;
  }

  const handleMuscleClick = (muscle) => {
    if (onMuscleToggle) {
      onMuscleToggle(muscle);
    }
  };

  return (
    <div className="glass-card border border-cyan-500/30 rounded-xl p-6 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400"></div>
      
      <h3 className="text-xl font-bold mb-2 text-cyan-300 flex items-center">
        <i className="fas fa-dumbbell mr-3 text-cyan-400"></i>
        💪 Muscle Points Progress
      </h3>
      
      <p className="text-xs text-cyan-400/70 mb-4 italic">
        💡 Click on muscles to filter exercises below
      </p>

      <div className="space-y-4">
        {muscleProgress.map(({ muscle, completed, target, percentage }) => {
          const isSelected = selectedMuscles.includes(muscle);
          
          return (
            <button
              key={muscle}
              onClick={() => handleMuscleClick(muscle)}
              className={`w-full text-left space-y-2 p-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-cyan-500/20 border-2 border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'bg-transparent border-2 border-transparent hover:bg-cyan-500/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    isSelected 
                      ? 'bg-cyan-400 border-cyan-400' 
                      : 'bg-transparent border-cyan-500/50'
                  }`}>
                    {isSelected && (
                      <i className="fas fa-check text-slate-900 text-xs"></i>
                    )}
                  </div>
                  <span className={`font-medium text-sm ${
                    isSelected ? 'text-cyan-100' : 'text-cyan-200'
                  }`}>
                    {muscle}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-cyan-100 font-mono text-sm mr-2">
                    {completed}/{target} pts
                  </span>
                  {percentage >= 100 && (
                    <span className="text-green-400 text-lg">✅</span>
                  )}
                </div>
              </div>
              
              <div className="relative h-3 glass rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentage >= 100
                      ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                      : percentage >= 75
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-400'
                      : percentage >= 50
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                      : 'bg-gradient-to-r from-red-400 to-pink-400'
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              <div className="text-xs text-cyan-400/70 font-mono">
                {percentage}% complete
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedMuscles.length > 0 && (
        <button
          onClick={() => onMuscleToggle(null)}
          className="mt-4 w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/50 rounded-lg text-sm text-purple-200 font-medium transition-all"
        >
          <i className="fas fa-times mr-2"></i>
          Clear Filter (Show All Exercises)
        </button>
      )}
    </div>
  );
};

export default MuscleVolumeTracker;
