// index.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { productsApi } from "../../../api/products";
import { ImageSection } from "./ImageSection";
import { CertificateSection } from "./CertificateSection";
import { ProductForm } from "./ProductForm";
import { toast } from "sonner";

const AdminProductEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    steel: "",
    handle: "",
    length: "",
    status: "in_stock",
    sheath: "",
    blade_length: "",
    blade_thickness: "",
    hardness: "",
    notes: "",
  });

  const [currentImages, setCurrentImages] = useState([]);
  const [currentCertificates, setCurrentCertificates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    certificates: [],
  });
  const [previewUrls, setPreviewUrls] = useState({
    images: [],
    certificates: [],
  });
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [deletedCertificateIds, setDeletedCertificateIds] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await productsApi.getOne(id);
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        steel: product.steel || "",
        handle: product.handle || "",
        length: product.length || "",
        status: product.status,
        sheath: product.sheath || "",
        blade_length: product.blade_length || "",
        blade_thickness: product.blade_thickness || "",
        hardness: product.hardness || "",
        notes: product.notes || "",
      });
      setCurrentImages(product.images || []);
      setCurrentCertificates(product.certificates || []);
    } catch (error) {
      toast.error("Ошибка при загрузке продукта", {
        description: error.message,
        richColors: true,
      });
    }
  };

  const handleFileSelect = (type, e) => {
    const files = Array.from(e.target.files);
    const currentFiles =
      type === "images" ? currentImages : currentCertificates;
    const maxFiles = type === "images" ? 10 : 5;
    const deletedIds =
      type === "images" ? deletedImageIds : deletedCertificateIds;

    if (
      currentFiles.length -
        deletedIds.length +
        selectedFiles[type].length +
        files.length >
      maxFiles
    ) {
      toast.error("Ошибка", {
        description: `Можно загрузить максимум ${maxFiles} ${
          type === "images" ? "изображений" : "сертификатов"
        }`,
        richColors: true,
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

  const handleRemoveCurrentFile = (type, fileId) => {
    if (type === "images") {
      setDeletedImageIds((prev) => [...prev, fileId]);
    } else {
      setDeletedCertificateIds((prev) => [...prev, fileId]);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productsApi.setPrimaryImage(id, imageId);
      loadProduct();
      toast.success("Основное изображение обновлено", {
        richColors: true,
      });
    } catch (error) {
      toast.error("Ошибка при обновлении основного изображения", {
        description: error.message,
        richColors: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const updateData = {
        ...formData,
        deletedImages: deletedImageIds,
        deletedCertificates: deletedCertificateIds,
        images: selectedFiles.images,
        certificates: selectedFiles.certificates,
      };

      await productsApi.update(id, updateData);

      toast.success("Продукт обновлен", {
        richColors: true,
      });
      navigate("/admin/products");
    } catch (error) {
      toast.error("Ошибка при обновлении продукта", {
        description: error.message,
        richColors: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    return () => {
      [...previewUrls.images, ...previewUrls.certificates].forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="space-y-8">
        <ProductForm formData={formData} handleChange={handleChange} />
        <div>
          <p className="font-bold text-sm text-red-500 mt-1">
            * !ВАЖНО!: Соблюдать формат изображений 4:4 (квадрат) при загрузке
            фото продуктов
          </p>
          <p className="font-bold text-sm text-red-500 mt-1">
            * !ВАЖНО!: Очень желательно сделать прозрачным задний фон у
            загружаемых фотографий, чтобы они не выпадали из темной темы. Можно
            сделать на любом сайте онлайн. (Прим.: https://www.remove.bg/ru)
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Поддерживаемые форматы:{" "}
            <span className=" font-bold text-red-500">JPG, PNG, GIF, WebP</span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Ограничение по размеру до 10 МБ.
          </p>
        </div>
        <ImageSection
          currentImages={currentImages}
          deletedImageIds={deletedImageIds}
          handleRemoveCurrentFile={handleRemoveCurrentFile}
          handleSetPrimaryImage={handleSetPrimaryImage}
          handleFileSelect={handleFileSelect}
          previewUrls={previewUrls}
          selectedFiles={selectedFiles}
          handleRemoveFile={handleRemoveFile}
        />

        <CertificateSection
          currentCertificates={currentCertificates}
          deletedCertificateIds={deletedCertificateIds}
          handleRemoveCurrentFile={handleRemoveCurrentFile}
          handleFileSelect={handleFileSelect}
          previewUrls={previewUrls}
          selectedFiles={selectedFiles}
          handleRemoveFile={handleRemoveFile}
        />

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/products")}
          >
            Отмена
          </Button>
          <Button type="submit">Обновить продукт</Button>
        </div>
      </form>

      {/* Диалог подтверждения удаления файлов */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {(deletedImageIds.length > 0 || deletedCertificateIds.length > 0) && (
            <Button variant="destructive" className="mt-4">
              Удалить выбранные файлы (
              {deletedImageIds.length + deletedCertificateIds.length})
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтверждение удаления</AlertDialogTitle>
            <AlertDialogDescription>
              Вы действительно хотите удалить выбранные файлы? Это действие
              нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProductEdit;
