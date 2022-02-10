import Home from '../pages/Home';
import MyWorkout from '../pages/MyWorkout';
import MyWorkoutEdit from '../pages/MyWorkoutEdit';
// import Performance from '../pages/Performance';
import Excercises from '../pages/Excercises';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ErrorPage from '../pages/Error';

const routes: IRoute[] = [
  {
    path: '/',
    exact: true,
    loginRequired: false,
    showInHeader: false,
    component: Home,
    name: 'Home page'
  },
  {
    path: '/my-workout',
    exact: true,
    loginRequired: true,
    showInHeader: true,
    component: MyWorkout,
    name: 'My workout plan'
  },
  {
    path: '/my-workout/edit-day-:day(1|2|3|4|5|6|7)',
    exact: true,
    loginRequired: true,
    showInHeader: false,
    component: MyWorkoutEdit,
    name: 'Edit my workout'
  },
  /*
  {
    path: '/performance',
    exact: true,
    loginRequired: true,
    showInHeader: true,
    component: Performance,
    name: 'My performance'
  },
  */
  {
    path: '/excercises',
    exact: true,
    loginRequired: false,
    showInHeader: true,
    component: Excercises,
    name: 'Excercises'
  },
  {
    path: '/login',
    exact: true,
    loginRequired: false,
    showInHeader: false,
    component: Login,
    name: 'Login'
  },
  {
    path: '/register',
    exact: true,
    loginRequired: false,
    showInHeader: false,
    component: Register,
    name: 'Register'
  },
  {
    path: '/404',
    exact: true,
    loginRequired: false,
    showInHeader: false,
    component: ErrorPage,
    name: '404 error',
    props: {
      code: 404
    }
  }
];

export default routes;