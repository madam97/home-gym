import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Header(): JSX.Element {

  const [isMenuOpened, setIsMenuOpened] = useState<boolean>(false);

  /**
   * Opens/closes the header menu
   */
  const toggleMenu = (): void => {
    setIsMenuOpened(!isMenuOpened);
  }

  return (
    <header>
      <nav className="nav">
        <Link className="logo" to="/">HomeGym</Link>

        <button className="nav-toggler" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpened ? 'opened' : ''}`}>
          <li>
            <Link to="/my-workout">My workout plan</Link>
          </li>
          <li>
            <Link to="/performance">Workout performance</Link>
          </li>
          <li>
            <Link to="/excercises">Excercises</Link>
          </li>
        </ul>
      </nav>
    </header>
  )
};