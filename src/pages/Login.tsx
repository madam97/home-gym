import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import LoginError from '../errors/LoginError';
import { useAuth } from '../hooks/useAuth';

export default function Login(): JSX.Element {

  const auth = useAuth();
  const history = useHistory();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  /**
   * Logins the user
   * @param event 
   */
  const login = async (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    try {
      setError('');

      await auth.login(username, password);
      console.log('history return');
      history.go(-1);
    } catch (err) {
      if (err instanceof LoginError) {
        setError(err.message);
      }
    }
  }



  // -------------------------------

  return (
    <section className="section">
      <div className="row row-center">
        <div className="col xs-12 sm-6">
          <h1 className="t-center">Login to HomeGym</h1>

          <form onSubmit={(event) => login(event)}>
            <div className={`input-row ${error ? 'input-row-error' : ''}`}>
              <input 
                className="input"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                placeholder="Username"
              />
            </div>
            <div className={`input-row ${error ? 'input-row-error' : ''}`}>
              <input 
                className="input"
                name="username"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                placeholder="Password"
              />

              {error && <p className="input-message">{error}</p>}
            </div>

            <div className="t-center">
              <button 
                className="btn btn-primary" 
                type="submit" 
                onClick={(event) => login(event)}
              >Login</button>
            </div>
          </form>
        </div>
      </div>

    </section>
  );
}