import { useState, useEffect, useMemo, useRef } from "react";

interface UseFetchConfig {
  cache?: boolean;
  retries?: number;
  timeout?: number; // in milliseconds
}

// A simple global cache (keyed by URL)
const cacheMap = new Map<string, any>();

/**
 * Custom React hook to fetch data from an API with caching, retries,
 * advanced error handling, and timeout support.
 *
 * @template T - The expected data type.
 * @param {string} url - The API endpoint to fetch data from.
 * @param {RequestInit} [options={}] - Optional fetch configuration.
 * @param {UseFetchConfig} [config={}] - Additional configurations.
 * @returns {{ data: T | null; error: string | null; loading: boolean }}
 */
function useFetch<T>(
  url: string,
  options: RequestInit = {},
  config: UseFetchConfig = {}
): { data: T | null; error: string | null; loading: boolean } {
  // Destructure configuration with defaults.
  const { cache = true, retries = 3, timeout = 5000 } = config;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Ref to hold the current AbortController
  const controllerRef = useRef<AbortController | null>(null);

  // Memoize options to prevent unnecessary re-fetching due to object identity.
  const memoizedOptions = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    let isMounted = true;

    // If caching is enabled and we already have data for this URL, use it.
    if (cache && cacheMap.has(url)) {
      setData(cacheMap.get(url));
      setLoading(false);
      return;
    }

    /**
     * Recursive function to perform the fetch with retries.
     * @param attempt - The current attempt count.
     */
    const fetchData = async (attempt: number): Promise<void> => {
      // Create a new AbortController for this attempt.
      const controller = new AbortController();
      controllerRef.current = controller;
      const { signal } = controller;

      // Set up a timeout to abort the fetch.
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, { ...memoizedOptions, signal });
        clearTimeout(timeoutId);

        // Check for HTTP errors.
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server Error: ${response.status} - ${errorText}`);
        }

        const result: T = await response.json();

        if (isMounted) {
          setData(result);
          setLoading(false);
          // Store in cache if enabled.
          if (cache) {
            cacheMap.set(url, result);
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);

        // Determine if we should retry.
        if (attempt < retries) {
          // Wait 1 second before retrying.
          setTimeout(() => {
            if (isMounted) fetchData(attempt + 1);
          }, 1000);
        } else {
          if (isMounted) {
            // Advanced error handling: differentiate error types.
            if (err.name === "AbortError") {
              setError("Request timed out or was aborted");
            } else if (err instanceof TypeError) {
              // Network errors tend to be TypeErrors.
              setError("Network error: " + err.message);
            } else {
              setError(err.message);
            }
            setLoading(false);
          }
        }
      }
    };

    // Initiate the fetch process.
    fetchData(0);

    // Cleanup: abort any ongoing request when the component unmounts.
    return () => {
      isMounted = false;
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [url, memoizedOptions, cache, retries, timeout]);

  return { data, error, loading };
}

export default useFetch;

/*
Creating a custom useFetch hook instead of relying on generic fetch calls allows for a modular, maintainable, 
and consistent approach to handling API requests. It encapsulates complex logic (caching, retries, error handling, 
timeouts) in one place, improving code quality and developer efficiency. This is especially valuable in larger 
applications where multiple components may need to fetch data from various endpoints.
*/
