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
  
  const { data: excercises } = useFetch<IExcercise[]>({url: '/excercises'});
  const { data: weightTypes } = useFetch<IWeightType[]>({url: '/weightTypes'});
  const { data: workoutsTmp, loading } = useFetch<IWorkout[]>({url: `/workouts?day=${day}&_sort=orderInd&_expand[]=excercise&_expand[]=weightType`});
  const { runFetch } = useFetch<IWorkout>({});

  const [workouts, setWorkouts] = useState<IWorkout[]>();

  useEffect(() => {
    setWorkouts(workoutsTmp);
  }, [workoutsTmp]);

  /**
   * Inserts the given workout
   * @param workout 
   */
  const insertWorkout = (newWorkoutData: Record<string,any>): void => {
    const workout: IWorkout = {
      id: 0,
      excerciseId: newWorkoutData.excerciseId,
      excercise: newWorkoutData.excercise,
      weightTypeId: newWorkoutData.weightTypeId,
      weightType: newWorkoutData.weightType,
      weight: newWorkoutData.weight,
      repetitions: newWorkoutData.repetitions,
      completedRepetition: -1,
      day: parseInt(day),
      orderInd: workouts ? workouts.length : 1
    };

    const newWorkouts = workouts ? workouts.slice() : [];
    newWorkouts.push(workout);
    setWorkouts(newWorkouts);
    
    runFetch({
      method: 'POST',
      url: '/workouts',
      body: newWorkoutData, 
      callback: () => {
        showUpdateForm(newWorkouts.length - 1);
      }
    });
  }

  /**
   * Updates the given workout data
   * @param index 
   * @param newWorkout
   */
  const updateWorkout = (index: number, newWorkoutData: Record<string,any>): void => {
    if (workouts) {
      const newWorkouts = workouts.slice();
      newWorkouts[index] = {
        ...newWorkouts[index],
        ...newWorkoutData
      };
      setWorkouts(newWorkouts);
    }

    runFetch({
      method: 'PATCH',
      url: `/workouts/${newWorkoutData.id}`,
      body: newWorkoutData, 
      callback: () => {
        showUpdateForm(-1);
      }
    });
  }

  const showInsertForm = (): void => {
    setShownInsertForm(true);
    setEditedWorkoutIndex(-1);
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
            excercises={excercises} 
            weightTypes={weightTypes} 
            insertWorkout={insertWorkout} 
          />
        </section>
      }

      {/* Edit workouts list */}
      {!loading && workouts && workouts.length > 0 && 
        <section className="section">
          <div className="row">
            {workouts.map((workout, index) => (
              <div key={workout.id} className="col">
                {editedWorkoutIndex === index && 
                  <WorkoutFrom 
                    index={index} 
                    workout={workout}
                    excercises={excercises} 
                    weightTypes={weightTypes} 
                    updateWorkout={updateWorkout} 
                  />
                }
                {editedWorkoutIndex !== index && 
                  <Workout 
                    index={index} 
                    workoutProp={workout} 
                    showEditBtn={true} 
                  />
                }
              </div>
            ))}
          </div>
        </section>
      }

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
