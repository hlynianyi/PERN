// src/hooks/useLoadHomepage.js
import { useState, useEffect } from "react";
import store from "../store";
import { homepageApi } from "@/api/homepage";
import { setHomepage, setHomepageError } from "../store/slices/homepageSlice";

export function useLoadHomepage() {
  const [homepage, setLocalHomepage] = useState(
    store.getState()?.homepage?.data || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const { data, error } = state?.homepage || {};
      setLocalHomepage(data || null);
      setError(error);
    });

    const loadHomepage = async () => {
      setIsLoading(true);
      try {
        const fetchedHomepage = await homepageApi.getHomepage();
        store.dispatch(
          setHomepage({
            data: fetchedHomepage,
            timestamp: Date.now(),
          })
        );
        setIsLoading(false);
      } catch (err) {
        store.dispatch(setHomepageError(err.message));
        setIsLoading(false);
      }
    };

    loadHomepage();

    return () => unsubscribe();
  }, []);

  const forceUpdate = async () => {
    setIsLoading(true);
    try {
      const fetchedHomepage = await homepageApi.getHomepage();
      store.dispatch(
        setHomepage({
          data: fetchedHomepage,
          timestamp: Date.now(),
        })
      );
      setIsLoading(false);
    } catch (err) {
      store.dispatch(setHomepageError(err.message));
      setIsLoading(false);
    }
  };

  return {
    homepage,
    isLoading,
    error,
    forceUpdate,
  };
}
