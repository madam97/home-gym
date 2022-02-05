import { useEffect, useState } from 'react'
import moment from 'moment';
import Days from '../components/Days';
import useFetch from '../hooks/useFetch';
import Workout from '../components/Workout';
import { Link } from 'react-router-dom';

export default function MyWorkout(): JSX.Element {

  const [activeDay, setActiveDay] = useState<number>(moment().isoWeekday());
  const [workoutsOfDay, setWorkoutsOfDay] = useState<IWorkout[]>([]);

  const { data: workoutsTmp, loading } = useFetch<IWorkout[]>({url: `/workouts?_sort=orderInd&_expand[]=excercise&_expand[]=weightType`});

  const [workouts, setWorkouts] = useState<IWorkout[]>();

  useEffect((): void => {
    setWorkouts(workoutsTmp);
  }, [workoutsTmp]);

  useEffect((): void => {
    const workoutsOfDay: IWorkout[] = [];

    if (workouts) {
      for (const workout of workouts) {
        if (workout.day === activeDay) {
          workoutsOfDay.push(workout);
        }
      }
    }

    setWorkoutsOfDay(workoutsOfDay);
  }, [workouts, activeDay]);

  /**
   * Updates the given workout
   * @param newWorkout 
   * @param update
   */
  const changeWorkouts = (newWorkout: IWorkout): void => {
    const newWorkouts = workouts ? workouts.slice() : [];
    const index = getWorkoutIndex(newWorkout.id);
    newWorkouts[index] = newWorkout;
    setWorkouts(newWorkouts);
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


  // -------------------------------------------

  return (
    <>
      <section className="section flex-block">
        <h1>My workout plan</h1>
        <Link className="btn btn-primary ml-auto" to={`/my-workout/edit-day-${activeDay}`}>Edit day</Link>
      </section>

      <section className="section mb-2">
        <Days activeDay={activeDay} setActiveDay={setActiveDay} />
      </section>

      {!loading && workoutsOfDay && workoutsOfDay.length > 0 && 
        <section className="section">
          <div className="row">
            {workoutsOfDay.map((workout, index) => (
              <div key={workout.id} className="col sm-6 lg-4">
                <Workout 
                  index={index} 
                  workout={workout} 
                  changeWorkouts={changeWorkouts}
                />
              </div>
            ))}
          </div>
        </section>
      }

      {!loading && (!workoutsOfDay || workoutsOfDay.length === 0) && 
        <section className="section t-center">
          <p className="h4">Rest day</p>
          <p>Relax and stretch your muscles to endure the next day of training.</p>
        </section>
      }
    </>
  );
}
