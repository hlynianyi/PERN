import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5002/api",
});

const PartnershipPage = () => {
  const [partnershipData, setPartnershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPartnership = async () => {
      try {
        const response = await api.get("/partnership");
        setPartnershipData(response.data);
      } catch (err) {
        setError("Не удалось загрузить информацию о партнерстве");
        console.error("Ошибка при загрузке:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPartnership();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const text_blocks = partnershipData?.text_blocks || [];

  return (
    <>
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {partnershipData?.title || "Сотрудничество"}
          </h1>
          <div className="h-1 w-20 bg-primary mx-auto"></div>
        </div>

        <div className="prose prose-lg max-w-none">
          {text_blocks.map((block, index) => (
            <div
              key={block.id || index}
              className={`mb-8 ${
                index !== text_blocks.length - 1 ? "border-b pb-8" : ""
              }`}
            >
              <p
                className={` leading-relaxed ${
                  block.format_data?.bold ? "font-bold" : ""
                }`}
              >
                {block.text}
              </p>
            </div>
          ))}
        </div>

        {text_blocks.length === 0 && (
          <div className="text-center py-12 ">
            Информация о партнерстве в настоящее время недоступна
          </div>
        )}
      </div>
    </>
  );
};

export default PartnershipPage;
