// src/hooks/useLoadProducts.js
import { useState, useEffect } from "react";
import store from "../store";
import { productsApi } from "../api/products";
import { setProducts, setProductsError } from "../store/slices/productsSlice";

export function useLoadProducts() {
  const [products, setLocalProducts] = useState(
    store.getState()?.products?.items || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      const { items, error } = state?.products || {};
      setLocalProducts(items || []);
      setError(error);
    });

    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const fetchedProducts = await productsApi.getAll();
        store.dispatch(
          setProducts({
            items: fetchedProducts,
            timestamp: Date.now(),
          })
        );
        setIsLoading(false);
      } catch (err) {
        store.dispatch(setProductsError(err.message));
        setIsLoading(false);
      }
    };

    // Принудительная загрузка при монтировании компонента
    loadProducts();

    return () => unsubscribe();
  }, []);

  // Функция для ручного обновления данных
  const forceUpdate = async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await productsApi.getAll();
      store.dispatch(
        setProducts({
          items: fetchedProducts,
          timestamp: Date.now(),
        })
      );
      setIsLoading(false);
    } catch (err) {
      store.dispatch(setProductsError(err.message));
      setIsLoading(false);
    }
  };

  return {
    products,
    isLoading,
    error,
    forceUpdate, // Добавляем функцию для ручного обновления
  };
}
