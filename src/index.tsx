import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './style.scss';
import App from './App';
import { ProvideTheme } from './hooks/useTheme';
import { ProvideAuth } from './hooks/useAuth';

ReactDOM.render(
  <React.StrictMode>
    <ProvideTheme>
      <ProvideAuth>
        <Router basename={process.env.REACT_APP_HOMEPAGE}>
          <App />
        </Router>
      </ProvideAuth>
    </ProvideTheme>
  </React.StrictMode>,
  document.getElementById('root')
);
