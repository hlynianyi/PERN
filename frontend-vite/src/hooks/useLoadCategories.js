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
    const unsubscribe = store.subscribe(() => {
      setLocalCategories(store.getState().categories.items);
    });

    const loadCategories = async () => {
      try {
        const products = await productsApi.getAll();

        console.log("Loaded products:", products); // Отладочный вывод продуктов

        const uniqueCategories = [
          ...new Set(products.map((product) => product.category)),
        ];

        console.log("Unique categories:", uniqueCategories); // Отладочный вывод категорий

        // Принудительная загрузка, даже если isLoaded = true
        store.dispatch(setCategories(uniqueCategories));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadCategories();

    return () => unsubscribe();
  }, []);

  return categories;
}
