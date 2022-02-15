import React from 'react';
import { Switch, Route, Redirect, useLocation } from 'react-router-dom';
import Header from './components/Header';
import routes from './config/routes';

const App = (): JSX.Element => {

  const location = useLocation();

  // --------------------------------

  const isAdmin = /^\/admin.*/.test(location.pathname);

  return (
    <div className="App">
      {!isAdmin && <Header />}

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
          
          <Redirect to="/404" />
        </Switch>
      </main>
    </div>
  );
}

export default App;
