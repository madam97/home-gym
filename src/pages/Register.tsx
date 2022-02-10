import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import FormInputPassword from '../components/FormInputPassword';
import AuthError from '../errors/AuthError';
import { useAuth } from '../hooks/useAuth';

type RegisterProps = {}

export default function Register({}: RegisterProps) {

  const auth = useAuth();
  const history = useHistory();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [password2, setPassword2] = useState<string>('');
  const [formErrors, setFormErrors] = useState<IFormErrors>({});
  const [formMainError, setFormMainError] = useState<string>('');


  /**
   * Registers the user
   */
  const register = async (event: React.FormEvent<HTMLFormElement | HTMLButtonElement>): Promise<void> => {
    event.preventDefault();

    try {
      setFormMainError('');

      if (validate()) {
        await auth.register({
          username,
          password,
          password2
        });
        history.push('/login');
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setFormMainError(err.message);
      }
    }
  }

  /**
   * Validates the workout data
   * @returns True, if there were no errors
   */
  const validate = (): boolean => {
    const newErrors: IFormErrors = {
      username: '',
      password: '',
      password2: ''
    };

    if (!username) {
      newErrors.username = 'You have to give a username';
    } else if (username.length < 3) {
      newErrors.username = 'The username must be at least 20 characters long';
    } else if (username.length > 20) {
      newErrors.username = 'The username must be at most 20 characters long';
    }

    if (!password) {
      newErrors.password = 'You have to give a password';
    } else if (password.length < 6) {
      newErrors.password = 'The password must be at least 6 characters long';
    } else if (!password.match(/[0-9]/)) {
      newErrors.password = 'The password must be contains at least 1 number';
    }

    if (!password2) {
      newErrors.password2 = 'You have to give the password again';
    } else if (password2 !== password) {
      newErrors.password2 = 'The two password are different';
    }

    setFormErrors(newErrors);

    return Object.values(newErrors).join('') === '';
  }


  // -----------------------------

  return (
    <section className="section">
      <div className="row row-center">
        <div className="col xs-12 sm-6">

          <form className="mt-2 card bg-gray" onSubmit={(event) => register(event)}>
            <h1 className="t-center">Register to HomeGym</h1>

            {formMainError && 
              <div className="input-row input-row-error">
                <p className="input-message">{formMainError}</p>
              </div>
            }

            <div className={`input-row ${formErrors.username ? 'input-row-error' : ''}`}>
              <input 
                className="input"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.currentTarget.value)}
                placeholder="Username"
              />

              {formErrors.username && <p className="input-message">{formErrors.username}</p>}
            </div>
            <div className={`input-row ${formErrors.password ? 'input-row-error' : ''}`}>
              <FormInputPassword
                name="password"
                value={password}
                setValue={setPassword}
                placeholder="Password"
              />

              {formErrors.password && <p className="input-message">{formErrors.password}</p>}
            </div>
            <div className={`input-row ${formErrors.password ? 'input-row-error' : ''}`}>
              <FormInputPassword
                name="password2"
                value={password2}
                setValue={setPassword2}
                placeholder="Password again"
              />

              {formErrors.password2 && <p className="input-message">{formErrors.password2}</p>}
            </div>

            <div className="t-center">
              <button 
                className="btn btn-primary" 
                type="submit" 
                onClick={(event) => register(event)}
              >Register</button>
            </div>
          </form>
        </div>
      </div>

    </section>
  );
}