import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthError from '../errors/AuthError';

type ProvideAuthProps = {
  children: React.ReactChild
};

type TUseAuthService = {
  user: IUser | undefined,
  getHeaders(headers: HeadersInit): HeadersInit | undefined,
  login(username: string, password: string): Promise<void>,
  logout(): Promise<void>,
  register(data: IObject): Promise<void>,
  refreshToken(): Promise<void>
};



const useAuthService = (): TUseAuthService => {

  const data = localStorage.getItem('currentUser');

  const [user, setUser] = useState<IUser | undefined>(data ? JSON.parse(data) : undefined);

  useEffect(() => {
    return () => {
      const data = localStorage.getItem('currentUser');

      if (data) {
        setUser(JSON.parse(data));
      } else {
        setUser(undefined);
      }
    };
  }, []);

  /**
   * Adds the authorization header to the given headers
   * @param headers 
   * @returns 
   */
  const getHeaders = (headers: HeadersInit): HeadersInit | undefined => {
    const data = localStorage.getItem('currentUser');
    const user = data ? JSON.parse(data) : null;

    return user && user.accessToken ? { ...headers, Authorization: `Bearer ${user.accessToken}` } : headers;
  }

  /**
   * Logins the user, saved their data in local storage
   * @param username 
   * @param password 
   */
  const login = async (username: string, password: string): Promise<void> => {
    const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!res.ok) {
      throw new AuthError(data.message);
    } else if (!data.accessToken) {
      throw new AuthError('missing access token');
    }

    saveUserDataAndTokens(data);
  }

  /**
   * Remove the saved user data from local storage, destroys refresh token
   */
  const logout = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');

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

    removeUserDataAndToken();
  }

  /**
   * Registers a new user
   * @param newUser
   */
  const register = async (newUser: IObject): Promise<void> => {
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
  const refreshToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');

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
        logout();
        throw new AuthError(data.message);
      } else if (!data.accessToken) {
        throw new AuthError('missing access token');
      }

      saveUserDataAndTokens(data);
    }
  }

  /**
   * Saves the logged user's data and access tokens
   * @param data
   */
  const saveUserDataAndTokens = (data: IObject): void =>  {
    const newUser: IUser = {
      username: data.username,
      role: data.role,
      accessToken: data.accessToken 
    };

    localStorage.setItem('currentUser', JSON.stringify(newUser));
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(newUser);
  }

  /**
   * Removes the logged user's saved data and access tokens
   */
  const removeUserDataAndToken = (): void => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refreshToken');
    setUser(undefined);
  }

  return {
    user,
    getHeaders,
    login,
    logout,
    register,
    refreshToken
  };
}


const authContext = createContext<TUseAuthService>({
  user: undefined,
  getHeaders: (headers: HeadersInit): HeadersInit | undefined => { return undefined; },
  login: async (): Promise<void> => {},
  logout: async (): Promise<void> => {},
  register: async (data: IObject): Promise<void> => {},
  refreshToken: async (): Promise<void> => {},
});



export function useAuth(): TUseAuthService {
  return useContext(authContext);
}

export function ProvideAuth({ children }: ProvideAuthProps): JSX.Element {
  const auth = useAuthService();

  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}