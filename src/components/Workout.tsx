import { useState } from 'react';
import { GiWeightLiftingUp, GiMuscleUp, GiCheckMark } from 'react-icons/gi';
import useFetch from '../hooks/useFetch';

type WorkoutProps = {
  index: number,
  workoutProp: IWorkout,
  showUpdateForm?: (index: number) => void
};

export default function Workout({ index, workoutProp, showUpdateForm}: WorkoutProps): JSX.Element {

  const [workout, setWorkout] = useState<IWorkout>(workoutProp);

  const { runFetch: runPatch } = useFetch<IWorkout>({method: 'PATCH', url: `/workouts/${workout.id}`});

  
  /**
   * Sets the last completed repetition's index of the workout
   * @param repetitionIndex 
   */
   const setCompletedRepetition = (repetitionIndex: number): void => {
    if (!showUpdateForm) {
      const completedRepetition = workout.completedRepetition === repetitionIndex ? repetitionIndex-1 : repetitionIndex;
  
      setWorkout((prevWorkout) => ({
        ...prevWorkout,
        completedRepetition
      }));
  
      runPatch({ body: { completedRepetition } });
    }
  }

  // -------------------------------

  // True, if all the repetitions of the workout are completed
  const allRepetitionCompleted = !showUpdateForm && workout.completedRepetition+1 === workout.repetitions.length;

  return (
    <div className={`card ${allRepetitionCompleted ? 'bg-gray' : ''}`}>
      {workout.excercise && 
        <>
          {/* Header */}
          <p className="subtitle flex-block">
            {/* Icons */}
            {!showUpdateForm && 
              <>
                {allRepetitionCompleted && <GiCheckMark className="icon icon-green t-space-after" />}
                {!allRepetitionCompleted && workout.weightTypeId !== 1 && <GiWeightLiftingUp className="icon t-space-after" />}
                {!allRepetitionCompleted && workout.weightTypeId === 1 && <GiMuscleUp className="icon t-space-after" />}
              </>
            }

            {/* Types of the excercise */}
            {workout.excercise.excerciseTypes && 
              <span>
                {workout.excercise.excerciseTypes.map((excerciseType, index) => 
                  (index > 0 ? ', ' : '') + excerciseType.name
                )}
              </span>
            }

            {/* Order index */}
            <span className="f-larger f-black ml-auto">{index + 1}.</span>
          </p>

          {/* Excercise name */}
          <p className="title">{workout.excercise.name}</p>

          {/* Weight type and size */}
          {workout.weightType && 
            <p className="t-center">
              {workout.weightType.name}
              {workout.weight > 0 ? 
                ' - '+workout.weight+'kg' : 
                (workout.weightType.zeroWeight ? ' - '+workout.weightType.zeroWeight : '')
              }
            </p>
          }

          {/* Repetitions */}
          <div className="chart-line">
            {workout.repetitions.map((repetition, i) => (
              <span 
                key={i} 
                className={`chart-line-dot ${!showUpdateForm && i <= workout.completedRepetition ? 'active' : ''}`}
                onClick={() => setCompletedRepetition(i)}
              >{repetition}</span>
            ))}
          </div>

          {/* Edit button */}
          {showUpdateForm &&
            <div className="mt-2 t-center">
              <button className="btn btn-primary" onClick={() => showUpdateForm(index)}>Edit</button>
            </div>
          }
        </>
      }
    </div>
  )
}