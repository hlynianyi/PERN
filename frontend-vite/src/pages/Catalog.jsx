// src/pages/Catalog.jsx
import React from "react";
import { useLoadProducts } from "@/hooks/useLoadProducts";

import ProductGrid from "../components/subcomponents/ProductGrid";
import ProductFilters from "../components/subcomponents/ProductFilters";

const Homepage = () => {
  const { products, isLoading, error } = useLoadProducts();

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] gap-8">
        {/* Блок фильтров (пока пустой) */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-4">Фильтры</h2>
          {/* Здесь будут фильтры */}
        </div>

        {/* Сетка товаров */}
        <ProductGrid products={products} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default Homepage;
