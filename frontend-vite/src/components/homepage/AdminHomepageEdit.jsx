import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { homepageApi } from "@/api/homepage";
import { useLoadProducts } from "@/hooks/useLoadProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2 } from "lucide-react";

export default function AdminHomepageEdit() {
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    popularProducts: [],
    images: [],
  });

  const [currentImages, setCurrentImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { products } = useLoadProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadHomepage();
  }, []);

  const loadHomepage = async () => {
    try {
      const homepage = await homepageApi.getHomepage();
      console.log("🚀 ~ loadHomepage ~ homepage:", homepage);

      if (homepage) {
        setFormData({
          id: homepage.id,
          title: homepage.title,
          description: homepage.description,
          popularProducts:
            homepage.popular_products?.map((p) => String(p.id)) || [],
          images: [],
        });
        setCurrentImages(homepage.carousel_images || []);
      }
    } catch (error) {
      toast({
        title: "Ошибка при загрузке данных",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages =
      files.length + currentImages.length - deletedImageIds.length;

    if (totalImages > 5) {
      toast({
        title: "Ошибка",
        description: "Максимальное количество изображений - 5",
        variant: "destructive",
      });
      return;
    }

    const newImageMetadata = files.map((file) => ({
      name: file.name,
      product_link: "",
      order_index: currentImages.length + selectedFiles.length,
    }));

    setSelectedFiles((prev) => [...prev, ...files]);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImageMetadata],
    }));

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentImage = (imageId) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  // Section for displaying existing carousel images
  const renderExistingImages = () => {
    if (!currentImages.length) return null;

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Текущие изображения карусели:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentImages
            .filter((img) => !deletedImageIds.includes(img.id))
            .map((image) => (
              <Card key={image.id} className="relative overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <img
                      src={`http://localhost:5002${image.image_url}`}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveCurrentImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="font-medium truncate">
                      {image.name || "Без названия"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {image.product_link || "Ссылка не указана"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  };
  console.log("🚀 ~ renderExistingImages ~ currentImages:", currentImages);
  console.log("🚀 ~ renderExistingImages ~ currentImages:", currentImages);

  // Section for displaying new image previews
  const renderNewImagePreviews = () => {
    if (!previewUrls.length) return null;

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Новые изображения:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-video">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <p className="font-medium truncate">
                    {selectedFiles[index]?.name || "Новое изображение"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.title?.trim()) {
        throw new Error("Заголовок обязателен для заполнения");
      }

      const dataToSend = {
        ...formData,
        selectedFiles,
        deletedImageIds,
        popularProducts: formData.popularProducts.map((id) => Number(id)),
      };

      await homepageApi.saveHomepage(dataToSend);

      toast({
        title: "Успешно сохранено",
        description: "Данные главной страницы обновлены",
      });

      navigate("/admin/homepage/edit");
    } catch (error) {
      toast({
        title: "Ошибка при сохранении",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Заголовок</Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <Label>Описание</Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label>Популярные товары (выберите до 5)</Label>
            <div className="flex flex-wrap gap-2">
              {products?.map((product) => (
                <Button
                  key={product.id}
                  type="button"
                  variant={
                    formData.popularProducts.includes(String(product.id))
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => {
                    const productId = String(product.id);
                    setFormData((prev) => {
                      const currentProducts = prev.popularProducts || [];
                      if (currentProducts.includes(productId)) {
                        return {
                          ...prev,
                          popularProducts: currentProducts.filter(
                            (id) => id !== productId
                          ),
                        };
                      } else if (currentProducts.length < 5) {
                        return {
                          ...prev,
                          popularProducts: [...currentProducts, productId],
                        };
                      }
                      return prev;
                    });
                  }}
                  className="transition-colors"
                >
                  {product.name}
                </Button>
              ))}
            </div>
            {formData.popularProducts.length >= 5 && (
              <p className="text-sm text-yellow-600 mt-2">
                Достигнуто максимальное количество популярных товаров (5)
              </p>
            )}
          </div>

          {/* Текущие изображения */}
          {renderExistingImages()}

          {/* Новые изображения */}
          {renderNewImagePreviews()}

          <div>
            <Label>Загрузить новые изображения (максимум 5)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Поддерживаемые форматы: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>
    </div>
  );
}
