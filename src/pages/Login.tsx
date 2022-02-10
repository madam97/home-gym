import { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import FormInputPassword from '../components/FormInputPassword';
import AuthError from '../errors/AuthError';
import { useAuth } from '../hooks/useAuth';

export default function Login(): JSX.Element {

  const auth = useAuth();
  const history = useHistory();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  /**
   * Logins the user
   * @param event 
   */
  const login = async (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    try {
      setFormError('');

      await auth.login(username, password);
      console.log('history return');
      history.go(-1);
    } catch (err) {
      if (err instanceof AuthError) {
        setFormError(err.message);
      }
    }
  }



  // -------------------------------

  return (
    <section className="section">
      <div className="row row-center">
        <div className="col xs-12 sm-6">

          <form className="mt-2 card bg-gray" onSubmit={(event) => login(event)}>
            <h1 className="t-center">Login to HomeGym</h1>

            <div className={`input-row ${formError ? 'input-row-error' : ''}`}>
              <input 
                className="input"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                placeholder="Username"
              />
            </div>
            <div className={`input-row ${formError ? 'input-row-error' : ''}`}>
              <FormInputPassword
                name="password"
                value={password}
                setValue={setPassword}
                placeholder="Password"
              />

              {formError && <p className="input-message">{formError}</p>}
            </div>

            <div className="t-center">
              <button 
                className="btn btn-primary" 
                type="submit" 
                onClick={(event) => login(event)}
              >Login</button>
            </div>
          </form>

          <p className="my-3 t-center">
            <span className="title title-lined">or</span>
          </p>
          <p className="t-center">
            <Link className="link" to="/register">Register</Link> a new HomeGym account
          </p>
        </div>
      </div>

    </section>
  );
}