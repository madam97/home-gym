import { useState } from 'react'
import moment from 'moment';
import Days from '../components/Days';
import useFetch from '../hooks/useFetch';
import Workout from '../components/Workout';

type MyWorkoutProps = {
  
}

export default function MyWorkout({}: MyWorkoutProps): JSX.Element {

  const [activeDay, setActiveDay] = useState<number>(moment().isoWeekday());

  const { data: workouts, error, loading } = useFetch<IWorkout[]>('/workouts?_expand=excercise');

  /**
   * Gets the workouts of the active day
   * @returns
   */
  const getWorkoutsOfDay = (): IWorkout[] => {
    const workoutsOfDay: IWorkout[] = [];

    if (workouts) {
      for (const workout of workouts) {
        if (workout.days.includes(activeDay)) {
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
      <section className="section">
        <h1>My workout plan</h1>
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
