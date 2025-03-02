import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { CustomPagination } from "./CustomPagination";

export default function ProductGrid({ products, isLoading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const navigate = useNavigate();

  const productItems = products?.items || products || [];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = productItems.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    const statusMap = {
      in_stock: {
        label: "В наличии",
        className: "bg-green-800 hover:bg-green-900",
      },
      out_of_stock: {
        label: "Нет в наличии",
        className: "bg-red-600 hover:bg-red-800",
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-500 hover:bg-gray-600 flex justify-center",
    };
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 qhd:grid-cols-4 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-500">
        Ошибка при загрузке товаров: {error}
      </div>
    );
  }

  return (
    <>
      <div className="mb-2 tablet:mb-4 grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 qhd:grid-cols-4 gap-4">
        {currentProducts.map((product) => (
          <Card key={product.id} className="flex flex-col h-full">
            <div className="h-64 overflow-hidden">
              <CardHeader className="p-4 pb-0">
                <div className="relative w-full h-48 flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        product.images[0].image_url
                      }`}
                      alt={product.name}
                      className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal"
                    />
                  ) : (
                    <Skeleton className="w-full h-full" />
                  )}
                  <div className="absolute top-2 left-2 flex gap-2 flex-col">
                    {product.is_new && (
                      <Badge
                        variant="secondary"
                        className="flex justify-center text-white bg-blue-600 hover:bg-blue-800"
                      >
                        Новинка
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </div>

            <CardContent className="flex-1 flex flex-col p-4 pt-2">
              <CardTitle className="mb-2 text-base font-sans line-clamp-2 ">
                {product.name}
              </CardTitle>

              <div className="flex-1 space-y-2 text-sm text-muted-foreground mb-2">
                <div className="h-10">
                  {product.category && (
                    <div className="flex items-center gap-2 mb-4">
                      <Package className="h-4 w-4" />
                      {product.category}
                    </div>
                  )}
                </div>
                {product.handle && (
                  <div className="flex items-center justify-between">
                    <span>Рукоять:</span>
                    <span className="font-medium text-foreground">
                      {product.handle}
                    </span>
                  </div>
                )}
                {product.length && (
                  <div className="flex items-center justify-between">
                    <span>Длина:</span>
                    <span className="font-medium text-foreground">
                      {product.length} мм
                    </span>
                  </div>
                )}
                {product.steel && (
                  <div className="flex items-center justify-between">
                    <span>Сталь:</span>
                    <span className="font-medium text-foreground">
                      {product.steel}
                    </span>
                  </div>
                )}
                {product.status && (
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-medium ${
                        product.status === "in_stock"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.status === "in_stock"
                        ? "В наличии"
                        : "Нет в наличии"}
                    </span>
                  </div>
                )}
                {product.average_rating && product.average_rating !== "0" && (
                  <div className="flex justify-between gap-1">
                    <div className="flex flex-row items-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{Number(product.average_rating).toFixed(1)}</span>
                    </div>
                    {product.review_count && product.review_count !== "0" && (
                      <span className="text-xs">
                        {product.review_count}{" "}
                        {(() => {
                          const count = Number(product.review_count);
                          const lastDigit = count % 10;
                          const lastTwoDigits = count % 100;

                          if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
                            return "отзывов";
                          }

                          if (lastDigit === 1) {
                            return "отзыв";
                          }

                          if (lastDigit >= 2 && lastDigit <= 4) {
                            return "отзыва";
                          }

                          return "отзывов";
                        })()}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-auto pt-4 border-t font-sans">
                <span className="font-bold text-lg">{product.price} ₽</span>
                <Button
                  onClick={() => navigate(`/products/details/${product.id}`)}
                  className="dark:text-secondary-foreground"
                >
                  Подробнее
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <CustomPagination
        currentPage={currentPage}
        totalItems={productItems.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
