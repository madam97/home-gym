import React from 'react';
import { BrowserRouter as Router, Switch, Route, RouteComponentProps } from 'react-router-dom';
import Header from './components/Header';
import routes from './config/routes';
import { ProvideAuth } from './hooks/useAuth';

const App = (): JSX.Element => {
  return (
    <ProvideAuth>
      <Router basename="/home-gym">
        <div className="App">
          <Header />

          <main>
            <Switch>
              {routes.map((route, index): JSX.Element => (
                <Route 
                  key={index}
                  path={route.path}
                  exact={route.exact}
                >
                  <route.component
                    {...route.props}
                  />
                </Route>
              ))}
            </Switch>
          </main>
        </div>
      </Router>
    </ProvideAuth>
  );
}

export default App;
