import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useLoadCategories } from "@/hooks/useLoadCategories";
import { productsApi, PRODUCT_STATUSES } from "../../api/products";

const AdminProductCreate = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    steel: "",
    handle: "",
    length: "",
    status: "in_stock",
  });

  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    certificates: [],
  });

  const [previewUrls, setPreviewUrls] = useState({
    images: [],
    certificates: [],
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const categories = useLoadCategories();

  const handleFileSelect = (type, e) => {
    const files = Array.from(e.target.files);
    const maxFiles = type === "images" ? 10 : 5;

    if (files.length + selectedFiles[type].length > maxFiles) {
      toast({
        title: "Ошибка",
        description: `Можно загрузить максимум ${maxFiles} ${
          type === "images" ? "изображений" : "сертификатов"
        }`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [type]: [...prev[type], ...files],
    }));

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => ({
      ...prev,
      [type]: [...prev[type], ...newPreviewUrls],
    }));
  };

  const handleRemoveFile = (type, index) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));

    URL.revokeObjectURL(previewUrls[type][index]);
    setPreviewUrls((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        images: selectedFiles.images,
        certificates: selectedFiles.certificates,
      };

      await productsApi.create(dataToSend);
      toast({
        title: "Продукт создан",
      });
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Ошибка при создании продукта",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  useEffect(() => {
    return () => {
      [...previewUrls.images, ...previewUrls.certificates].forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, [previewUrls.images, previewUrls.certificates]);

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Название</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>
              Категория{" "}
              <span className="font-normal">
                (не допускайте ошибок, в каталоге выводятся уникальные значения
                категорий введенные в этом поле)
              </span>
              .
            </Label>
            <Input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Введите категорию "
              required
            />
          </div>
          {/* Добавляем список существующих категорий */}
          {categories.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm text-gray-500">
                Или выберите существующую категорию:
              </Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCategorySelect(category)}
                    className="hover:bg-primary hover:text-white"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label>Описание</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Цена</Label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Сталь</Label>
            <Input
              name="steel"
              value={formData.steel}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Рукоять</Label>
            <Input
              name="handle"
              value={formData.handle}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Длина (см)</Label>
            <Input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label>Статус</Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) =>
                handleChange({ target: { name: "status", value } })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Изображения (до 10 штук)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect("images", e)}
            />
          </div>

          {previewUrls.images.length > 0 && (
            <div className="space-y-2">
              <Label>Выбранные изображения:</Label>
              <div className="flex gap-4 overflow-x-auto p-2">
                {previewUrls.images.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-24 object-cover rounded"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveFile("images", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Сертификаты (до 5 штук)</Label>
            <Input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => handleFileSelect("certificates", e)}
            />
          </div>

          {previewUrls.certificates.length > 0 && (
            <div className="space-y-2">
              <Label>Выбранные сертификаты:</Label>
              <div className="flex gap-4 overflow-x-auto p-2">
                {previewUrls.certificates.map((url, index) => (
                  <div key={index} className="relative">
                    <div className="border rounded p-2">
                      <p>{selectedFiles.certificates[index].name}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveFile("certificates", index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Создать продукт
        </Button>
      </form>
    </div>
  );
};

export default AdminProductCreate;
