// src/hooks/useContacts.js
import { useState, useEffect } from "react";
import store from "../store";

export const useContacts = () => {
  const [contacts, setContacts] = useState(store.getState().contacts);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setContacts(store.getState().contacts);
    });

    return () => unsubscribe();
  }, []);

  return contacts;
};
