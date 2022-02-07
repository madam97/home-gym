import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import routes from '../config/routes';
import { useAuth } from '../hooks/useAuth';

export default function Header(): JSX.Element {

  const auth = useAuth();
  const history = useHistory();

  const [menuOpened, setMenuOpened] = useState<boolean>(false);

  /**
   * Returns true if user is on home page
   * @returns 
   */
   const getNavTransparent = (): boolean => {
    return history.location.pathname === '/' || history.location.pathname === '/home';
  }

  const [navTransparent, setNavTransparent] = useState<boolean>(getNavTransparent());

  useEffect(() => {
    history.listen(() => {
      setNavTransparent(getNavTransparent());
    });
  }, [history, setNavTransparent]);

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
        <nav className={`nav ${navTransparent ? 'nav-transparent' : ''}`}>
          <Link className="logo mr-auto" to="/">HomeGym</Link>

          <ul className={`nav-menu ${menuOpened ? 'opened' : ''}`}>
            {routes.map((route, index) => {
              if (route.showInHeader && (!route.loginRequired || auth.user)) {
                return (
                  <li key={index}>
                    <Link to={route.path}>{route.name}</Link>
                  </li>
                );
              }
            })}
          </ul>

          {!auth.user && <Link className="btn btn-primary" to="/login">Login</Link>}
          {auth.user && <button className="btn btn-primary" onClick={(event) => logout(event)}>Logout</button>}

          <button className="nav-toggler ml-1" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>
    </>
  )
};