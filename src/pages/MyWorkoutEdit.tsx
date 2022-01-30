import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Workout from '../components/Workout';
import WorkoutEdit from '../components/WorkoutEdit';

type MyWorkoutEditParams = {
  day: string
};

export default function MyWorkoutEdit(): JSX.Element {

  const { day } = useParams<MyWorkoutEditParams>();
  
  const { data: excercises } = useFetch<IExcercise[]>(`/excercises/`);
  const { data: weightTypes } = useFetch<IWeightType[]>(`/weightTypes/`);
  const { data: workoutsTmp, loading } = useFetch<IWorkout[]>(`/workouts?day=${day}&_sort=orderInd&_expand[]=excercise&_expand[]=weightType`);

  const [workouts, setWorkouts] = useState<IWorkout[]>();
  const [editedWorkoutIndex, setEditedWorkoutIndex] = useState<number>(-1);

  useEffect(() => {
    setWorkouts(workoutsTmp);
  }, [workoutsTmp]);

  /**
   * Updates the given workout data
   * @param index 
   * @param newWorkout
   */
  const updateWorkout = (index: number, newWorkoutData: object): void => {
    if (workouts) {
      const newWorkouts = workouts.slice();
      newWorkouts[index] = {
        ...newWorkouts[index],
        ...newWorkoutData
      };
      setWorkouts(newWorkouts);
    }
  }

  // -------------------------------------------

  return (
    <>
      <section className="section">
        <h1>Edit my workout day {day}</h1>
      </section>

      {!loading && workouts && workouts.length > 0 && 
        <section className="section">
          <div className="row">
            {workouts.map((workout, index) => (
              <div key={workout.id} className="col">
                {editedWorkoutIndex === index && 
                  <WorkoutEdit 
                    index={index} 
                    workout={workout}
                    excercises={excercises} 
                    weightTypes={weightTypes} 
                    updateWorkout={updateWorkout} 
                    setEditedWorkoutIndex={setEditedWorkoutIndex} 
                  />
                }
                {editedWorkoutIndex !== index && 
                  <Workout 
                    index={index} 
                    workoutProp={workout} 
                    showEditBtn={true} 
                    setEditedWorkoutIndex={setEditedWorkoutIndex} 
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
