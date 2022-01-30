import React, { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';

type WorkoutEditProps = {
  index: number
  workout: IWorkout,
  excercises?: IExcercise[],
  weightTypes?: IWeightType[],
  updateWorkout(index: number, newWorkoutData: object): void,
  setEditedWorkoutIndex: (editedWorkoutIndex: number) => void
};

export default function WorkoutEdit({ index, workout, excercises, weightTypes, updateWorkout, setEditedWorkoutIndex }: WorkoutEditProps): JSX.Element {

  const [excercise, setExcercise] = useState<IExcercise | undefined>();
  const [weightType, setWeightType] = useState<IWeightType | undefined>();
  const [weight, setWeight] = useState<number | string>('');
  const [repetitions, setRepetitions] = useState<number[]>([]);

  const [excerciseName, setExcerciseName] = useState<string>('');
  const [weightTypeName, setWeightTypeName] = useState<string>('');

  const { runFetch } = useFetch<IWorkout>(`/workouts/${workout.id}`, 'PATCH');

  useEffect((): void => {
    setExcercise(workout.excercise);
    setWeightType(workout.weightType);
    setWeight(workout.weight);
    setRepetitions(workout.repetitions);

    setExcerciseName(workout.excercise ? workout.excercise.name : '');
    setWeightTypeName(workout.weightType ? workout.weightType.name : '');
  }, [workout]);

  /**
   * Saves the workout data
   * @param event 
   */
  const saveWorkout = (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): void => {
    event.preventDefault();

    const newWorkoutData = {
      excercise,
      weightType,
      weight: typeof weight !== 'string' && weight >= 0 ? weight : 0,
      repetitions,
      completedRepetition: workout.repetitions.length !== repetitions.length ? -1 : workout.completedRepetition
    };

    runFetch(newWorkoutData, () => {
      setEditedWorkoutIndex(-1);
    });

    updateWorkout(index, newWorkoutData);
  }

  /**
   * Changes excercise's name
   * @param excerciseName
   */
  const changeExcerciseName = (excerciseName: string): void => {
    setExcerciseName(excerciseName);
    
    let excercise: IExcercise | undefined = undefined;

    if (excercises) {
      for (const excerciseTmp of excercises) {
        if (excerciseTmp.name === excerciseName) {
          excercise = excerciseTmp;
          break;
        }
      }
    }

    setExcercise(excercise);
  }

  /**
   * Changes weight type's name
   * @param weightTypeName
   */
   const changeWeightTypeName = (weightTypeName: string): void => {
    setWeightTypeName(weightTypeName);
    
    let weightType: IWeightType | undefined = undefined;

    if (weightTypes) {
      for (const weightTypeTmp of weightTypes) {
        if (weightTypeTmp.name === weightTypeName) {
          weightType = weightTypeTmp;
          break;
        }
      }
    }

    setWeightType(weightType);
  }

  /**
   * Changes the weight size
   * @param weight 
   */
  const changeWeight = (weight: number): void => {
    setWeight(weight >= 0 && typeof weight !== 'string' ? weight : '');
  }

  /**
   * Changes the repetitions of the excercise
   * @param repetition 
   * @param index 
   */
  const changeRepetition = (repetition: number, index: number): void => {
    const newRepetitions: number[] = repetitions.slice();
    newRepetitions[index] = repetition;
    setRepetitions(newRepetitions);
  }

  const addRepetition = (event: React.FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const newRepetitions: number[] = repetitions.slice();

    if (newRepetitions.length <= 10) {
      const lastRepetition: number | undefined = newRepetitions.at(-1);
      newRepetitions.push(lastRepetition ? lastRepetition : 0);
      setRepetitions(newRepetitions);
    }
  }

  const removeRepetition = (event: React.FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const newRepetitions: number[] = repetitions.slice();

    if (newRepetitions.length > 1) {
      newRepetitions.pop();
      setRepetitions(newRepetitions);
    }
  }


  // -------------------------------

  return (
    <form className="card bg-gray" onSubmit={(event) => saveWorkout(event)}>
      <p className="subtitle flex-block">
        {excercise && excercise.excerciseTypes && 
          <span>
            {excercise.excerciseTypes.map((excerciseType, index) => 
              (index > 0 ? ', ' : '') + excerciseType.name
            )}
          </span>
        }
      </p>
      
      {/* Excercise */}
      <div className="input-block">
        <input 
          className="input" 
          name="excerciseName"
          value={excerciseName} 
          list="list-excercises" 
          placeholder="Choose an excercise" 
          onChange={(event) => changeExcerciseName(event.currentTarget.value.trim())}
        />
      </div>
      
      {/* Weight type */}
      <div className="input-block">
        <input 
          className="input" 
          name="weightTypeName"
          value={weightTypeName} 
          list="list-weight-types" 
          placeholder="Choose an weight type" 
          onChange={(event) => changeWeightTypeName(event.currentTarget.value.trim())}
        />
      </div>
      
      {/* Weight size */}
      <div className="input-block input-block-btn-right">
        <input 
          className="input" 
          type="number"
          name="weight"
          value={weight} 
          placeholder="Give the weight size" 
          onChange={(event) => changeWeight(parseFloat(event.currentTarget.value))}
        />

        <span className="input-btn">kg</span>
      </div>

      {/* Repetitions */}
      <div className="input-block">
        <button className="input-btn input-btn-rounded" onClick={(event) => removeRepetition(event)}>-</button>

        <div className="chart-line w-100 mx-1">
          {repetitions.map((repetition, i) => (
            <span 
              key={i} 
              className="chart-line-dot"
            >
              <input 
                className="input input-number-hide-arrows input-char-2"
                type="number"
                name="repetitions[]"
                value={repetition}
                min={1}
                max={99}
                onChange={(event) => changeRepetition(parseInt(event.currentTarget.value), i)}
              />
            </span>
          ))}
        </div>
        
        <button className="input-btn input-btn-rounded" onClick={(event) => addRepetition(event)}>+</button>
      </div>

      {/* Save button */}
      <div className="mt-2 t-center">
        <button 
          className="btn btn-primary" 
          type="submit" 
          onClick={(event) => saveWorkout(event)}
        >Save</button>
      </div>
    </form>
  );
}