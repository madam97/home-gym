import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Workout from '../components/Workout';
import WorkoutFrom from '../components/WorkoutForm';

type MyWorkoutFromParams = {
  day: string
};

export default function MyWorkoutFrom(): JSX.Element {

  const { day } = useParams<MyWorkoutFromParams>();
  const [shownInsertForm, setShownInsertForm] = useState<boolean>(false);
  const [editedWorkoutIndex, setEditedWorkoutIndex] = useState<number>(-1);
  
  const { data: excercises } = useFetch<IExcercise[]>({url: '/excercises?_sort=name'});
  const { data: weightTypes } = useFetch<IWeightType[]>({url: '/weightTypes'});
  const { data: workoutsTmp, loading } = useFetch<IWorkout[]>({url: `/workouts?day=${day}&_sort=orderInd&_expand[]=excercise&_expand[]=weightType`});

  const [workouts, setWorkouts] = useState<IWorkout[]>();
  const [emptyWorkout, setEmptyWorkout] = useState<IWorkout>({
    id: 0,
    excerciseId: 0,
    excercise: undefined,
    weightTypeId: 0,
    weightType: undefined,
    weight: 0,
    repetitions: [10,10,10],
    completedRepetition: -1,
    day: parseInt(day),
    orderInd: workouts ? workouts.length+1 : 1
  });

  /**
   * Sets the workouts
   */
  useEffect(() => {
    setWorkouts(workoutsTmp);
  }, [workoutsTmp]);

  /**
   * Sets the empty workout orderInd value using the number of the workouts
   */
  useEffect(() => {
    setEmptyWorkout((prevEmptyWorkout) => ({
      ...prevEmptyWorkout,
      orderInd: workouts ? workouts.length+1 : 1
    }));
  }, [workouts]);

  /**
   * Updates or saves the given workout
   * @param newWorkout 
   * @param update
   */
  const changeWorkouts = (newWorkout: IWorkout, update: boolean): void => {
    const newWorkouts = workouts ? workouts.slice() : [];

    // Update
    if (update) {
      const index = getWorkoutIndex(newWorkout.id);
      newWorkouts[index] = newWorkout;
      showUpdateForm(-1);
    }
    // Insert
    else {
      newWorkouts.push(newWorkout);

      hideInsertForm();
    }

    setWorkouts(newWorkouts);
  }

  /**
   * Removes the given workout
   * @param workoutId
   */
  const removeWorkout = (workoutId: number): void => {
    if (workouts) {
      const newWorkouts = workouts.slice();
      const index = getWorkoutIndex(workoutId);
      newWorkouts.splice(index, 1);
      setWorkouts(newWorkouts);
    }
  }

  /**
   * Returns the index of the given workout in the workouts array
   * @param workoutId
   */
  const getWorkoutIndex = (workoutId: number): number => {
    let index: number | null = null;

    if (workouts) {
      for (let i in workouts) {
        if (workouts[i].id === workoutId) {
          index = parseInt(i);
          break;
        }
      }
    }

    if (index === null) {
      throw Error(`was not able to get the index of #${workoutId} workout`);
    }
      
    return index;
  }

  /**
   * Shows the add new workout form and hides the edit form of the given workout
   */
  const showInsertForm = (): void => {
    setShownInsertForm(true);
    setEditedWorkoutIndex(-1);
  }

  /**
   * Hides the add new workout form
   */
  const hideInsertForm = (): void => {
    setShownInsertForm(false);
  }

  /**
   * Hides the add new workout form and shows the edit form of the given workout
   * @param index
   */
  const showUpdateForm = (index: number): void => {
    setShownInsertForm(false);
    setEditedWorkoutIndex(index);
  }

  // -------------------------------------------

  return (
    <>
      <section className="section flex-block">
        <h1>Edit my workout day {day}</h1>
        {!shownInsertForm && <button className="btn btn-primary ml-auto" onClick={showInsertForm}>Add new workout</button>}
      </section>

      {/* Add new workout block */}
      {shownInsertForm && 
        <section className="section mb-5">
          <WorkoutFrom 
            workout={emptyWorkout}
            excercises={excercises} 
            weightTypes={weightTypes} 
            changeWorkouts={changeWorkouts}
          />
        </section>
      }

      {/* Edit workouts list */}
      <section className="section">
        {!loading && workouts && workouts.length > 0 && 
          <div className="row">
            {workouts.map((workout, index) => (
              <div key={workout.id} className="col">
                {editedWorkoutIndex === index && 
                  <WorkoutFrom 
                    index={index} 
                    workout={workout}
                    excercises={excercises} 
                    weightTypes={weightTypes} 
                    changeWorkouts={changeWorkouts} 
                  />
                }
                {editedWorkoutIndex !== index && 
                  <Workout 
                    index={index} 
                    workout={workout} 
                    showUpdateForm={showUpdateForm}
                    removeWorkout={removeWorkout}
                  />
                }
              </div>
            ))}
          </div>
        }

        {loading && <p className="t-center">Loading workouts of the day...</p>}
        {!loading && (!workouts || workouts.length === 0) && <p className="t-center">There are now workouts on this day yet.</p>}
      </section>

      {/* Datalist for excercises */}
      {excercises && 
        <datalist id="list-excercises">
          {excercises.map((excercise) => (
            <option key={excercise.id} value={excercise.name} />
          ))}
        </datalist>
      }

      {/* Datalist for weight types */}
      {weightTypes && 
        <datalist id="list-weight-types">
          {weightTypes.map((weightType) => (
            <option key={weightType.id} value={weightType.name} />
          ))}
        </datalist>
      }
    </>
  );
}
