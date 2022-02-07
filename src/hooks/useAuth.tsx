import React, { createContext, useContext, useEffect, useState } from 'react';
import useFetch from './useFetch';

type ProvideAuthProps = {
  children: React.ReactChild
};

type TUseAuthService = {
  user: IUser | undefined,
  getHeaders(headers: HeadersInit): HeadersInit | undefined,
  login(username: string, password: string): Promise<void>,
  logout(): void
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
    return user && user.accessToken ? { ...headers, Authorization: `Bearer ${user.accessToken}` } : headers;
  }

  /**
   * Logins the user, saved their data in local storage
   * @param username 
   * @param password 
   */
  const login = async (username: string, password: string): Promise<void> => {
    try {
      const res = await fetch(process.env.REACT_APP_API_BASE_URL + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      if (data.accessToken) {
        localStorage.setItem('currentUser', JSON.stringify(data));
      }
      setUser(data);
    } catch (err) {
      console.log('login error', err);
    }
  }

  /**
   * Remove the saved user data from local storage
   */
  const logout = (): void => {
    localStorage.removeItem('currentUser');
    setUser(undefined);
  }

  return {
    user,
    getHeaders,
    login,
    logout
  };
}


const authContext = createContext<TUseAuthService>({
  user: undefined,
  getHeaders: (headers: HeadersInit): HeadersInit | undefined => { return undefined; },
  login: async (): Promise<void> => {},
  logout: () => {}
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