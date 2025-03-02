import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLoadHomepage } from "@/hooks/useLoadHomepage";
import { useLoadProducts } from "@/hooks/useLoadProducts";
import SmallReviews from "../components/reviews/SmallReviews";

export default function Homepage() {
  const { homepage, isLoading } = useLoadHomepage();
  const { products } = useLoadProducts();
  const navigate = useNavigate();

  const homepageData = homepage?.data;

  const popularProducts = React.useMemo(() => {
    if (!homepageData?.popular_products || !products) return [];

    return products.filter((product) =>
      homepageData.popular_products.some((pp) => pp.id === product.id)
    );
  }, [homepageData?.popular_products, products]);

  if (isLoading || !homepageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className=" py-4 tablet:py-8  mx-auto flex flex-col gap-4 tablet:gap-6 laptop:gap">
      {/* Title and Description Section */}
      <section className="">
        <div className="text-center mb-6 tablet:mb-8">
          <h2 className="text-3xl font-semibold tracking-tight mb-1">
            {homepageData.title}
          </h2>
          <div className="mt-4 h-1 w-20 bg-primary mx-auto mb-2"></div>
        </div>
        <section className="flex flex-col gap-4 laptop:flex-row laptop:justify-between laptop:gap-6">
          <aside className="w-full">
            <p className="text-justify text-lg text-muted-foreground mb-4 tablet:mb-6">
              {homepageData.description}
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate("/company")}
                size="lg"
                variant="secondary"

                className=" min-w-[200px] dark:text-secondary-foreground"
              >
                Подробнее о компании
              </Button>
            </div>
          </aside>
          {Array.isArray(homepageData.carousel_images) &&
            homepageData.carousel_images.length > 0 && (
              <section className="w-full mx-auto">
                <Carousel className="w-full">
                  <CarouselContent>
                    {homepageData.carousel_images.map((image) => (
                      <CarouselItem key={image.id} className="w-full">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${
                              image.image_url
                            }`}
                            alt={image.name || "Carousel image"}
                            className=" w-full h-full object-cover"
                          />
                          {(image.name || image.product_link) && (
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                              <div className="max-w-[1200px] mx-auto">
                                {image.name && (
                                  <h3 className="text-white text-2xl md:text-3xl font-semibold mb-4">
                                    {image.name}
                                  </h3>
                                )}
                                {image.product_link && (
                                  <Button
                                    onClick={() => navigate(image.product_link)}
                                    size="lg"
                                    variant="secondary"
                                    className=" hover:scale-105 transition-transform"
                                  >
                                    Подробнее
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {homepageData.carousel_images.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              </section>
            )}
        </section>
      </section>

      {/* Popular Products Section */}
      {popularProducts.length > 0 && (
        <section className="">
          <div className="text-center mb-6 tablet:mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-1">
              Популярные модели
            </h2>

            <div className="mt-4 h-1 w-20 bg-primary mx-auto mb-2"></div>
          </div>
          <div className=" grid grid-cols-1 tablet:grid-cols-2 laptop:grid-cols-3 gap-0">
            {popularProducts.map((product) => (
              <Card
                key={product.id}
                className=" border-primary/20 rounded-none overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/products/details/${product.id}`)}
              >
                <div className="w-full flex justify-center">
                  <div className="mobile:w-2/3 mobile:h-2/3 flex justify-center aspect-square relative p-4">
                    {product.images?.[0]?.image_url && (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          product.images[0].image_url
                        }`}
                        alt={product.name}
                        className=" mix-blend-multiply dark:mix-blend-normal w-full h-full object-contain rounded-lg"
                      />
                    )}
                    {product.status === "out_of_stock" && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                        Нет в наличии
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg tablet:text-xl font-semibold mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-base tablet:text-lg font-medium">
                      {parseFloat(product.price).toLocaleString("ru-RU")} ₽
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/products/details/${product.id}`);
                      }}
                    >
                      Подробнее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <SmallReviews />
    </div>
  );
}
