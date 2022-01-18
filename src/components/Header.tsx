import { useState } from 'react';

const Header = (): JSX.Element => {

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
        <a className="logo" href="/">HomeGym</a>

        <button className="nav-toggler" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`nav-menu ${isMenuOpened ? 'opened' : ''}`}>
          <li><a href="">My workout plan</a></li>
          <li><a href="">Workout performance</a></li>
          <li><a href="">Excercises</a></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header;
