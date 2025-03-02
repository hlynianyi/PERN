// CertificateSection.jsx
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export const CertificateSection = ({
  currentCertificates,
  deletedCertificateIds,
  handleRemoveCurrentFile,
  handleFileSelect,
  previewUrls,
  selectedFiles,
  handleRemoveFile,
}) => {
  return (
    <div className="space-y-4">
      {/* Текущие сертификаты */}
      {currentCertificates.length > 0 && (
        <div className="space-y-2">
          <Label>Текущие сертификаты:</Label>
          <div className="flex gap-4 overflow-x-auto p-2">
            {currentCertificates
              .filter((cert) => !deletedCertificateIds.includes(cert.id))
              .map((cert) => (
                <div key={cert.id} className="relative">
                  <div className="border rounded p-2">
                    <p className="text-sm">Сертификат {cert.id}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        window.open(
                          `http://localhost:5002${cert.certificate_url}`,
                          "_blank"
                        )
                      }
                    >
                      Просмотр
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() =>
                      handleRemoveCurrentFile("certificates", cert.id)
                    }
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Загрузка новых сертификатов */}
      <div className="space-y-2">
        <Label>Добавить сертификаты </Label>
        <span className="text-primary">(до 5шт.)</span>
        <Input
          type="file"
          accept=".pdf,image/*"
          multiple
          onChange={(e) => handleFileSelect("certificates", e)}
        />
      </div>

      {previewUrls.certificates.length > 0 && (
        <div className="space-y-2">
          <Label>Новые сертификаты:</Label>
          <div className="flex gap-4 overflow-x-auto p-2">
            {previewUrls.certificates.map((url, index) => (
              <div key={index} className="relative">
                <div className="border rounded p-2">
                  <p className="text-sm">
                    {selectedFiles.certificates[index].name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(url, "_blank")}
                  >
                    Просмотр
                  </Button>
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
  );
};
