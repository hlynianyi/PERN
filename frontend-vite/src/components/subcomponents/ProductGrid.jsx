import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Package } from "lucide-react";

export default function ProductGrid({ products, isLoading, error }) {
  const productItems = products?.items || products || [];
  console.log("🚀 ~ ProductGrid ~ products:", products);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 qhd:grid-cols-5 gap-4">
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
    <div className="grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 desktop:grid-cols-4 qhd:grid-cols-5 gap-4">
      {productItems.map((product) => (
        <Card key={product.id} className="flex flex-col">
          <CardHeader className="flex-none">
            <div className="relative overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={`http://localhost:5002${product.images[0].image_url}`}
                  alt={product.name}
                  className="rounded-md max-w-[100%] max-h-[100%] m-auto"
                />
              ) : (
                <Skeleton className="h-48 w-full" />
              )}
              <div className="absolute top-1 left-1 flex gap-2 flex-col">
                {getStatusBadge(product.status)}
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

          <CardContent className="flex-1 flex flex-col">
            <CardTitle className="mb-2 text-base">{product.name}</CardTitle>

            <div className="flex-1 space-y-2 text-sm text-muted-foreground mb-4">
              {product.category && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {product.category}
                </div>
              )}
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
              {product.average_rating && product.average_rating !== "0" && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{product.average_rating}</span>
                  {product.review_count && product.review_count !== "0" && (
                    <span className="text-xs">
                      ({product.review_count} отзывов)
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-auto pt-4 border-t">
              <span className="font-bold text-lg">{product.price} ₽</span>
              <Button>Подробнее</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
