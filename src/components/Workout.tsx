import { useState } from 'react';
import { GiWeightLiftingUp, GiMuscleUp, GiCheckMark } from 'react-icons/gi';
import useFetch from '../hooks/useFetch';

type WorkoutProps = {
  index: number,
  workoutProp: IWorkout
};

export default function Workout({ index, workoutProp }: WorkoutProps): JSX.Element {

  const [workout, setWorkout] = useState<IWorkout>(workoutProp);

  const { runFetch } = useFetch<IWorkout>(`/workouts/${workout.id}`, 'PATCH');

  const setCompletedRepetition = (repetitionIndex: number): void => {
    const completedRepetition = workout.completedRepetition === repetitionIndex ? repetitionIndex-1 : repetitionIndex;

    setWorkout((prevWorkout) => ({
      ...prevWorkout,
      completedRepetition
    }));

    runFetch({ completedRepetition });
  }

  // -------------------------------

  // True, if all the repetitions of the workout are completed
  const allRepetitionCompleted = workout.completedRepetition+1 === workout.repetitions.length;

  return (
    <div className={`card ${allRepetitionCompleted ? 'bg-gray' : ''}`}>
      {workout.excercise && 
        <>
          <p className="subtitle container-float">
            <span className="t-space-after f-larger f-black">{index + 1}.</span>

            {workout.excercise.excerciseTypes && 
              <span>
                {workout.excercise.excerciseTypes.map((excerciseType, index) => 
                  (index > 0 ? ', ' : '') + excerciseType.name
                )}
              </span>
            }
            
            {allRepetitionCompleted && <GiCheckMark className="icon icon-green float-right" />}
            {!allRepetitionCompleted && workout.excercise.useDumbbells && <GiWeightLiftingUp className="icon float-right" />}
            {!allRepetitionCompleted && !workout.excercise.useDumbbells && <GiMuscleUp className="icon float-right" />}
          </p>

          <p className="title">{workout.excercise.name}</p>

          <div className="chart-line">
            {workout.repetitions.map((repetition, i) => (
              <span 
                key={i} 
                className={`chart-line-dot ${i <= workout.completedRepetition ? 'active' : ''}`}
                onClick={(event) => setCompletedRepetition(i)}
              >{repetition}</span>
            ))}
          </div>
        </>
      }
    </div>
  )
}