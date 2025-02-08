// CompanyDetails.jsx
import React, { useEffect, useState } from "react";
import { companyApi } from "@/api/company";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const CompanyDetails = () => {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const data = await companyApi.getCompany();
      setCompany(data);
      setError(null);
    } catch (err) {
      setError("Ошибка при загрузке информации о компании");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Информация</AlertTitle>
          <AlertDescription>
            Информация о компании еще не добавлена
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <h1 className="flex flex-start text-3xl font-serif font-normal text-center">
          {company.title}
        </h1>
        <div className="space-y-6 font-sans">
          {company.description_blocks &&
            company.description_blocks.map((block) => (
              <p key={block.id} className="text-lg leading-relaxed">
                {block.content}
              </p>
            ))}
        </div>
        {company.images && company.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.images.map((image) => (
              <Card key={image.id} className="overflow-hidden shadow-md">
                <CardContent className="p-0">
                  <img
                    src={`http://localhost:5002${image.image_url}`}
                    alt="Company"
                    className="w-full h-72 object-contain"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
