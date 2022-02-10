import React from 'react';
import { GiWeightLiftingUp, GiMuscleUp, GiCheckMark } from 'react-icons/gi';
import useFetch from '../hooks/useFetch';

type WorkoutProps = {
  index: number,
  workout: IWorkout,
  showUpdateForm?: (index: number) => void,
  changeWorkouts?: (newWorkout: IWorkout) => void,
  removeWorkout?: (workoutId: number) => void
};

export default function Workout({ index, workout, showUpdateForm, changeWorkouts, removeWorkout}: WorkoutProps): JSX.Element {

  const { runFetch: runPatch } = useFetch<IWorkout>({method: 'PATCH', url: `/workouts/${workout.id}`});
  const { runFetch: runDelete } = useFetch<IWorkout>({method: 'DELETE', url: `/workouts/${workout.id}`});
  
  /**
   * Sets the last completed repetition's index of the workout
   * @param repetitionIndex 
   */
   const setCompletedRepetition = (repetitionIndex: number): void => {
    if (!showUpdateForm && changeWorkouts) {
      const newWorkout: IWorkout = {
        ...workout,
        completedRepetition: workout.completedRepetition === repetitionIndex ? repetitionIndex-1 : repetitionIndex
      };
  
      runPatch({ 
        body: { 
          completedRepetition: newWorkout.completedRepetition 
        },
        callback: (): void => {
          changeWorkouts(newWorkout);
        }
      });
    }
  }

  /**
   * Deletes the workout
   */
  const deleteWorkout = (): void => {
    if (removeWorkout) {
      runDelete({ 
        callback: () => removeWorkout(workout.id)
      });
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
                className={`chart-line-dot ${!showUpdateForm ? 'clickable' : ''} ${!showUpdateForm && i <= workout.completedRepetition ? 'active' : ''}`}
                onClick={() => setCompletedRepetition(i)}
              >{repetition}</span>
            ))}
          </div>

          {/* Edit, remove button */}
          {(showUpdateForm || removeWorkout) &&
            <div className="mt-2 t-center">
              {showUpdateForm && <button className="btn btn-primary" onClick={() => showUpdateForm(index)}>Edit</button>}
              {removeWorkout && <button className="btn btn-outline-black ml-1" onClick={() => deleteWorkout()}>Delete</button>}
            </div>
          }
        </>
      }
    </div>
  )
}