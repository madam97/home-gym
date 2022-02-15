import { AuthProvider, UserIdentity } from 'react-admin';
import AuthError from '../errors/AuthError';
import authService from '../services/auth';

const adminAuthProvider: AuthProvider = {

  /**
   * Logins the user
   * @returns 
   */
  login: async ({ username, password }): Promise<any> => {
    try {
      await authService.login({ username, password });

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Logouts the user
   * @returns 
   */
  logout: async (): Promise<void | false | string> => {
    await authService.logout();

    return Promise.resolve();
  },

  /**
   * Checks if the auth data is valid
   */
  checkAuth: async (): Promise<void> => {
    return authService.checkAuth() ? Promise.resolve() : Promise.reject();
  },

  /**
   * Checks the given error's status and logouts user if it was an auth error
   * @param error 
   * @returns 
   */
  checkError: async (err): Promise<void> => {
    // Logout when auth error occurs
    if (err.status === 401 || err.status === 403) {
      await authService.logout();
      return Promise.reject();
    }

    // Will not logout when other errors occur
    return Promise.resolve();
  },

  /**
   * Returns the logged user's data
   * @returns 
   */
  getIdentity: async (): Promise<UserIdentity> => {
    try {
      const user = authService.getUser();

      return Promise.resolve({ 
        id: user.id, 
        fullName: user.username
      });
    } catch (err) {
      return Promise.reject(err);
    }
  },

  /**
   * Returns the logged user's permissions
   * @returns
   */
  getPermissions: async (): Promise<any> => {
    const role = authService.getRole();

    return role ? Promise.resolve(role) : Promise.reject();
  }
}

export default adminAuthProvider;