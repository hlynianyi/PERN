// ImageSection.jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Star } from "lucide-react";

export const ImageSection = ({
  currentImages,
  deletedImageIds,
  handleRemoveCurrentFile,
  handleSetPrimaryImage,
  handleFileSelect,
  previewUrls,
  selectedFiles,
  handleRemoveFile,
}) => {
  return (
    <div className="space-y-4">
      {/* Текущие изображения */}
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <Label>Текущие изображения:</Label>
          <div className="flex gap-4 overflow-x-auto p-2">
            {currentImages
              .filter((img) => !deletedImageIds.includes(img.id))
              .map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={`http://localhost:5002${image.image_url}`}
                    alt="Product"
                    className="h-24 w-24 object-cover rounded"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemoveCurrentFile("images", image.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Загрузка новых изображений */}
      <div className="space-y-2">
        <Label>Добавить изображения </Label>
        <span className="text-primary">(до 10шт.)</span>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect("images", e)}
        />
        <span className="text-primary">лимит: загрузки 10шт.</span>
      </div>

      {previewUrls.images.length > 0 && (
        <div className="space-y-2">
          <Label>Новые изображения:</Label>
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
    </div>
  );
};
