import Home from '../pages/Home';
import MyWorkout from '../pages/MyWorkout';
import MyWorkoutEdit from '../pages/MyWorkoutEdit';
import Performance from '../pages/Performance';
import Excercises from '../pages/Excercises';

const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    component: Home
  },
  {
    path: '/my-workout',
    exact: true,
    component: MyWorkout
  },
  {
    path: '/my-workout/edit-day-:day(1|2|3|4|5|6|7)',
    exact: true,
    component: MyWorkoutEdit
  },
  {
    path: '/performance',
    exact: true,
    component: Performance
  },
  {
    path: '/excercises',
    exact: true,
    component: Excercises
  },
];

export default routes;