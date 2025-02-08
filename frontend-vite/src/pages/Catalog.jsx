// src/pages/Catalog.jsx
import React, { useState, useMemo } from "react";
import { useLoadProducts } from "@/hooks/useLoadProducts";
import ProductGrid from "../subcomponents/ProductGrid";
import ProductFilters from "../subcomponents/ProductFilters";
import { useSearchParams } from "react-router-dom";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, isLoading, error } = useLoadProducts();

  const [activeFilters, setActiveFilters] = useState({
    category: searchParams.get("category") || "all",
    priceFrom: "",
    priceTo: "",
    handle: "all",
    steel: "all",
  });
  // Получаем уникальные значения для фильтров из продуктов
  const filterOptions = useMemo(() => {
    if (!products) return { categories: [], handleTypes: [], steelTypes: [] };

    const categories = [...new Set(products.map((p) => p.category))];
    const handleTypes = [
      ...new Set(products.map((p) => p.handle).filter(Boolean)),
    ];
    const steelTypes = [
      ...new Set(products.map((p) => p.steel).filter(Boolean)),
    ];

    return {
      categories,
      handleTypes,
      steelTypes,
    };
  }, [products]);

  // Фильтрация продуктов
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      if (
        activeFilters.category &&
        activeFilters.category !== "all" &&
        product.category !== activeFilters.category
      ) {
        return false;
      }
      if (
        activeFilters.priceFrom &&
        Number(product.price) < Number(activeFilters.priceFrom)
      ) {
        return false;
      }
      if (
        activeFilters.priceTo &&
        Number(product.price) > Number(activeFilters.priceTo)
      ) {
        return false;
      }
      if (
        activeFilters.handle &&
        activeFilters.handle !== "all" &&
        product.handle !== activeFilters.handle
      ) {
        return false;
      }
      if (
        activeFilters.steel &&
        activeFilters.steel !== "all" &&
        product.steel !== activeFilters.steel
      ) {
        return false;
      }
      return true;
    });
  }, [products, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    if (newFilters.category && newFilters.category !== "all") {
      setSearchParams({ category: newFilters.category });
    } else {
      setSearchParams({});
    }
  };
  return (
    <div className="container mx-auto py-8">
      {/* Заголовок и мобильные фильтры */}
      <div className="desktop:hidden mb-3">
        <ProductFilters
          categories={filterOptions.categories}
          handleTypes={filterOptions.handleTypes}
          steelTypes={filterOptions.steelTypes}
          onFilterChange={handleFilterChange}
          totalProducts={filteredProducts.length}
        />
      </div>

      <div
        className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8
      desktop:grid-cols-2 desktop:grid-cols-[220px_1fr]"
      >
        {/* Десктопные фильтры */}
        <div className="hidden desktop:block  overflow-y-auto bg-card p-0 rounded-lg shadow-sm">
          <ProductFilters
            categories={filterOptions.categories}
            handleTypes={filterOptions.handleTypes}
            steelTypes={filterOptions.steelTypes}
            onFilterChange={handleFilterChange}
            totalProducts={filteredProducts.length}
          />
        </div>

        {/* Сетка товаров для десктопа */}
        <div className="">
          <ProductGrid
            products={filteredProducts}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

export default Catalog;
