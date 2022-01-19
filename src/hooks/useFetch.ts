import { useEffect, useState } from "react";

type TUseFetch<T> = {
  data: T[],
  error: string | null,
  loading: boolean
};

export default function useFetch<T>(url: string): TUseFetch<T> {
  
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sets the API base url prefix
  url = process.env.REACT_APP_API_BASE_URL + url;

  useEffect(() => {

    const abortController = new AbortController();

    /**
     * Asks down the data using the API url
     * @param abortController Abort controller
     * @returns 
     */
    const fetchData = async (abortController: AbortController): Promise<T[]> => {
      const res = await fetch(url, { signal: abortController.signal });

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
        const data = await fetchData(abortController); 
        setData(data);
        setError(null);
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
      }
    }

    // Server response time
    setTimeout(() => {
      getData();
    }, 1000);

    return () => abortController.abort();

  }, [url]);

  return { data, error, loading };

}