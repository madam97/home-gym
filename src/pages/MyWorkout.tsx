import { useState } from 'react'
import moment from 'moment';
import Days from '../components/Days';
import useFetch from '../hooks/useFetch';
import Workout from '../components/Workout';
import { Link } from 'react-router-dom';

export default function MyWorkout(): JSX.Element {

  const [activeDay, setActiveDay] = useState<number>(moment().isoWeekday());

  const { data: workouts, loading } = useFetch<IWorkout[]>({url: '/workouts?_expand[]=excercise&_expand[]=weightType'});

  /**
   * Gets the workouts of the active day
   * @returns
   */
  const getWorkoutsOfDay = (): IWorkout[] => {
    const workoutsOfDay: IWorkout[] = [];

    if (workouts) {
      for (const workout of workouts) {
        if (workout.day === activeDay) {
          workoutsOfDay.push(workout);
        }
      }
  
      workoutsOfDay.sort((a,b) => a.orderInd - b.orderInd);
    }

    return workoutsOfDay;
  }



  // -------------------------------------------

  const workoutsOfDay = getWorkoutsOfDay();

  return (
    <>
      <section className="section flex-block">
        <h1>My workout plan</h1>
        <Link className="btn btn-primary ml-auto" to={`/my-workout/edit-day-${activeDay}`}>Edit day</Link>
      </section>

      <section className="section mb-2">
        <Days activeDay={activeDay} setActiveDay={setActiveDay} />
      </section>

      {!loading && workoutsOfDay.length > 0 && 
        <section className="section">
          <div className="row">
            {workoutsOfDay.map((workout, index) => (
              <div key={workout.id} className="col sm-6 lg-4">
                <Workout index={index} workoutProp={workout} />
              </div>
            ))}
          </div>
        </section>
      }

      {!loading && workoutsOfDay.length === 0 && 
        <section className="section t-center">
          <p className="h4">Rest day</p>
          <p>Relax and stretch your muscles to endure the next day of training.</p>
        </section>
      }
    </>
  );
}
