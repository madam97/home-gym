import React, { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';

type WorkoutFromProps = {
  index?: number
  workout?: IWorkout,
  excercises?: IExcercise[],
  weightTypes?: IWeightType[],
  changeWorkouts(newWorkout: IWorkout, update: boolean): void
};

export default function WorkoutFrom({ index = -1, workout, excercises, weightTypes, changeWorkouts }: WorkoutFromProps): JSX.Element {

  const isUpdate = workout && workout.id !== 0;

  const [excercise, setExcercise] = useState<IExcercise | undefined>();
  const [weightType, setWeightType] = useState<IWeightType | undefined>();
  const [weight, setWeight] = useState<number | string>('');
  const [repetitions, setRepetitions] = useState<number[]>([]);

  const [excerciseName, setExcerciseName] = useState<string>('');
  const [weightTypeName, setWeightTypeName] = useState<string>('');
  const [formErrors, setFormErrors] = useState<IFormErrors>({});

  /**
   * Set form values
   */
  useEffect((): void => {
    // Update
    if (workout) {
      setExcercise(workout.excercise);
      setWeightType(workout.weightType);
      setWeight(workout.weight);
      setRepetitions(workout.repetitions);
  
      setExcerciseName(workout.excercise ? workout.excercise.name : '');
      setWeightTypeName(workout.weightType ? workout.weightType.name : '');
    }
    // Insert
    else {
      setRepetitions([10]);
    }
  }, [workout]);

  const { data: patchData, runFetch: runPatch} = useFetch<IWorkout>({ method: 'PATCH', url: `/workouts/${workout ? workout.id : 0}` });
  const { data: postData, runFetch: runPost} = useFetch<IWorkout>({ method: 'POST', url: '/workouts' });

  /**
   * Showing POST and PATCH requests' results
   */
  useEffect((): void => {
    // Update
    if (isUpdate && patchData) {
      changeWorkouts({ excercise, weightType, ...patchData }, true);
    }
    // Insert
    else if (!isUpdate && postData) {
      changeWorkouts({ excercise, weightType, ...postData }, false);
    }
  }, [postData, patchData]);

  /**
   * Saves the workout data
   * @param event 
   */
  const saveWorkout = (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): void => {
    event.preventDefault();

    if (workout && validate()) {
      // Update
      if (isUpdate) {
        const newWorkoutData: Record<string,any> = {
          id: workout?.id,
          weight: typeof weight !== 'string' && weight >= 0 ? weight : 0,
          repetitions,
          completedRepetition: workout.repetitions.length !== repetitions.length ? -1 : workout.completedRepetition
        };
    
        if (excercise) {
          newWorkoutData.excerciseId = excercise.id;
          newWorkoutData.excercise = excercise;
        }
    
        if (weightType) {
          newWorkoutData.weightTypeId = weightType.id;
          newWorkoutData.weightType = weightType;
        }

        runPatch({ body: newWorkoutData });
      }
      // Insert
      else {
        const newWorkout: IWorkout = {
          ...workout,
          weight: typeof weight !== 'string' && weight >= 0 ? weight : 0,
          repetitions,
          completedRepetition: workout.repetitions.length !== repetitions.length ? -1 : workout.completedRepetition,
          excerciseId: excercise ? excercise.id : 0,
          excercise,
          weightTypeId: weightType ? weightType.id : 0,
          weightType
        };

        runPost({ body: newWorkout });
      }
    }
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

  /**
   * Add a new repetition
   * @param event 
   */
  const addRepetition = (event: React.FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const newRepetitions: number[] = repetitions.slice();

    if (newRepetitions.length <= 10) {
      const lastRepetition: number | undefined = newRepetitions.at(-1);
      newRepetitions.push(lastRepetition ? lastRepetition : 0);
      setRepetitions(newRepetitions);
    }
  }

  /**
   * Removes a repetition
   * @param event 
   */
  const removeRepetition = (event: React.FormEvent<HTMLButtonElement>): void => {
    event.preventDefault();

    const newRepetitions: number[] = repetitions.slice();

    if (newRepetitions.length > 1) {
      newRepetitions.pop();
      setRepetitions(newRepetitions);
    }
  }

  /**
   * Validates the workout data
   * @returns True, if there were no errors
   */
  const validate = (): boolean => {
    const newErrors: IFormErrors = {
      excercise: '',
      weightType: '',
      weight: '',
      repetitions: ''
    };

    // Excercise
    if (!excercise) {
      newErrors.excercise = 'You have to choose an excercise';
    }

    // Weight type
    if (!weightType) {
      newErrors.weightType = 'You have to choose a weight type';
    }

    // Weight
    if (weight < 0) {
      newErrors.weight = 'You have to give number larger or equal to 0';
    }

    // Repetition
    if (repetitions.length < 1) {
      newErrors.repetitions = 'You have to give at least 1 repetition';
    } else {
      let ok = true;
      for (const repetition of repetitions) {
        if (repetition < 1) {
          ok = false;
          break;
        }
      }

      if (!ok) {
        newErrors.repetitions = 'Repetitions must be larger or equal to 1';
      }
    }

    setFormErrors(newErrors);

    return Object.values(newErrors).join('') === '';
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
      <div className={`input-row ${formErrors.excercise ? 'input-row-error' : ''}`}>
        <input 
          className="input" 
          name="excerciseName"
          value={excerciseName} 
          list="list-excercises" 
          placeholder="Choose an excercise" 
          onChange={(event) => changeExcerciseName(event.currentTarget.value.trim())}
        />

        {formErrors.excercise && <p className="input-message">{formErrors.excercise}</p>}
      </div>
      
      {/* Weight type */}
      <div className={`input-row ${formErrors.weightType ? 'input-row-error' : ''}`}>
        <input 
          className="input" 
          name="weightTypeName"
          value={weightTypeName} 
          list="list-weight-types" 
          placeholder="Choose an weight type" 
          onChange={(event) => changeWeightTypeName(event.currentTarget.value.trim())}
        />

        {formErrors.weightType && <p className="input-message">{formErrors.weightType}</p>}
      </div>
      
      {/* Weight size */}
      <div className={`input-row ${formErrors.weight ? 'input-row-error' : ''}`}>
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

        {formErrors.weight && <p className="input-message">{formErrors.weight}</p>}
      </div>

      {/* Repetitions */}
      <div className={`input-row ${formErrors.repetitions ? 'input-row-error' : ''}`}>
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

        {formErrors.repetitions && <p className="input-message">{formErrors.repetitions}</p>}
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