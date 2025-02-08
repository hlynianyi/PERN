// index.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

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
      toast({
        title: "Ошибка при загрузке продукта",
        description: error.message,
        variant: "destructive",
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
      toast({
        title: "Основное изображение обновлено",
      });
    } catch (error) {
      toast({
        title: "Ошибка при обновлении основного изображения",
        description: error.message,
        variant: "destructive",
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

      toast({
        title: "Продукт обновлен",
      });
      navigate("/admin/products");
    } catch (error) {
      toast({
        title: "Ошибка при обновлении продукта",
        description: error.message,
        variant: "destructive",
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
