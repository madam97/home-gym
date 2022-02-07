import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';

type RunFetchParams = {
  body?: object, 
  callback?: Function
};

type UseFetchProps = {
  url?: string,
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
};

type TUseFetch<T> = {
  data: T | undefined,
  error: string | undefined,
  loading: boolean,
  runFetch({ body, callback}: RunFetchParams): void
};

export default function useFetch<T>({method = 'GET', url = ''}: UseFetchProps): TUseFetch<T> {

  const auth = useAuth();

  const [abortController, setAbortController] = useState<AbortController>(new AbortController());
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Runs the fetch request, used to run GET, POST, PUT, PATCH and DELETE requests
   * @param body
   * @param callback
   */
  const runFetch = useCallback(({ body, callback}: RunFetchParams): void => {
    /**
     * Asks down the data using the API url
     * @returns 
     */
    const fetchData = async (): Promise<T> => {
      let res: Response = new Response();

      let init: RequestInit = {
        method: method,
        signal: abortController.signal,
        headers: auth.getHeaders({
          'Content-Type': 'application/json'
        })
      };
      if (method !== 'GET' && method !== 'DELETE') {
        if (!body) {
          throw Error(`missing body of the ${method} ${url} request`);
        }

        init.body = JSON.stringify(body);
      }

      res = await fetch(process.env.REACT_APP_API_BASE_URL + url, init);

      console.log(`TEST: useFetch ${method} ${process.env.REACT_APP_API_BASE_URL + url}`, init);

      const data = await res.json();

      if (!res.ok) {
        throw Error(`was not able to fetch data - ${data.message}`);
      }

      return data;
    }

    /**
     * Saves the fetched data and handles error
     */
    const getData = async (): Promise<void> => {
      try {
        const data = await fetchData(); 
        setData(data);
        setError(undefined);
        setLoading(false);

        if (callback) {
          callback();
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('fetch was aborted');
        } else {
          if (err instanceof Error) {
            console.log('API error: ', err.message);
            setError(err.message);
          } else {
            console.log('API error: unknown');
          }
          setLoading(false);
        }
      }
    }

    // Server response time
    setTimeout(() => {
      getData();
    }, 1000);

  }, [url, method, setData, setError, setLoading]);

  // Auto run GET fetches
  useEffect(() => {
    if (method === 'GET' && url) {
      runFetch({});
    }

    return () => abortController.abort();
  }, [abortController, url, method]);

  return { data, error, loading, runFetch };

}