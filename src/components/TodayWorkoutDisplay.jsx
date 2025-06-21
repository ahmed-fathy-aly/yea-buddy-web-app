import React, { useMemo } from 'react';
import ExerciseBlock from './ExerciseBlock';

const TodayWorkoutDisplay = ({ todayWorkout, loading, error, handleSetChange, setRefs }) => {
  // Calculate progress locally
  const { completedSets, totalSets, progressPercentage } = useMemo(() => {
    if (!todayWorkout || !todayWorkout.exercises || todayWorkout.exercises.length === 0) {
      return { completedSets: 0, totalSets: 0, progressPercentage: 0 };
    }
    let total = 0;
    let completed = 0;
    todayWorkout.exercises.forEach(exercise => {
      if (exercise.sets) {
        total += exercise.sets.length;
        completed += exercise.sets.filter(set => set.reps > 0).length;
      }
    });
    const percent = total > 0 ? Math.floor((completed / total) * 100) : 0;
    return { completedSets: completed, totalSets: total, progressPercentage: percent };
  }, [todayWorkout]);

  return (
    <section>
      <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-center text-blue-300">
        <i className="fas fa-calendar-alt mr-2 text-blue-400"></i>TODAY'S <span className="text-blue-500">MASSIVE WORKOUT!</span>
      </h2>
      {todayWorkout ? (
        <div className="border border-blue-700 p-6 rounded-xl bg-zinc-900 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-white">{todayWorkout.title}</h3>
          {todayWorkout.subtitle && <p className="text-zinc-300 italic mb-4 text-base">{todayWorkout.subtitle}</p>}
          {todayWorkout.ai_tips && (
            <div className="bg-blue-900 border-l-4 border-blue-500 text-blue-200 p-4 rounded-md mb-6 shadow-sm text-sm sm:text-base">
              <p className="font-bold mb-1">🧠 AI INSIGHTS, YEAH BUDDY!</p>
              <p>{todayWorkout.ai_tips}</p>
            </div>
          )}
          {todayWorkout.exercises && todayWorkout.exercises.length > 0 ? (
            todayWorkout.exercises.map((exercise, exIndex) => (
              <ExerciseBlock
                key={exercise.id || exIndex}
                exercise={exercise}
                exIndex={exIndex}
                handleSetChange={handleSetChange}
                setRefs={setRefs} // <-- Add this line
              />
            ))
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
