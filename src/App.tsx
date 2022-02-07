import React from 'react';
import { BrowserRouter as Router, Switch, Route, RouteComponentProps, Redirect } from 'react-router-dom';
import Header from './components/Header';
import routes from './config/routes';
import { ProvideTheme } from './hooks/useTheme';
import { ProvideAuth } from './hooks/useAuth';

const App = (): JSX.Element => {
  return (
    <ProvideTheme>
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
                
                <Redirect to="/404" />
              </Switch>
            </main>
          </div>
        </Router>
      </ProvideAuth>
    </ProvideTheme>
  );
}

export default App;
