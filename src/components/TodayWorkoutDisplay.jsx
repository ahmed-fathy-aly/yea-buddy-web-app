import React, { useMemo, useState } from 'react';
import ExerciseBlock from './ExerciseBlock';

const TodayWorkoutDisplay = ({ todayWorkout, loading, error, handleSetChange, setRefs, refreshWorkout, selectedMuscles = [], selectedDay }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chosenExercises, setChosenExercises] = useState({}); // Store chosen exercise ID by subcategory

  // Format selected day for display
  const formattedSelectedDay = useMemo(() => {
    if (!selectedDay) return 'Today';
    const dateObj = new Date(selectedDay + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    const diffMs = today - dateObj;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    
    return dateObj.toLocaleDateString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  }, [selectedDay]);

  // Handle choosing an exercise (hide others in the same subcategory)
  const handleChooseExercise = (exerciseId, subcategory) => {
    setChosenExercises(prev => ({
      ...prev,
      [subcategory]: exerciseId
    }));
  };

  // Group exercises by subcategory
  const { exercisesBySubcategory, recommendedSelection } = useMemo(() => {
    if (!todayWorkout || !todayWorkout.exercises || todayWorkout.exercises.length === 0) {
      return { exercisesBySubcategory: [], recommendedSelection: null };
    }

    // Filter and sort exercises by selected muscles and muscle points
    let filteredExercises = todayWorkout.exercises;
    if (selectedMuscles.length > 0) {
      // Only include exercises that contribute to at least one selected muscle
      filteredExercises = todayWorkout.exercises.filter(exercise => {
        if (!exercise.muscle_points) return false;
        return selectedMuscles.some(muscle => (exercise.muscle_points[muscle] || 0) > 0);
      });
      // Sort by total points for the first selected muscle (descending)
      const primaryMuscle = selectedMuscles[0];
      filteredExercises = filteredExercises.slice().sort((a, b) => {
        const aPoints = (a.muscle_points && a.muscle_points[primaryMuscle]) || 0;
        const bPoints = (b.muscle_points && b.muscle_points[primaryMuscle]) || 0;
        return bPoints - aPoints;
      });
    }

    // Group exercises by subcategory
    const groups = {};
    filteredExercises.forEach(exercise => {
      const subcategory = exercise.subcategory || 'Other Movements';
      if (!groups[subcategory]) {
        groups[subcategory] = {
          exercises: [],
          categories: new Set()
        };
      }
      groups[subcategory].exercises.push(exercise);
      if (exercise.category) {
        groups[subcategory].categories.add(exercise.category);
      }
    });

    // Convert to array and calculate recommendations
    const subcategoryArray = Object.entries(groups).map(([subcategory, data]) => {
      const exercises = data.exercises;
      const exerciseGroups = {};
      
      // Group by exercise_group to count variants
      exercises.forEach(ex => {
        const group = ex.exercise_group || ex.name;
        if (!exerciseGroups[group]) {
          exerciseGroups[group] = [];
        }
        exerciseGroups[group].push(ex);
      });

      const uniqueGroupCount = Object.keys(exerciseGroups).length;
      let recommendation = '';
      
      if (uniqueGroupCount === 1) {
        recommendation = 'Pick 1 variant from the available options';
      } else if (uniqueGroupCount <= 3) {
        recommendation = `Choose 1 exercise (pick the variant that works best for you)`;
      } else {
        recommendation = `Choose 1-2 exercises from this subcategory`;
      }

      return {
        subcategory,
        exercises,
        categories: Array.from(data.categories),
        exerciseGroups,
        recommendation
      };
    });

    return {
      exercisesBySubcategory: subcategoryArray,
      recommendedSelection: todayWorkout.recommended_selection
    };
  }, [todayWorkout, selectedMuscles]);

  return (
    <section>
      <h2 className="text-2xl sm:text-4xl font-extrabold mb-6 text-center text-cyan-300 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
          <i className="fas fa-microchip mr-2 text-cyan-400"></i>
          <span className="whitespace-nowrap">WORKOUT FOR</span>
        </div>
        <div className="flex items-center">
          <span className="text-purple-400 whitespace-nowrap">{formattedSelectedDay.toUpperCase()}</span>
          <div className="w-4 h-4 bg-purple-400 rounded-full ml-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </h2>
      {todayWorkout ? (
        <div className="border border-cyan-500/30 p-6 rounded-xl glass-card shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
          <div className="absolute inset-0 holographic opacity-20"></div>

          <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white relative z-10 flex items-center">
            <i className="fas fa-dna mr-3 text-cyan-400"></i>
            {todayWorkout.title}
          </h3>
          {todayWorkout.day && (
            <div className="mb-3 text-sm text-cyan-300/80 relative z-10">
              <i className="fas fa-calendar-day mr-2"></i>
              Workout Date: {todayWorkout.day}
            </div>
          )}
          {todayWorkout.subtitle && <p className="text-zinc-300 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
          
          {/* Workout Plan Info */}
          {recommendedSelection && (
            <div className="bg-cyan-900/20 border-l-4 border-cyan-500 text-cyan-200 p-4 rounded-md mb-6 shadow-sm text-sm sm:text-base relative z-10">
              <p className="font-bold mb-2">📋 WORKOUT PLAN</p>
              {todayWorkout.duration_minutes && (
                <p className="mb-1">⏱️ Duration: {todayWorkout.duration_minutes} minutes</p>
              )}
              {recommendedSelection.total_exercises && (
                <p className="mb-1">🎯 Target: {recommendedSelection.total_exercises} exercises</p>
              )}
              {recommendedSelection.per_category && (
                <p className="mb-1">💡 Guide: {recommendedSelection.per_category}</p>
              )}
            </div>
          )}

          {/* Active Filter Badge */}
          {selectedMuscles.length > 0 && (
            <div className="bg-purple-900/30 border-l-4 border-purple-500 text-purple-200 p-4 rounded-md mb-6 shadow-sm text-sm relative z-10">
              <p className="font-bold mb-2">
                <i className="fas fa-filter mr-2"></i>
                Active Filter
              </p>
              <p className="mb-1">
                Showing exercises for: <span className="font-semibold">{selectedMuscles.join(', ')}</span>
              </p>
              <p className="text-xs text-purple-300 italic mt-2">
                💡 Click muscles above to change filter or clear to show all exercises
              </p>
            </div>
          )}

          {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
            <div className="relative z-10">
              {exercisesBySubcategory.length === 0 && selectedMuscles.length > 0 ? (
                <div className="text-center py-8">
                  <p className="text-zinc-400 text-lg mb-4">
                    No exercises found for selected muscles
                  </p>
                  <p className="text-zinc-500 text-sm">
                    Try selecting different muscles or clear the filter
                  </p>
                </div>
              ) : (
                <>
              {/* Subcategory Tab Navigation */}
              {exercisesBySubcategory.length > 1 && (
                <div className="mb-6">
                  <div className="flex flex-col gap-3">
                    {exercisesBySubcategory.map((subcatData, index) => {
                      const chosenCount = chosenExercises[subcatData.subcategory] ? 1 : 0;
                      const totalCount = Object.keys(subcatData.exerciseGroups).length;
                      
                      // Calculate total points per muscle for this subcategory
                      const musclePointsForSubcategory = {};
                      subcatData.exercises.forEach(ex => {
                        if (ex.muscle_points) {
                          Object.entries(ex.muscle_points).forEach(([muscle, points]) => {
                            musclePointsForSubcategory[muscle] = (musclePointsForSubcategory[muscle] || 0) + points;
                          });
                        }
                      });
                      
                      // Sort muscles by points, prioritizing selected muscles
                      const sortedMusclePoints = Object.entries(musclePointsForSubcategory)
                        .sort((a, b) => {
                          // If a muscle is selected, prioritize it
                          const aIsSelected = selectedMuscles.includes(a[0]);
                          const bIsSelected = selectedMuscles.includes(b[0]);
                          
                          if (aIsSelected && !bIsSelected) return -1;
                          if (!aIsSelected && bIsSelected) return 1;
                          
                          // Otherwise sort by points descending
                          return b[1] - a[1];
                        })
                        .slice(0, 3); // Show top 3 muscles
                      
                      return (
                        <button
                          key={index}
                          onClick={() => setActiveTab(index)}
                          className={`w-full px-6 py-4 font-medium text-sm transition-all duration-300 rounded-lg border-2 ${
                            activeTab === index
                              ? 'text-cyan-300 border-cyan-400 bg-cyan-900/30 neon-glow shadow-lg'
                              : 'text-cyan-400/60 border-cyan-500/30 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-900/20'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center justify-center gap-2">
                              <i className="fas fa-dumbbell"></i>
                              <span className="font-bold text-base">{subcatData.subcategory.split('(')[0].trim()}</span>
                            </div>
                            <div className="text-xs text-cyan-300/70 font-normal">
                              <i className="fas fa-bullseye mr-1"></i>
                              {subcatData.categories.join(', ')}
                            </div>
                            {/* Show muscle points contribution */}
                            {sortedMusclePoints.length > 0 && (
                              <div className="flex flex-wrap gap-1 justify-center mt-1">
                                {sortedMusclePoints.map(([muscle, points]) => (
                                  <span 
                                    key={muscle} 
                                    className={`text-xs px-2 py-0.5 rounded font-mono ${
                                      selectedMuscles.includes(muscle)
                                        ? 'bg-purple-500/30 border border-purple-400/50 text-purple-200 font-bold'
                                        : 'bg-cyan-900/40 border border-cyan-500/30 text-cyan-300/80'
                                    }`}
                                  >
                                    {muscle}: {points}pts
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-xs mt-1">
                              <span className={chosenCount > 0 ? 'text-green-400 font-bold' : 'text-cyan-400/80'}>
                                {chosenCount}/{totalCount} selected
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Exercise Content */}
              {exercisesBySubcategory.length > 0 && (
                <div>
                  {exercisesBySubcategory.map((subcatData, tabIndex) => {
                    if (exercisesBySubcategory.length > 1 && tabIndex !== activeTab) return null;
                    
                    return (
                      <div key={tabIndex} className="mb-8">
                        {/* Subcategory Header */}
                        <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/30">
                          <h4 className="text-lg font-bold text-cyan-300 mb-2">
                            {subcatData.subcategory}
                          </h4>
                          <div className="text-sm text-cyan-200/80 mb-2">
                            <span className="font-semibold">Targets:</span> {subcatData.categories.join(', ')}
                          </div>
                          <div className="text-sm text-purple-300 italic">
                            💡 {subcatData.recommendation}
                          </div>
                        </div>

                        {/* Exercise Groups */}
                        {Object.entries(subcatData.exerciseGroups).map(([groupName, groupExercises]) => {
                          const chosenId = chosenExercises[subcatData.subcategory];
                          const isGroupChosen = chosenId && groupExercises.some(ex => ex.id === chosenId);
                          const shouldShowGroup = !chosenId || isGroupChosen;

                          if (!shouldShowGroup) return null;

                          return (
                            <div key={groupName} className="mb-6">
                              {/* Exercise Group Header */}
                              {Object.keys(subcatData.exerciseGroups).length > 1 && (
                                <div className="mb-3 pl-4 border-l-2 border-cyan-500/50">
                                  <h5 className="text-md font-semibold text-cyan-200">
                                    {groupName} {groupExercises.length > 1 && `(${groupExercises.length} variants)`}
                                  </h5>
                                </div>
                              )}

                              {/* Exercises */}
                              {groupExercises.map((exercise) => {
                                const globalExIndex = todayWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                                const isChosen = chosenExercises[subcatData.subcategory] === exercise.id;
                                const shouldShow = !chosenExercises[subcatData.subcategory] || isChosen;

                                if (!shouldShow) return null;

                                // Show muscle points breakdown above each exercise
                                const musclePoints = exercise.muscle_points || {};
                                const musclePointsList = Object.entries(musclePoints)
                                  .filter(([muscle, points]) => points > 0)
                                  .sort((a, b) => b[1] - a[1]);

                                return (
                                  <div key={exercise.id || globalExIndex} className="mb-2">
                                    {musclePointsList.length > 0 && (
                                      <div className="mb-1 flex flex-wrap gap-2">
                                        {musclePointsList.map(([muscle, points]) => (
                                          <span key={muscle} className="bg-cyan-900/40 border border-cyan-400/40 text-cyan-200 text-xs px-2 py-1 rounded font-mono">
                                            {muscle}: <span className="font-bold">{points} pts</span>
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                    <ExerciseBlock
                                      exercise={exercise}
                                      exIndex={globalExIndex}
                                      handleSetChange={handleSetChange}
                                      setRefs={setRefs}
                                      refreshWorkout={refreshWorkout}
                                      onChooseExercise={handleChooseExercise}
                                      exerciseGroup={subcatData.subcategory}
                                      isChosen={isChosen}
                                      hasMultipleInGroup={!chosenExercises[subcatData.subcategory] && subcatData.exercises.length > 1}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
                </>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 text-center text-lg mt-8">
              NO EXERCISES TODAY! Hit that "Generate Protocol" button!
            </p>
          )}
        </div>
      ) : (
        !loading && !error && (
          <p className="text-zinc-500 text-center text-lg mt-8">
            NO WORKOUT LOADED! Hit that "Generate Protocol" button!
          </p>
        )
      )}
    </section>
  );
};

export default TodayWorkoutDisplay;
