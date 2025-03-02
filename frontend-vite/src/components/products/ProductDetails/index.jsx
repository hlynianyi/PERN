// components/products/ProductDetails/index.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { productsApi } from "../../../api/products";
import { ImageGallery } from "./ImageGallery";
import { Reviews } from "./Reviews";
import { ReviewForm } from "./ReviewForm";
import { Star } from "lucide-react";
import { addToCart } from "../../../store/slices/cartSlice";
import store from "../../../store/index";
import { toast } from "sonner";

export const AdminProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    user_name: "",
    rating: 5,
    comment: "",
  });
  const [editingReview, setEditingReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productsApi.getOne(id);
      setProduct(data);
      const primaryImage =
        data.images?.find((img) => img.is_primary) || data.images?.[0];
      setSelectedImage(primaryImage);
    } catch (error) {
      toast.error("Ошибка при загрузке продукта", {
        description: error.message,
        richColors: true,
      });
    }
  };

  const getReviewsText = (count) => {
    // Handle undefined or null
    if (!count) return "отзывов";

    // Convert to number if it's a string
    count = Number(count);

    // Get the last digit
    const lastDigit = count % 10;
    // Get the last two digits
    const lastTwoDigits = count % 100;

    // Rules for Russian plural forms
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "отзывов";
    } else if (lastDigit === 1) {
      return "отзыв";
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return "отзыва";
    } else {
      return "отзывов";
    }
  };

  const getMainStats = () => {
    if (!product) return [];

    let stats = [{ label: "Категория", value: product.category }];

    const specifications = [
      { field: "steel", label: "Сталь" },
      { field: "hardness", label: "Твердость" },
      { field: "handle", label: "Рукоять" },
      { field: "sheath", label: "Ножны" },
    ];

    specifications.forEach(({ field, label }) => {
      if (product[field]) {
        stats.push({ label, value: product[field] });
      }
    });

    const measurements = [
      { field: "length", label: "Общая длина", unit: "мм" },
      { field: "blade_length", label: "Длина клинка", unit: "мм" },
      { field: "blade_thickness", label: "Толщина клинка", unit: "мм" },
    ];

    measurements.forEach(({ field, label, unit }) => {
      if (product[field]) {
        stats.push({ label, value: `${product[field]} ${unit}` });
      }
    });

    return stats;
  };

  const handleAddToCart = () => {
    if (product.status === "in_stock") {
      store.dispatch(addToCart(product));
      toast.success("Товар добавлен в корзину", {
        description: `${product.name} был добавлен в корзину`,
        richColors: true,
      });
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      user_name: review.user_name,
      rating: review.rating,
      comment: review.comment,
    });
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await productsApi.updateReview(editingReview.id, reviewForm);
      } else {
        await productsApi.addReview(id, reviewForm);
      }
      setReviewForm({ user_name: "", rating: 5, comment: "" });
      setEditingReview(null);
      setIsReviewModalOpen(false);
      loadProduct();
      toast.success(editingReview ? "Отзыв обновлен" : "Отзыв добавлен", {
        richColors: true,
      });
    } catch (error) {
      toast.error("Ошибка", {
        description: error.message,
        richColors: true,
      });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await productsApi.deleteReview(reviewId);
      loadProduct();
      toast.success("Отзыв удален", {
        richColors: true,
      });
    } catch (error) {
      toast.error("Ошибка при удалении отзыва", {
        description: error.message,
        richColors: true,
      });
    }
  };

  if (!product) {
    return <div className="p-5">Загрузка...</div>;
  }

  return (
    <div className="py-4 pb-8  mx-auto">
      <div className="grid grid-cols-1 laptop:flex laptop:flex-col gap-4 laptop:gap-2">
        <div className=" w-full tablet:flex tablet:flex-row tablet:gap-4 tablet:border-[1px] rounded-md tablet:px-4">
          <ImageGallery
            images={product.images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            product={product}
          />
          <div className="hidden tablet:flex tablet:flex-col w- my-0 tablet:border-l-[1px]  tablet:p-4 tablet:pb-2  tablet:pr-0 laptop:pr-4">
            <div className="flex flex-row justify-between items-start  gap-2 align-bottom">
              <h1 className="text-2xl font-medium laptop:text-4xl laptop:mb-1">
                {product.name}
              </h1>
              <span className="no-wrap hidden laptop:flex text-nowrap rounded-lg pl-4 tablet:w- laptop:w- text-[18px] laptop:text-3xl font-medium text-start text-primary laptop:text-end laptop:mt-0 tablet:leading-[44px] h-10">
                {parseFloat(product.price).toLocaleString("ru-RU")} ₽
              </span>
            </div>
            <div>
              <span
                className={`font-medium text-base ${
                  product.status === "in_stock"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {product.status === "in_stock"
                  ? "Есть в наличии"
                  : "Нет в наличии"}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {product.average_rating > 0 ? (
                <>
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">
                      {parseFloat(product.average_rating).toFixed(1)}
                    </span>
                    {[...Array(5)].map((_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${
                          index < Math.round(product.average_rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground border-l border-gray-300 pl-2">
                    <span className="cursor-pointer hover:text-primary transition-colors">
                      {product.review_count || 0}{" "}
                      {getReviewsText(product.review_count)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Нет отзывов</div>
              )}
            </div>
            {product.notes && (
              <div className="space-y-2 mt-4 mr-4 laptop:mr-24 grow flex flex-col justify-end mb-4">
                <p className="text-sm whitespace-pre-wrap  text-muted-foreground text-balance">
                  {product.notes}
                </p>
              </div>
            )}
            <div className="flex flex-col laptop:flex-col  justify-start gap-4 laptop:gap-4 mb-2  laptop:w-2/3">
              <div className=" rounded-md gap-2 py-2 flex flex-row justify-start w-full">
                <p className="bg-secondary rounded-lg px-4 tablet:w-full laptop:w-full text-[18px] laptop:text-[22px] font-medium text-start text-primary laptop:text-start laptop:hidden laptop:mt-0 tablet:leading-[44px]">
                  {parseFloat(product.price).toLocaleString("ru-RU")} ₽
                </p>
                <button
                  className={`rounded-lg tablet:w-full py-2 px-4 font-medium text-lg laptop:text-xl laptop:h-[44px] laptop:w-1/2 laptop:text-[22px] text-primary min-w-[175px]
                  ${
                    product.status === "in_stock"
                      ? "bg-secondary hover:bg-primary hover:text-secondary dark:hover:text-secondary-foreground"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={product.status !== "in_stock"}
                  onClick={handleAddToCart}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="tablet:hidden flex flex-row justify-between grow gap-4 items-center">
          <div className="flex flex-col justify-between gap-4 w-full">
            <div className="flex flex-col  gap-1">
              <div className="flex justify-between mb-2">
                <div>
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
                  <div className="flex items-center gap-2 mb-4">
                    {product.average_rating > 0 ? (
                      <>
                        <div className="flex items-center">
                          <span className="mr-2 text-gray-600">
                            {parseFloat(product.average_rating).toFixed(1)}
                          </span>
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={`w-5 h-5 ${
                                index < Math.round(product.average_rating)
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Нет отзывов
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-xl font-semibold text-primary">
                  {parseFloat(product.price).toLocaleString("ru-RU")} ₽
                </p>
              </div>

              <div>
                <button
                  className={`w-full py-2 px-4 rounded-lg font-medium text-lg laptop:text-xl
                  ${
                    product.status === "in_stock"
                      ? "bg-secondary hover:bg-primary hover:text-secondary dark:hover:text-secondary-foreground"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={product.status !== "in_stock"}
                  onClick={handleAddToCart}
                >
                  В корзину
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-medium text-exo">Характеристики</h2>

          <Table>
            <TableBody>
              {getMainStats().map((stat, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium w-[40%]">
                    {stat.label}
                  </TableCell>
                  <TableCell>{stat.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-exo">Описание</h2>
            {product.description && (
              <p className="text-sm whitespace-pre-wrap ml-4">
                {product.description}
              </p>
            )}
          </div>
          {product.notes && (
            <div className="space-y-2 tablet:hidden ">
              <h2 className="text-xl font-medium text-exo text-muted-foreground">
                Примечание
              </h2>
              <p className="text-sm whitespace-pre-wrap ml-4 text-muted-foreground">
                {product.notes}
              </p>
            </div>
          )}

          {product.certificates?.length > 0 && (
            <div className="space-y-2 mb-4">
              <h2 className="text-xl font-medium text-exo">Сертификаты</h2>
              <div className="flex flex-row flex-wrap gap-4">
                {product.certificates.map((cert, index) => (
                  <div
                    key={cert.id}
                    onClick={() =>
                      window.open(
                        `http://localhost:5002${cert.certificate_url}`,
                        "_blank"
                      )
                    }
                    className="max-w-[175px] group relative aspect-[3/4] rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                  >
                    <img
                      src={`http://localhost:5002${cert.certificate_url}`}
                      alt={`Сертификат ${index + 1}`}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 "
                    />

                    {/* Overlay with text */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-medium text-sm">
                        Посмотреть
                      </p>
                    </div>

                    {/* Certificate number badge */}
                    <div className="absolute top-2 right-2 bg-primary/90 text-white text-sm font-medium px-2 py-1 rounded">
                      №{index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Reviews
          reviews={product.reviews}
          averageRating={product.average_rating}
          onNewReview={() => {
            setEditingReview(null);
            setIsReviewModalOpen(true);
          }}
          onEditReview={handleEditReview}
          onDeleteReview={handleReviewDelete}
        />
      </div>

      <ReviewForm
        isOpen={isReviewModalOpen}
        onClose={() => {
          setReviewForm({ user_name: "", rating: 5, comment: "" });
          setEditingReview(null);
          setIsReviewModalOpen(false);
        }}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleSubmit={handleReviewSubmit}
        isEditing={!!editingReview}
      />
    </div>
  );
};

export default AdminProductDetails;