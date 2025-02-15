import React, { useEffect, useState } from "react";
import { PaymentAPI } from "@/api/payment";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const Payment = () => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const data = await PaymentAPI.getPayment();
        if (data) {
          setPayment({
            id: data.id,
            description: data.descriptions?.map((d) => d.text) || [""],
            paymentMethods: {
              title: data.payment_methods?.[0]?.title || "",
              methods: data.payment_methods?.[0]?.descriptions || [""],
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch payment data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-4 tablet:py-8">
      <div className="text-center mb-6 tablet:mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Оплата</h1>
        <div className="h-1 w-20 bg-primary mx-auto"></div>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
        {payment?.description?.length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {payment.description.map((desc, index) => (
                <p key={index} className="text-balance leading-relaxed">
                  {desc}
                </p>
              ))}
            </CardContent>
          </Card>
        )}

        {payment?.paymentMethods?.title &&
          payment?.paymentMethods?.methods?.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">
                  {payment.paymentMethods.title}
                </h2>
                <div className="space-y-6">
                  {payment.paymentMethods.methods.map((method, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-secondary flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <p className="text-balance leading-relaxed pt-1">
                        {method}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
};

export default Payment;
