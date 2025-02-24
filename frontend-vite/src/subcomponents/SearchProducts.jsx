// components/SearchProducts.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLoadProducts } from "@/hooks/useLoadProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";

export const SearchProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const { products } = useLoadProducts();
  const searchRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearching(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(term.toLowerCase())
    );
    setSearchResults(filtered.slice(0, 5));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(true);

    // Clear previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Set new timer for debouncing
    timerRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Clean up timer on component unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleClear = () => {
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const handleProductSelect = (productId) => {
    setIsSearching(false);
    setSearchTerm("");
    navigate(`/products/details/${productId}`);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="flex items-center max-w-md">
        <div className="relative flex-1">
          <Input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsSearching(true)}
            placeholder="Знаете что ищете?"
            className="pl-10 pr-5 border-primary/20"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 p-0"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isSearching && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card rounded-md shadow-lg border z-50">
          <ScrollArea className="max-h-[300px]">
            {searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product.id)}
                className="w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center space-x-3"
              >
                {product.images?.[0]?.image_url && (
                  <img
                    src={`http://localhost:5002${product.images[0].image_url}`}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.price} ₽
                  </p>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
