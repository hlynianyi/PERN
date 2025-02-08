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

    let stats = [
      { label: "Категория", value: product.category },
      { label: "Статус", value: PRODUCT_STATUSES[product.status] },
    ];

    const specifications = [
      { field: "steel", label: "Сталь" },
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

    if (product.hardness) {
      stats.push({ label: "Твердость", value: product.hardness });
    }

    if (product.average_rating) {
      stats.push({
        label: "Средняя оценка",
        value: `${parseFloat(product.average_rating).toFixed(1)} из 5`,
      });
    }

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
    <div className="container p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <h1 className="text-xl font-medium font-serif">{product.name}</h1>
          <div className="flex flex-row justify-between gap-4 items-center">
            <div className="flex gap-2">
              {product.is_new && <Badge variant="destructive">Новинка</Badge>}
              <Badge
                variant={
                  product.status === "in_stock" ? "secondary" : "destructive"
                }
              >
                {PRODUCT_STATUSES[product.status]}
              </Badge>
            </div>
            <p className="text-xl font-medium">
              {parseFloat(product.price).toLocaleString("ru-RU")} ₽
            </p>
          </div>
        </div>
        <div>
          <ImageGallery
            images={product.images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
          />
        </div>

        <div className="space-y-4">
          <Separator />

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
            <h2 className="text-xl font-semibold">Описание</h2>
            {product.description && (
              <p className="whitespace-pre-wrap">{product.description}</p>
            )}
          </div>
          {/* Add new Notes section if notes exist */}
          {product.notes && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Примечание</h2>
              <p className="whitespace-pre-wrap">{product.notes}</p>
            </div>
          )}
          {product.certificates?.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Сертификаты</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.certificates.map((cert, index) => (
                  <Button
                    key={cert.id}
                    variant="outline"
                    onClick={() =>
                      window.open(
                        `http://localhost:5002${cert.certificate_url}`,
                        "_blank"
                      )
                    }
                  >
                    Сертификат {index + 1}
                  </Button>
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
