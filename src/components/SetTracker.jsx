import React, { useMemo } from 'react';

const SetTracker = ({ todayWorkout }) => {
  // Utility function to normalize muscle names (remove parenthetical variations)
  const normalizeMuscle = (muscleName) => {
    if (!muscleName || typeof muscleName !== 'string') return muscleName;
    return muscleName.replace(/\s*\([^)]*\)/g, '').trim();
  };

  // Calculate muscle-based set tracking
  const muscleSetTracking = useMemo(() => {
    if (!todayWorkout || !todayWorkout.exercises || todayWorkout.exercises.length === 0) {
      return null;
    }

    const muscleData = {};
    
    // Process each exercise and its sets
    todayWorkout.exercises.forEach(exercise => {
      // Get all muscles this exercise targets
      const muscles = [];
      
      // Add primary category muscle
      if (exercise.category) {
        muscles.push(normalizeMuscle(exercise.category));
      }
      
      // Parse target_muscles field if it exists (may contain additional muscles)
      if (exercise.target_muscles) {
        const targetMuscles = exercise.target_muscles.split(',').map(m => normalizeMuscle(m.trim()));
        targetMuscles.forEach(muscle => {
          if (muscle && !muscles.includes(muscle)) {
            muscles.push(muscle);
          }
        });
      }
      
      // Count total and completed sets for this exercise
      const totalSets = exercise.sets ? exercise.sets.length : 0;
      const completedSets = exercise.sets ? exercise.sets.filter(set => 
        set.reps && set.reps > 0 && set.weight && set.weight > 0
      ).length : 0;
      
      // Add sets to each muscle this exercise targets
      muscles.forEach(muscle => {
        if (!muscleData[muscle]) {
          muscleData[muscle] = {
            muscle,
            totalSets: 0,
            completedSets: 0,
            targetSets: null
          };
        }
        muscleData[muscle].totalSets += totalSets;
        muscleData[muscle].completedSets += completedSets;
      });
    });
    
    // Add target sets from muscle_volume_targets if available
    if (todayWorkout.muscle_volume_targets) {
      Object.entries(todayWorkout.muscle_volume_targets).forEach(([muscle, targetSets]) => {
        const normalizedMuscle = normalizeMuscle(muscle);
        if (muscleData[normalizedMuscle]) {
          muscleData[normalizedMuscle].targetSets = targetSets;
        } else {
          // Create entry even if no exercises target this muscle yet
          muscleData[normalizedMuscle] = {
            muscle: normalizedMuscle,
            totalSets: 0,
            completedSets: 0,
            targetSets
          };
        }
      });
    }
    
    return Object.values(muscleData).sort((a, b) => {
      // Sort by: 1) has target sets, 2) completion percentage, 3) alphabetically
      if (a.targetSets && !b.targetSets) return -1;
      if (!a.targetSets && b.targetSets) return 1;
      
      const aPercentage = a.totalSets > 0 ? (a.completedSets / a.totalSets) : 0;
      const bPercentage = b.totalSets > 0 ? (b.completedSets / b.totalSets) : 0;
      
      if (Math.abs(aPercentage - bPercentage) > 0.01) {
        return aPercentage - bPercentage;
      }
      
      return a.muscle.localeCompare(b.muscle);
    });
  }, [todayWorkout]);

  if (!muscleSetTracking || muscleSetTracking.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="border border-cyan-500/30 p-6 rounded-xl glass-card shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400"></div>
        <div className="absolute inset-0 holographic opacity-10"></div>

        <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white relative z-10 flex items-center">
          <i className="fas fa-chart-line mr-3 text-purple-400"></i>
          Muscle Set Tracker
        </h3>

        {/* Muscle Set Tracking */}
        <div className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {muscleSetTracking.map((data) => {
              const hasTarget = data.targetSets !== null;
              const currentSets = data.completedSets;
              const totalSets = hasTarget ? data.targetSets : data.totalSets;
              const percentage = totalSets > 0 
                ? Math.min(100, Math.round((currentSets / totalSets) * 100)) 
                : 0;
              const isComplete = hasTarget 
                ? currentSets >= data.targetSets 
                : (data.totalSets > 0 && currentSets === data.totalSets);
              
              return (
                <div 
                  key={data.muscle}
                  className={`p-4 rounded-lg border transition-all ${
                    isComplete 
                      ? 'bg-green-900/20 border-green-500/50 shadow-lg shadow-green-500/20' 
                      : 'bg-slate-800/50 border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-cyan-200">
                          {data.muscle}
                        </span>
                        {isComplete && (
                          <i className="fas fa-check-circle text-green-400 text-sm"></i>
                        )}
                      </div>
                      {hasTarget && (
                        <div className="text-xs text-cyan-400/70 mt-1">
                          <i className="fas fa-bullseye mr-1"></i>
                          Target: {data.targetSets} sets
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        isComplete ? 'text-green-400' : 'text-purple-300'
                      }`}>
                        {currentSets}{hasTarget ? `/${data.targetSets}` : `/${data.totalSets}`}
                      </div>
                      <div className="text-xs text-cyan-400/70">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        isComplete 
                          ? 'bg-gradient-to-r from-green-500 to-green-400' 
                          : 'bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  {/* Additional info */}
                  {data.totalSets > 0 && (
                    <div className="mt-2 text-xs text-slate-400">
                      <i className="fas fa-dumbbell mr-1"></i>
                      {data.totalSets} total set{data.totalSets !== 1 ? 's' : ''} available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetTracker;
