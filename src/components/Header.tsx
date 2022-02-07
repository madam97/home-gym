import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import routes from '../config/routes';
import { useAuth } from '../hooks/useAuth';

export default function Header(): JSX.Element {

  const auth = useAuth();
  const history = useHistory();

  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  /**
   * Opens/closes the header menu
   */
  const toggleMenu = (): void => {
    setMenuOpened(!menuOpened);
  }

  /**
   * Logouts the user
   * @param event 
   */
  const logout = (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): void => {
    event.preventDefault();

    auth.logout();
    history.push('/login');
  }


  // ---------------------------------------------

  return (
    <>
      <header>
        <nav className="nav">
          <Link className="logo mr-auto" to="/">HomeGym</Link>

          <ul className={`nav-menu ${menuOpened ? 'opened' : ''}`}>
            {routes.map((route) => {
              if (route.showInHeader && (!route.loginRequired || auth.user)) {
                return (
                  <li>
                    <Link to={route.path}>{route.name}</Link>
                  </li>
                );
              }
            })}
          </ul>

          {!auth.user && <Link className="btn btn-primary" to="/login">Login</Link>}
          {auth.user && <button className="btn btn-primary" onClick={(event) => logout(event)}>Logout</button>}

          <button className="nav-toggler" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>
    </>
  )
};