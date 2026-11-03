import { useEffect, useState } from 'react';
import { getJson } from './client.js';

type ResourceState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

export function useApiResource<T>(path: string): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    setState({ data: null, error: null, loading: true });
    getJson<T>(path)
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (active) setState({ data: null, error: error instanceof Error ? error.message : 'Unexpected error', loading: false });
      });
    return () => { active = false; };
  }, [path]);

  return state;
}