import AuthError from "../errors/AuthError";

type LoginData = {
  username: string,
  password: string
};

class AuthService {

  /**
   * Logins the user, saved their data in local storage
   * @param loginData
   */
  async login(loginData: LoginData): Promise<void> {
    const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    const data = await res.json();

    if (!res.ok) {
      throw new AuthError(data.message);
    } else if (!data.accessToken) {
      throw new AuthError('missing access token');
    }

    this.saveUserDataAndTokens(data);
  }

  /**
   * Remove the saved user data from local storage, destroys refresh token
   */
  async logout(): Promise<void> {
    try {
      const auth = this.getAuth();
      const refreshToken = auth.refreshToken;

      if (refreshToken) {
        const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ refreshToken })
        });
        const data = await res.json();
  
        if (!res.ok) {
          throw new AuthError(data.message);
        }
      }
    } catch (err) {
      if (!(err instanceof AuthError && err.message === 'no user is logged in')) {
        throw err;
      }
    } finally {
      this.removeUserDataAndToken();
    }
  }

  /**
   * Registers a new user
   * @param newUser
   */
  async register(newUser: IObject): Promise<void> {
    const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        username: newUser.username, 
        password: newUser.password,
        password2: newUser.password2
      })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new AuthError(data.message);
    }
  }

  /**
   * Refreshes the logged user's access token by using the refresh token
   */
  async refreshToken(): Promise<void> {
    const auth = this.getAuth();
    const refreshToken = auth.refreshToken;

    if (refreshToken) {
      const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });

      const data = await res.json();

      if (!res.ok) {
        this.logout();
        throw new AuthError(data.message);
      } else if (!data.accessToken) {
        throw new AuthError('missing access token');
      }

      this.saveUserDataAndTokens(data);
    }
  }

  /**
   * Checks if the saved auth data is valid
   */
  checkAuth(): boolean {
    return localStorage.getItem('auth') !== null;
  }

  /**
   * Returns the saved login data
   * @returns
   */
  getAuth(): IAuth {
    const data = localStorage.getItem('auth');

    if (!data) {
      throw new AuthError('no user is logged in');
    }

    return JSON.parse(data);
  }

  /**
   * Returns the logged user's data
   * @returns
   */
  getUser(): IUser2 {
    const auth = this.getAuth();

    return {
      id: auth.id,
      username: auth.username
    };
  }

  /**
   * Returns the logged user's role
   * @returns
   */
  getRole(): string | null {
    try {
      const auth = this.getAuth();
  
      return auth.role;
    } catch (err) {
      return null;
    }
  }

  /**
   * Saves the logged user's data and access tokens
   * @param data
   */
  saveUserDataAndTokens(data: IObject): void {
    const newAuth: IAuth = {
      id: data.id,
      username: data.username,
      role: data.role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    };

    localStorage.setItem('auth', JSON.stringify(newAuth));
  }

  /**
   * Removes the logged user's saved data and access tokens
   */
  removeUserDataAndToken(): void {
    localStorage.removeItem('auth');
  }
}

export default new AuthService();