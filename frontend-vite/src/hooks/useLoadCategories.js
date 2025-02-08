// src/hooks/useLoadCategories.js
import { useState, useEffect } from "react";
import store from "../store";
import { productsApi } from "../api/products";
import { setCategories } from "../store/slices/categoriesSlice";

export function useLoadCategories() {
  const [categories, setLocalCategories] = useState(
    store.getState().categories.items
  );

  useEffect(() => {
    // Подписываемся на изменения в store
    const unsubscribe = store.subscribe(() => {
      setLocalCategories(store.getState().categories.items);
    });

    const loadCategories = async () => {
      try {
        const products = await productsApi.getAll();
        const uniqueCategories = [
          ...new Set(products.map((product) => product.category)),
        ];

        // Принудительное обновление категорий
        store.dispatch(setCategories(uniqueCategories));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    // Загрузка при монтировании
    loadCategories();

    // Периодическое обновление каждые 5 минут
    const intervalId = setInterval(loadCategories, 5 * 60 * 1000);

    // Очистка при размонтировании
    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  return categories;
}
