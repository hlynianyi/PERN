// src/components/ProductFilters.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Menu } from "lucide-react";

const FilterContent = ({
  categories = [],
  handleTypes = [],
  steelTypes = [],
  filters,
  onFilterChange,
  handleReset,
  onClose = () => {},
}) => (
  <div className="flex flex-col space-y-6">
    <div className="space-y-4">
      <Label htmlFor="category">Категория</Label>
      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange("category", value)}
      >
        <SelectTrigger id="category">
          <SelectValue placeholder="Выберите категорию" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все категории</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Rest of the filter content remains the same */}
    <div className="space-y-4">
      <Label>Цена</Label>
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            type="number"
            placeholder="От"
            value={filters.priceFrom}
            onChange={(e) => onFilterChange("priceFrom", e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1">
          <Input
            type="number"
            placeholder="До"
            value={filters.priceTo}
            onChange={(e) => onFilterChange("priceTo", e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>

    <Separator />

    <div className="space-y-4">
      <Label htmlFor="handle">Рукоять</Label>
      <Select
        value={filters.handle}
        onValueChange={(value) => onFilterChange("handle", value)}
      >
        <SelectTrigger id="handle">
          <SelectValue placeholder="Выберите материал" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все материалы</SelectItem>
          {handleTypes.map((handle) => (
            <SelectItem key={handle} value={handle}>
              {handle}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    <div className="space-y-4">
      <Label htmlFor="steel">Сталь</Label>
      <Select
        value={filters.steel}
        onValueChange={(value) => onFilterChange("steel", value)}
      >
        <SelectTrigger id="steel">
          <SelectValue placeholder="Выберите сталь" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Все типы стали</SelectItem>
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
      <Button
        onClick={() => {
          onFilterChange("apply", filters);
          onClose();
        }}
        className="flex-1 desktop:hidden"
      >
        Закрыть
      </Button>
      <Button
        onClick={() => {
          handleReset();
          onClose();
        }}
        variant="outline"
        className="flex-1"
      >
        Сбросить
      </Button>
    </div>
  </div>
);

const ProductFilters = ({
  categories = [],
  handleTypes = [],
  steelTypes = [],
  onFilterChange,
  className = "",
  totalProducts = 0,
}) => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "all",
    priceFrom: "",
    priceTo: "",
    handle: "all",
    steel: "all",
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (categoryFromUrl && categoryFromUrl !== filters.category) {
      const newFilters = {
        ...filters,
        category: categoryFromUrl,
      };
      setFilters(newFilters);
      onFilterChange?.(newFilters);
    }
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    if (key !== "apply") {
      onFilterChange?.(newFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = {
      category: "all",
      priceFrom: "",
      priceTo: "",
      handle: "all",
      steel: "all",
    };
    setFilters(resetFilters);
    onFilterChange?.(resetFilters);
  };

  const filterProps = {
    categories,
    handleTypes,
    steelTypes,
    filters,
    onFilterChange: handleFilterChange,
    handleReset,
  };

  return (
    <>
      <div className=" flex justify-between gap-4 items-center">
        <div className="text-base font-mono desktop:py-0 desktop:pb-4 desktop:flex desktop:justify-center">
          Количество товаров: {totalProducts}
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="desktop:hidden flex gap-2 items-center"
            >
              <Menu className="h-4 w-4" />
              Фильтры
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="flex flex-start">Фильтры</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                {...filterProps}
                onClose={() => setIsOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className={`hidden desktop:block ${className}`}>
        <div className="bg-card py-2 rounded-lg shadow-sm">
          <FilterContent {...filterProps} />
        </div>
      </div>
    </>
  );
};

export default ProductFilters;
