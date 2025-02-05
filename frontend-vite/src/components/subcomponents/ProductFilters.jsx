// src/components/ProductFilters.jsx
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

const ProductFilters = ({
  categories = [],
  handleTypes = [],
  steelTypes = [],
  onFilterChange,
  className = "",
}) => {
  const [filters, setFilters] = useState({
    category: "",
    priceFrom: "",
    priceTo: "",
    handle: "",
    steel: "",
  });

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      category: "",
      priceFrom: "",
      priceTo: "",
      handle: "",
      steel: "",
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  return (
    <div className={`flex flex-col space-y-6 ${className}`}>
      <div>
        <Label htmlFor="category">Категория</Label>
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все категории</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Цена</Label>
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              type="number"
              placeholder="От"
              value={filters.priceFrom}
              onChange={(e) => handleFilterChange("priceFrom", e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              placeholder="До"
              value={filters.priceTo}
              onChange={(e) => handleFilterChange("priceTo", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <Label htmlFor="handle">Рукоять</Label>
        <Select
          value={filters.handle}
          onValueChange={(value) => handleFilterChange("handle", value)}
        >
          <SelectTrigger id="handle">
            <SelectValue placeholder="Выберите материал" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все материалы</SelectItem>
            {handleTypes.map((handle) => (
              <SelectItem key={handle} value={handle}>
                {handle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="steel">Сталь</Label>
        <Select
          value={filters.steel}
          onValueChange={(value) => handleFilterChange("steel", value)}
        >
          <SelectTrigger id="steel">
            <SelectValue placeholder="Выберите сталь" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все типы стали</SelectItem>
            {steelTypes.map((steel) => (
              <SelectItem key={steel} value={steel}>
                {steel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="flex gap-4">
        <Button onClick={() => onFilterChange?.(filters)} className="flex-1">
          Показать
        </Button>
        <Button onClick={handleReset} variant="outline" className="flex-1">
          Сбросить
        </Button>
      </div>
    </div>
  );
};

export default ProductFilters;
