// src/pages/Delivery.jsx
import { useEffect, useState } from "react";
import { deliveryApi } from "@/api/delivery";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const DeliveryServiceItem = ({ service }) => (
  <div className="flex flex-col  py-2 ">
    <span className="text-base font-medium">{service.service_name}</span>
    <div className="flex justify-between">
      <span className="text-base font-sans text-muted-foreground ">
        {service.service_period}
      </span>
      <span className="text-base font-sans font-medium">{service.service_cost}</span>
    </div>
  </div>
);

const RegionCard = ({ region }) => (
  <Card className="mb-6 last:mb-0">
    <CardContent className="pt-6">
      {region.destinations.map((dest, idx) => (
        <div key={idx}>
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-4 text-center">
              {dest.destination_service}
            </h3>
            <div className="space-y-2">
              {dest.services.map((service, serviceIdx) => (
                <DeliveryServiceItem key={serviceIdx} service={service} />
              ))}
            </div>
          </div>
          {idx !== region.destinations.length - 1 && (
            <Separator className="my-6" />
          )}
        </div>
      ))}
      {region.note && (
        <p className="text-sm text-muted-foreground italic mt-4">
          {region.note}
        </p>
      )}
    </CardContent>
  </Card>
);

const Delivery = () => {
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDelivery = async () => {
      try {
        const data = await deliveryApi.getDelivery();
        setDeliveryData(data);
        console.log("🚀 ~ loadDelivery ~ data:", data);
      } catch (err) {
        setError("Не удалось загрузить информацию о доставке");
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDelivery();
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
      <div className=" max-w-3xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-4 tablet:py-8">
      <div className="text-center mb-6 tablet:mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Доставка</h1>
        <div className="h-1 w-20 bg-primary mx-auto"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {deliveryData?.subtitle && (
          <div className="mb-8">
            <p className="text-lg text-balance text-center">
              {deliveryData.subtitle}
            </p>
          </div>
        )}

        {deliveryData?.description && (
          <div className="mb-12">
            <p className="whitespace-pre-line">{deliveryData.description}</p>
          </div>
        )}

        {deliveryData?.regions && deliveryData.regions.length > 0 && (
          <div className="space-y-6">
            {deliveryData.regions.map((region) => (
              <RegionCard
                key={region.id} // Используем id вместо index
                region={region}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Delivery;
