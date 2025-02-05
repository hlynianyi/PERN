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
    const loadCategories = async () => {
      try {
        const products = await productsApi.getAll();

        const uniqueCategories = [
          ...new Set(products.map((product) => product.category)),
        ];

        // Принудительное обновление, даже если текущие категории совпадают
        if (
          JSON.stringify(uniqueCategories) !==
          JSON.stringify(store.getState().categories.items)
        ) {
          store.dispatch(setCategories(uniqueCategories));
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    // Загрузка при монтировании и каждые 5 минут
    loadCategories();
    const intervalId = setInterval(loadCategories, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return categories;
}
