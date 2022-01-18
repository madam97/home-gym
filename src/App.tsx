import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MyWorkout from './pages/MyWorkout';
import Performance from './pages/Performance';
import Excercises from './pages/Excercises';

const App = (): JSX.Element => {
  return (
    <Router>
      <div className="App">
        <Header />

        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/my-workout">
            <MyWorkout />
          </Route>
          <Route path="/performance">
            <Performance />
          </Route>
          <Route path="/excercises">
            <Excercises />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
