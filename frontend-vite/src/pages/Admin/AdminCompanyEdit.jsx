// CompanyEdit.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { companyApi } from "@/api/company";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, PlusCircle, Edit } from "lucide-react";
import { toast } from "sonner";

const AdminCompanyEdit = () => {
  const [formData, setFormData] = useState({
    title: "",
    description_blocks: [""],
    images: [],
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlockIndex, setEditingBlockIndex] = useState(null);
  const [editingBlockContent, setEditingBlockContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      const company = await companyApi.getCompany();
      if (company) {
        setFormData({
          id: company.id,
          title: company.title,
          description_blocks: company.description_blocks
            ? company.description_blocks.map((block) => block.content)
            : [""], // Добавьте дефолтное значение
        });
        setCurrentImages(company.images || []); // Гарантированно пустой массив, если null
      } else {
        // Обработка случая, когда компания не найдена
        setFormData({
          title: "",
          description_blocks: [""],
        });
        setCurrentImages([]);
      }
    } catch (error) {
      toast.error("Ошибка при загрузке данных", {
        description: error.message,
        richColors: true,
      });
      // Установка дефолтных значений в случае ошибки
      setFormData({
        title: "",
        description_blocks: [""],
      });
      setCurrentImages([]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveCurrentImage = (imageId) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleAddBlock = () => {
    setFormData((prev) => ({
      ...prev,
      description_blocks: [...prev.description_blocks, ""],
    }));
  };

  const handleRemoveBlock = (index) => {
    setFormData((prev) => ({
      ...prev,
      description_blocks: prev.description_blocks.filter((_, i) => i !== index),
    }));
  };

  const handleBlockEdit = (index) => {
    setEditingBlockIndex(index);
    setEditingBlockContent(formData.description_blocks[index] || "");
    setIsDialogOpen(true);
  };

  const handleBlockSave = () => {
    setFormData((prev) => ({
      ...prev,
      description_blocks: prev.description_blocks.map((block, i) =>
        i === editingBlockIndex ? editingBlockContent : block
      ),
    }));
    setIsDialogOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await companyApi.saveCompany({
        ...formData,
        images: selectedFiles,
        deletedImages: deletedImageIds,
      });

      toast.success("Успешно сохранено", {
        description: "Информация о компании обновлена",
        richColors: true,
      });

      navigate("/company");
    } catch (error) {
      toast.error("Ошибка при сохранении", {
        description: error.message || "Не удалось сохранить данные",
        richColors: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold">
          Редактирование страницы "О компании"
        </h2>

        <div>
          <Label>Название компании</Label>
          <Input
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            required
          />
        </div>

        <div>
          <Label>Блоки описания</Label>
          <div className="space-y-4">
            {formData.description_blocks.map((block, index) => (
              <div key={index} className="flex items-start gap-4">
                <Card className="flex-1">
                  <CardContent className="p-3">
                    <p className="line-clamp-3">{block || "Пустой блок"}</p>
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveBlock(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleBlockEdit(index)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Ред.
                  </Button>
                </div>
              </div>
            ))}
            <Button type="button" onClick={handleAddBlock} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Добавить блок текста
            </Button>
          </div>
        </div>

        <div>
          <Label>Изображения</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
          />
        </div>

        {currentImages.length > 0 && (
          <div>
            <Label className="mb-2">Текущие изображения:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentImages
                .filter((img) => !deletedImageIds.includes(img.id))
                .map((image) => (
                  <Card key={image.id} className="relative">
                    <CardContent className="p-0 relative">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          image.image_url
                        }`}
                        alt="Company"
                        className="w-full h-52 object-cover rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => handleRemoveCurrentImage(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {previewUrls.length > 0 && (
          <div>
            <Label className="mb-2">Новые изображения:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previewUrls.map((url, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-0 relative">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-52 object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Сохранение..." : "Сохранить"}
        </Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование блока текста</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingBlockContent}
            onChange={(e) => setEditingBlockContent(e.target.value)}
            className="min-h-[200px]"
            placeholder="Введите текст блока..."
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button type="button" onClick={handleBlockSave}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCompanyEdit;
