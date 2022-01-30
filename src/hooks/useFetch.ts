import { useCallback, useEffect, useState } from 'react';

type TUseFetch<T> = {
  data: T | undefined,
  error: string | undefined,
  loading: boolean,
  runFetch(body?: object, callback?: Function): void
};

export default function useFetch<T>(url: string, method: string = 'GET'): TUseFetch<T> {

  const [abortController, setAbortController] = useState<AbortController>(new AbortController());
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Runs the fetch request, used to run POST, PUT, PATCH and DELETE requests
   * @param body
   * @param callback
   */
  const runFetch = useCallback((body?: object, callback?: Function): void => {
    /**
     * Asks down the data using the API url
     * @returns 
     */
    const fetchData = async (): Promise<T> => {
      let res: Response = new Response();

      if (method === 'GET') {
        res = await fetch(process.env.REACT_APP_API_BASE_URL + url, {
          method: method,
          signal: abortController.signal
        });
      } else {
        if (!body) {
          throw Error(`missing body of the ${method} request`);
        }

        res = await fetch(process.env.REACT_APP_API_BASE_URL + url, {
          method: method,
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      }

      if (!res.ok) {
        throw Error('was not able to fetch data');
      }

      const data = await res.json();

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
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('fetch was aborted');
        } else {
          if (err instanceof Error) {
            setError(err.message);
          }
          setLoading(false);
        }
      } finally {
        if (callback) {
          callback();
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
    if (method === 'GET') {
      runFetch();
      return () => abortController.abort();
    }
  }, [abortController, url, method]);

  return { data, error, loading, runFetch };

}