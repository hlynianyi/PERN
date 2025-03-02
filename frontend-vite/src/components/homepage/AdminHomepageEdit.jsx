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
import { Trash2, Edit2, AlertTriangle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "../ui/separator";

export default function AdminHomepageEdit() {
  // Основное состояние формы
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    description: "",
    popularProducts: [],
    images: [], // Метаданные изображений
  });

  // Состояние для управления изображениями
  const [currentImages, setCurrentImages] = useState([]); // Существующие изображения
  const [selectedFiles, setSelectedFiles] = useState([]); // Новые файлы
  const [newImageData, setNewImageData] = useState([]); // Метаданные для новых изображений
  const [previewUrls, setPreviewUrls] = useState([]); // URL для предпросмотра
  const [deletedImageIds, setDeletedImageIds] = useState([]); // ID удаленных изображений
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // Для сброса input file

  const { products } = useLoadProducts();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Загрузка данных при монтировании
  useEffect(() => {
    loadHomepage();
  }, []);

  const loadHomepage = async () => {
    try {
      const homepage = await homepageApi.getHomepage();
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

  // Проверка наличия необходимых данных для новых изображений
  const validateNewImageData = (files) => {
    // Проверяем, все ли новые изображения имеют заполненные данные
    const isValid = newImageData.every(
      (data) =>
        data.name &&
        data.name.trim() !== "" &&
        data.product_link &&
        data.product_link.trim() !== ""
    );

    if (!isValid) {
      toast({
        title: "Заполните обязательные поля",
        description:
          "У всех добавленных изображений должны быть указаны название и ссылка на товар",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  // Обработка выбора файлов
  const handleFileSelect = (e) => {
    // Проверяем, все ли предыдущие изображения имеют заполненные данные
    if (newImageData.length > 0 && !validateNewImageData()) {
      // Сбрасываем значение input, чтобы пользователь мог повторно выбрать те же файлы
      setFileInputKey(Date.now());
      return;
    }

    const files = Array.from(e.target.files);
    const totalImages =
      files.length +
      currentImages.length -
      deletedImageIds.length +
      selectedFiles.length;

    if (totalImages > 5) {
      toast({
        title: "Ошибка",
        description: "Максимальное количество изображений - 5",
        variant: "destructive",
      });
      setFileInputKey(Date.now());
      return;
    }

    // Создаем метаданные для новых изображений
    const newImages = files.map((file) => ({
      file,
      name: "",
      product_link: "",
      order_index: currentImages.length + selectedFiles.length,
    }));

    setSelectedFiles((prev) => [...prev, ...files]);
    setNewImageData((prev) => [...prev, ...newImages]);

    // Создаем превью
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  // Обновление метаданных изображения
  const handleImageDataChange = (index, field, value) => {
    setNewImageData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Удаление нового файла
  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImageData((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Удаление существующего изображения
  const handleRemoveCurrentImage = (imageId) => {
    // Mark the image for deletion but don't remove it from the server yet
    setDeletedImageIds((prev) => [...prev, imageId]);

    // Visually hide the image in the UI
    toast({
      title: "Изображение отмечено для удаления",
      description: "Изображение будет удалено при сохранении",
    });
  };

  // Отображение существующих изображений
  const renderExistingImages = () => {
    if (!currentImages.length) return null;

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Текущие изображения карусели:</h3>
        <Alert variant="warning" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Невозможно редактировать уже добавленные фотографии. Для изменения
            данных удалите текущую фотографию и загрузите её заново с нужными
            параметрами.
          </AlertDescription>
        </Alert>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentImages
            .filter((img) => !deletedImageIds.includes(img.id))
            .map((image) => (
              <Card key={image.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="relative aspect-video mb-4">
                    <img
                      src={`http://localhost:5002${image.image_url}`}
                      alt={image.name}
                      className="w-full h-full object-cover rounded-md"
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
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input
                      value={image.name || ""}
                      disabled
                      className=""
                      placeholder="Название изображения"
                    />
                    <Label>Ссылка на товар</Label>
                    <Input
                      value={
                        products?.find(
                          (p) =>
                            `/products/details/${p.id}` === image.product_link
                        )?.name || "Товар не найден"
                      }
                      disabled
                      className=""
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    );
  };

  // Отображение новых изображений
  const renderNewImagePreviews = () => {
    if (!previewUrls.length) return null;

    return (
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Новые изображения:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="relative aspect-video mb-4">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
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
                <div className="space-y-2">
                  <Label>
                    Название <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newImageData[index]?.name || ""}
                    onChange={(e) =>
                      handleImageDataChange(index, "name", e.target.value)
                    }
                    placeholder="Название изображения"
                    required
                    className={
                      !newImageData[index]?.name ? "border-red-300" : ""
                    }
                  />
                  <Label>
                    Ссылка на товар <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={newImageData[index]?.product_link || ""}
                    onValueChange={(value) =>
                      handleImageDataChange(index, "product_link", value)
                    }
                    required
                  >
                    <SelectTrigger
                      className={
                        !newImageData[index]?.product_link
                          ? "border-red-300"
                          : ""
                      }
                    >
                      <SelectValue placeholder="Выберите товар" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={`/products/details/${product.id}`}
                        >
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Обработка отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Проверяем заполнение данных для новых изображений
    if (newImageData.length > 0 && !validateNewImageData()) {
      return;
    }

    setIsLoading(true);

    try {
      if (!formData.title?.trim()) {
        throw new Error("Заголовок обязателен для заполнения");
      }

      // Фильтруем удаленные изображения
      const remainingImages = currentImages.filter(
        (img) => !deletedImageIds.includes(img.id)
      );

      // Подготовка данных для отправки
      const dataToSend = {
        ...formData,
        selectedFiles,
        imageMetadata: JSON.stringify([
          ...remainingImages.map((img) => ({
            id: img.id,
            name: img.name || "",
            product_link: img.product_link || "",
            order_index: img.order_index,
          })),
          ...newImageData.map((data) => ({
            name: data.name || "",
            product_link: data.product_link || "",
            order_index: data.order_index,
          })),
        ]),
        deletedImageIds,
        popularProducts: formData.popularProducts.map((id) => Number(id)),
      };

      await homepageApi.saveHomepage(dataToSend);

      toast({
        title: "Успешно сохранено",
        description: "Данные главной страницы обновлены",
      });

      // Очищаем состояние
      setSelectedFiles([]);
      setNewImageData([]);
      setPreviewUrls([]);
      setDeletedImageIds([]);
      setFileInputKey(Date.now()); // Сбрасываем file input

      // Перезагружаем данные
      await loadHomepage();
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
        <h2 className="text-2xl font-bold">
          Редактирование контента на главной странице
        </h2>
        <div className="space-y-8">
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
          <Separator />

          <div className="flex flex-col gap-4">
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
                  className="transition-colors "
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
          <Separator />

          {renderExistingImages()}
          {renderNewImagePreviews()}
          <Separator />

          <div>
            <Label>Загрузить новые изображения для карусели (максимум 5)</Label>
            <Input
              key={fileInputKey}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="mt-2"
            />
            <p className="font-bold text-sm text-red-500 mt-1">
              * !ВАЖНО!: Соблюдать формат изображений 16:9 (прямоугольник)
            </p>
            <p className="font-bold text-sm text-red-500 mt-1">
              * !ВАЖНО!: Соблюдать формат изображений 16:9 (прямоугольник)
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Поддерживаемые форматы:{" "}
              <span className=" font-bold text-red-500">
                JPG, PNG, GIF, WebP
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ограничение по размеру до 10 МБ.
            </p>
            <p className="text-sm text-red-500 mt-1">
              * Для каждой фотографии необходимо указать название и выбрать
              привязку к товару
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
