import React, { useMemo, useState } from 'react';
import ExerciseBlock from './ExerciseBlock';

const TodayWorkoutDisplay = ({ todayWorkout, loading, error, handleSetChange, setRefs, refreshWorkout }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [chosenExercises, setChosenExercises] = useState({}); // Store chosen exercise ID by group name

  // Handle choosing an exercise (hide others in the same group)
  const handleChooseExercise = (exerciseId, groupName) => {
    setChosenExercises(prev => ({
      ...prev,
      [groupName]: exerciseId
    }));
  };

  // Group exercises by exercise_group and calculate progress
  const { exerciseGroups, completedSets, totalSets, progressPercentage } = useMemo(() => {
    if (!todayWorkout || !todayWorkout.exercises || todayWorkout.exercises.length === 0) {
      return { exerciseGroups: [], completedSets: 0, totalSets: 0, progressPercentage: 0 };
    }

    // Debug logging
    console.log('Today workout exercises:', todayWorkout.exercises);
    console.log('Exercise groups:', todayWorkout.exercises.map(ex => ({ name: ex.name, group: ex.exercise_group })));

    // Group exercises by exercise_group
    const groups = {};
    todayWorkout.exercises.forEach(exercise => {
      const groupName = exercise.exercise_group || 'Ungrouped';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(exercise);
    });

    console.log('Grouped exercises:', groups);

    // Filter exercises based on chosen exercises
    const filteredGroups = {};
    Object.entries(groups).forEach(([groupName, exercises]) => {
      const chosenExerciseId = chosenExercises[groupName];
      if (chosenExerciseId) {
        // If an exercise is chosen in this group, show only that exercise
        const chosenExercise = exercises.find(ex => ex.id === chosenExerciseId);
        filteredGroups[groupName] = chosenExercise ? [chosenExercise] : exercises;
      } else {
        // No exercise chosen yet, show all exercises in the group
        filteredGroups[groupName] = exercises;
      }
    });

    // Convert to array format for easier handling
    const groupArray = Object.entries(filteredGroups).map(([groupName, exercises]) => ({
      name: groupName,
      exercises: exercises
    }));

    console.log('Final exercise groups:', groupArray);
    console.log('Number of groups:', groupArray.length);

    // Calculate progress based on groups (not individual exercises)
    let total = 0;
    let completed = 0;
    
    // Group all exercises first (including filtered ones)
    const allGroups = {};
    todayWorkout.exercises.forEach(exercise => {
      const groupName = exercise.exercise_group || 'Ungrouped';
      if (!allGroups[groupName]) {
        allGroups[groupName] = [];
      }
      allGroups[groupName].push(exercise);
    });

    // Calculate progress for each group
    Object.entries(allGroups).forEach(([groupName, exercises]) => {
      const chosenExerciseId = chosenExercises[groupName];
      let exerciseToCount;

      if (chosenExerciseId) {
        // If an exercise is chosen, use that one
        exerciseToCount = exercises.find(ex => ex.id === chosenExerciseId);
      } else {
        // If no exercise is chosen, use the one with the maximum number of sets
        exerciseToCount = exercises.reduce((maxEx, currentEx) => {
          const maxSets = maxEx?.sets?.length || 0;
          const currentSets = currentEx?.sets?.length || 0;
          return currentSets > maxSets ? currentEx : maxEx;
        }, exercises[0]);
      }

      // Count sets from the selected exercise for this group
      if (exerciseToCount && exerciseToCount.sets) {
        total += exerciseToCount.sets.length;
        completed += exerciseToCount.sets.filter(set => set.reps > 0).length;
      }
    });

    const percent = total > 0 ? Math.floor((completed / total) * 100) : 0;
    
    return { 
      exerciseGroups: groupArray, 
      completedSets: completed, 
      totalSets: total, 
      progressPercentage: percent 
    };
  }, [todayWorkout, chosenExercises]);

  return (
    <section>
      <h2 className="text-2xl sm:text-4xl font-extrabold mb-6 text-center text-cyan-300 flex flex-col sm:flex-row items-center justify-center gap-2">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-cyan-400 rounded-full mr-3 animate-pulse"></div>
          <i className="fas fa-microchip mr-2 text-cyan-400"></i>
          <span className="whitespace-nowrap">QUANTUM</span>
        </div>
        <div className="flex items-center">
          <span className="text-purple-400 whitespace-nowrap">OPTIMIZATION</span>
          <span className="hidden sm:inline ml-2">PROTOCOL</span>
          <span className="sm:hidden ml-2">SYS</span>
          <div className="w-4 h-4 bg-purple-400 rounded-full ml-3 animate-pulse" style={{animationDelay: '0.5s'}}></div>
        </div>
      </h2>
      {todayWorkout ? (
        <div className="border border-cyan-500/30 p-6 rounded-xl glass-card shadow-2xl relative overflow-hidden">
          {/* Holographic overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"></div>
          <div className="absolute inset-0 holographic opacity-20"></div>

          <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white relative z-10 flex items-center">
            <i className="fas fa-dna mr-3 text-cyan-400"></i>
            {todayWorkout.title}
          </h3>
          {todayWorkout.subtitle && <p className="text-zinc-300 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
          {todayWorkout.ai_tips && (
            <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-200 p-4 rounded-md mb-6 shadow-sm text-sm sm:text-base">
              <p className="font-bold mb-1">� NEURAL ANALYSIS COMPLETE</p>
              <p>{todayWorkout.ai_tips}</p>
            </div>
          )}
          {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
            <div className="relative z-10">
              {/* Tab Navigation */}
              {exerciseGroups.length > 1 && (
                <div className="mb-6">
                  <div className="flex flex-wrap border-b border-cyan-500/30">
                    {exerciseGroups.map((group, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        className={`px-4 py-2 font-medium text-sm transition-all duration-300 border-b-2 mr-2 mb-2 rounded-t-lg ${
                          activeTab === index
                            ? 'text-cyan-300 border-cyan-400 bg-cyan-900/20 neon-glow'
                            : 'text-cyan-400/60 border-transparent hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-cyan-900/10'
                        }`}
                      >
                        <i className="fas fa-circuit-board mr-2"></i>
                        {group.name}
                        <span className="ml-2 text-xs bg-cyan-900/50 px-2 py-1 rounded-full border border-cyan-500/30">
                          {group.exercises.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise Content */}
              {exerciseGroups.length > 0 && (
                <div>
                  {exerciseGroups.length === 1 ? (
                    // If only one group, show exercises directly without tabs
                    exerciseGroups[0].exercises.map((exercise) => {
                      // Find the global index of this exercise in the original workout
                      const globalExIndex = todayWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                      return (
                        <ExerciseBlock
                          key={exercise.id || globalExIndex}
                          exercise={exercise}
                          exIndex={globalExIndex}
                          handleSetChange={handleSetChange}
                          setRefs={setRefs}
                          refreshWorkout={refreshWorkout}
                          onChooseExercise={handleChooseExercise}
                          exerciseGroup={exerciseGroups[0].name}
                          isChosen={chosenExercises[exerciseGroups[0].name] === exercise.id}
                          hasMultipleInGroup={exerciseGroups[0].exercises.length > 1}
                        />
                      );
                    })
                  ) : (
                    // Multiple groups - show tabbed content
                    exerciseGroups[activeTab]?.exercises.map((exercise) => {
                      // Find the global index of this exercise in the original workout
                      const globalExIndex = todayWorkout.exercises.findIndex(ex => ex.id === exercise.id);
                      return (
                        <ExerciseBlock
                          key={exercise.id || globalExIndex}
                          exercise={exercise}
                          exIndex={globalExIndex}
                          handleSetChange={handleSetChange}
                          setRefs={setRefs}
                          refreshWorkout={refreshWorkout}
                          onChooseExercise={handleChooseExercise}
                          exerciseGroup={exerciseGroups[activeTab].name}
                          isChosen={chosenExercises[exerciseGroups[activeTab].name] === exercise.id}
                          hasMultipleInGroup={exerciseGroups[activeTab].exercises.length > 1}
                        />
                      );
                    })
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-500 text-center text-lg mt-8">
              NO EXERCISES TODAY! LIGHT WEIGHT! Hit that "Get New Workout Plan" button and LET'S GO!
              <br />
              (Looking for workout for today: {new Date().toDateString()})
            </p>
          )}
        </div>
      ) : (
        !loading && !error && (
          <p className="text-zinc-500 text-center text-lg mt-8">
            NO WORKOUT LOADED! WE NEED A PLAN! Hit that "Get New Workout Plan" button, LIGHT WEIGHT!
            <br />
            (Looking for workout for today: {new Date().toDateString()})
          </p>
        )
      )}
    </section>
  );
};

export default TodayWorkoutDisplay;
