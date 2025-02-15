// components/products/ProductDetails/index.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { productsApi, PRODUCT_STATUSES } from "../../../api/products";
import { ImageGallery } from "./ImageGallery";
import { Reviews } from "./Reviews";
import { ReviewForm } from "./ReviewForm";

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

  const { toast } = useToast();

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
      toast({
        title: "Ошибка при загрузке продукта",
        description: error.message,
        variant: "destructive",
      });
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
      toast({
        title: editingReview ? "Отзыв обновлен" : "Отзыв добавлен",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await productsApi.deleteReview(reviewId);
      loadProduct();
      toast({
        title: "Отзыв удален",
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении отзыва",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!product) {
    return <div className="p-5">Загрузка...</div>;
  }

  return (
    <div className="py-4 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 laptop:flex laptop:flex-col gap-4 laptop:gap-1">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <h1 className="text-2xl font-medium laptop:text-4xl laptop:mb-4">
            {product.name}
          </h1>
          <div className="flex items-center ">
            {product.is_new && (
              <Badge
                className="text-base laptop:text-lg px-4"
                variant="destructive"
              >
                Новинка
              </Badge>
            )}
          </div>
        </div>
        <div className="w-full tablet:flex tablet:flex-row tablet:gap-4 tablet:border-[1px] rounded-md tablet:px-4">
          <ImageGallery
            images={product.images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
          <div className="hidden tablet:flex tablet:flex-col w-full my-0 tablet:border-l-[1px] tablet:p-4 laptop:p-8 tablet:pr-0 laptop:pr-4">
            <div className="flex flex-row justify-between  gap-2 grow">
              <div>
                <p className="text-3xl font-semibold">
                  {parseFloat(product.price).toLocaleString("ru-RU")} ₽
                </p>
                <div>
                  <span
                    className={`font-medium text-xl ${
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
              </div>
              <div className="">
                <button
                  className={`w-full py-3 px-6 rounded-lg  font-medium text-lg laptop:text-xl
          ${
            product.status === "in_stock"
              ? "bg-secondary hover:bg-primary hover:text-secondary dark:hover:text-secondary-foreground"
              : "bg-gray-400 cursor-not-allowed"
          }`}
                  disabled={product.status !== "in_stock"}
                >
                  В корзину
                </button>
              </div>
            </div>

            {product.notes && (
              <div className="space-y-2 mt-6">
                <p className="text-sm whitespace-pre-wrap  text-muted-foreground text-balance">
                  {product.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="tablet:hidden flex flex-row justify-between gap-4 items-center">
          <div className="flex justify-between gap-4 w-full">
            <div className="flex flex-col  gap-1">
              <p className="text-3xl font-semibold">
                {parseFloat(product.price).toLocaleString("ru-RU")} ₽
              </p>
              <span
                className={`font-medium ${
                  product.status === "in_stock"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {product.status === "in_stock" ? "В наличии" : "Нет в наличии"}
              </span>
            </div>
            <div>
              <button
                className={`w-full py-3 px-6 rounded-lg  font-medium text-lg laptop:text-xl
          ${
            product.status === "in_stock"
              ? "bg-secondary hover:bg-primary hover:text-secondary dark:hover:text-secondary-foreground"
              : "bg-gray-400 cursor-not-allowed"
          }`}
                disabled={product.status !== "in_stock"}
              >
                В корзину
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
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
          <Separator />
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-exo">Описание</h2>
            {product.description && (
              <p className="text-sm whitespace-pre-wrap ml-4">
                {product.description}
              </p>
            )}
          </div>
          {product.notes && (
            <div className="space-y-2 tablet:hidden">
              <h2 className="text-xl font-medium text-exo">Примечание</h2>
              <p className="text-sm whitespace-pre-wrap ml-4 text-muted-foreground">
                {product.notes}
              </p>
            </div>
          )}
          <Separator />

          {product.certificates?.length > 0 && (
            <div className="space-y-4">
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
                        Просмотреть сертификат {index + 1}
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

      <div className="mt-8">
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
