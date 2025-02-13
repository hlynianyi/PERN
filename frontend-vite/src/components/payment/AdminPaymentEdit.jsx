import React, { useEffect, useState } from "react";
import { PaymentAPI } from "../../api/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminPaymentEdit = () => {
  const [payment, setPayment] = useState({
    id: null,
    description: [""],
    paymentMethods: {
      title: "",
      methods: [""],
    },
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Преобразуем данные в формат, ожидаемый бэкендом
      const paymentData = {
        id: payment.id,
        descriptions: JSON.stringify(
          payment.description.map((text, index) => ({
            text,
            order_index: index,
          }))
        ),
        payment_methods: JSON.stringify([
          {
            title: payment.paymentMethods.title,
            descriptions: payment.paymentMethods.methods,
            order_index: 0,
          },
        ]),
      };

      await PaymentAPI.updatePayment(paymentData);
      toast({
        title: "Успешно",
        description: "Данные успешно сохранены",
      });
    } catch (error) {
      console.error("Failed to update payment:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить данные",
        variant: "destructive",
      });
    }
  };

  const handleDescriptionChange = (index, value) => {
    const newDescription = [...payment.description];
    newDescription[index] = value;
    setPayment({ ...payment, description: newDescription });
  };

  const handleMethodChange = (index, value) => {
    const newMethods = [...payment.paymentMethods.methods];
    newMethods[index] = value;
    setPayment({
      ...payment,
      paymentMethods: {
        ...payment.paymentMethods,
        methods: newMethods,
      },
    });
  };

  const addDescription = () => {
    setPayment({
      ...payment,
      description: [...payment.description, ""],
    });
  };

  const addMethod = () => {
    setPayment({
      ...payment,
      paymentMethods: {
        ...payment.paymentMethods,
        methods: [...payment.paymentMethods.methods, ""],
      },
    });
  };

  const removeDescription = (index) => {
    const newDescription = payment.description.filter((_, i) => i !== index);
    setPayment({ ...payment, description: newDescription });
  };

  const removeMethod = (index) => {
    const newMethods = payment.paymentMethods.methods.filter(
      (_, i) => i !== index
    );
    setPayment({
      ...payment,
      paymentMethods: {
        ...payment.paymentMethods,
        methods: newMethods,
      },
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        Редактирование страницы оплаты
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Текстовые блоки</h2>
          <span className="text-muted-foreground">
            *каждый блок - отдельный абзац внутри общего текстового блока
          </span>
          {payment.description.map((desc, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={desc}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeDescription(index)}
                disabled={payment.description.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addDescription}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Добавить абзац
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Способы оплаты</h2>
          <Input
            value={payment.paymentMethods.title}
            onChange={(e) =>
              setPayment({
                ...payment,
                paymentMethods: {
                  ...payment.paymentMethods,
                  title: e.target.value,
                },
              })
            }
            placeholder="Заголовок"
            className="mb-4"
          />
          {payment.paymentMethods?.methods?.map((method, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={method}
                onChange={(e) => handleMethodChange(index, e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeMethod(index)}
                disabled={payment.paymentMethods.methods.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addMethod}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Добавить способ оплаты
          </Button>
        </div>

        <Button type="submit" className="w-full">
          Сохранить
        </Button>
      </form>
    </div>
  );
};

export default AdminPaymentEdit;
