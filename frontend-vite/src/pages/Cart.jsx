// src/components/cart/Cart.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import store from "@/store";
import {
  updateQuantity,
  updateEngraving,
  removeFromCart,
  clearCart,
} from "@/store/slices/cartSlice";
import { ordersApi } from "@/api/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Minus, Plus, Trash, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Cart = () => {
  const [, forceUpdate] = useState({});
  const cartState = store.getState().cart;
  const { items, totalAmount } = cartState;

  const navigate = useNavigate();

  const [showEngravingDialog, setShowEngravingDialog] = useState(false);
  const [currentItemId, setCurrentItemId] = useState(null);
  const [engravingText, setEngravingText] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerZipCode: "",
    customerAddress: "",
    customerComment: "",
  });

  const [formErrors, setFormErrors] = useState({
    customerPhone: "",
    customerEmail: "",
  });

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const validatePhone = (phone) => {
    // Clean the phone number first
    const cleaned = phone.replace(/\D/g, "");

    // Check if it starts with 7 or 8 and has a total of 11 digits
    if (
      (cleaned.startsWith("7") || cleaned.startsWith("8")) &&
      cleaned.length === 11
    ) {
      return true;
    }

    return false;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      customerPhone: "",
      customerEmail: "",
    };

    // Validate phone
    if (!validatePhone(orderForm.customerPhone)) {
      errors.customerPhone =
        "Введите корректный номер телефона в формате +7XXXXXXXXXX или 8XXXXXXXXXX";
      isValid = false;
    }

    // Validate email (now required)
    if (!orderForm.customerEmail) {
      errors.customerEmail = "Пожалуйста, укажите email";
      isValid = false;
    } else if (!validateEmail(orderForm.customerEmail)) {
      errors.customerEmail = "Введите корректный email";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      store.dispatch(updateQuantity(productId, newQuantity));
    }
  };

  const handleRemoveItem = (productId) => {
    store.dispatch(removeFromCart(productId));
    toast.success("Товар удален из корзины", {
      richColors: true,
    });
  };

  const openEngravingDialog = (productId) => {
    const item = items.find((item) => item.id === productId);
    setCurrentItemId(productId);
    setEngravingText(item.engraving || "");
    setShowEngravingDialog(true);
  };

  const handleSaveEngraving = () => {
    store.dispatch(updateEngraving(currentItemId, engravingText));
    setShowEngravingDialog(false);
    toast.success("Гравировка сохранена", {
      richColors: true,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (name === "customerPhone" || name === "customerEmail") {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Format phone number while typing
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");

    // Don't format if less than 4 digits
    if (cleaned.length < 4) return phone;

    let formatted = "";
    if (cleaned.startsWith("7") || cleaned.startsWith("8")) {
      if (cleaned.startsWith("7")) {
        formatted = "+7 ";
      } else {
        formatted = "8 ";
      }

      if (cleaned.length > 1) {
        formatted += `(${cleaned.substring(1, 4)}`;
      }

      if (cleaned.length > 4) {
        formatted += `) ${cleaned.substring(4, 7)}`;
      }

      if (cleaned.length > 7) {
        formatted += `-${cleaned.substring(7, 9)}`;
      }

      if (cleaned.length > 9) {
        formatted += `-${cleaned.substring(9, 11)}`;
      }
    } else {
      return phone;
    }

    return formatted;
  };

  // Handle phone input specifically
  const handlePhoneChange = (e) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setOrderForm((prev) => ({ ...prev, customerPhone: formattedPhone }));
    setFormErrors((prev) => ({ ...prev, customerPhone: "" }));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    try {
      // Validate form
      if (!orderForm.customerName) {
        toast.error("Ошибка", {
          description: "Пожалуйста, укажите Ф.И.О",
          richColors: true,
        });
        return;
      }

      if (!orderForm.customerPhone) {
        toast.error("Ошибка", {
          description: "Пожалуйста, укажите контактный телефон",
          richColors: true,
        });
        return;
      }

      if (!orderForm.customerEmail) {
        toast.error("Ошибка", {
          description: "Пожалуйста, укажите email",
          richColors: true,
        });
        return;
      }

      if (!orderForm.customerZipCode || !orderForm.customerAddress) {
        toast.error("Ошибка", {
          description: "Пожалуйста, укажите почтовый индекс и адрес доставки",
          richColors: true,
        });
        return;
      }

      if (!agreeToTerms) {
        toast.error("Ошибка", {
          description: "Необходимо согласие на обработку персональных данных",
          richColors: true,
        });
        return;
      }

      // Validate phone and email
      if (!validateForm()) {
        toast.error("Ошибка валидации", {
          description: "Пожалуйста, исправьте ошибки в форме",
          richColors: true,
        });
        return;
      }

      const orderData = {
        ...orderForm,
        // Clean phone number before sending
        customerPhone: orderForm.customerPhone.replace(/\D/g, ""),
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          engraving: item.engraving || "",
        })),
        totalAmount: totalAmount,
      };

      const result = await ordersApi.createOrder(orderData);
      // Clear cart after successful order
      store.dispatch(clearCart());

      // Show success toast with action
      toast.success("Заказ успешно создан", {
        description: "Мы свяжемся с вами для уточнения дальнейших действий",
        richColors: true,
        action: {
          label: "Вернуться в каталог",
          onClick: () => navigate("/products"),
        },
        duration: 5000,
        onAutoClose: () => navigate("/products"),
      });
    } catch (error) {
      toast.error("Ошибка при оформлении заказа", {
        description: error.message || "Произошла ошибка",
        richColors: true,
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-medium mb-4">Ваша корзина пуста</h2>
        <p className="text-muted-foreground mb-6">
          Добавьте товары в корзину, чтобы продолжить покупки
        </p>
        <Button
          className="mt-4c dark:text-secondary-foreground"
          onClick={() => navigate("/products")}
        >
          Вернуться в каталог
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-8">
      <h1 className="text-3xl font-medium mb-6">Корзина</h1>
      <div className="flex flex-col w-full gap-3 laptop:gap-6 laptop:flex-row">
        <div className="laptop:col-span-2 grow">
          <Card>
            <CardHeader>
              <CardTitle>Товары в корзине</CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <div
                  className="flex flex-col tablet:flex-row-reverse tablet:gap-6 border-b border-secondary last:border-0"
                  key={item.id}
                >
                  <div className="my-4 h-[144px] flex-shrink-0">
                    {item.image ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}${item.image}`}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span>Нет фото</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col  py-4 grow">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-muted-foreground">
                        {parseFloat(item.price).toLocaleString("ru-RU")} ₽ за
                        шт.
                      </p>

                      {item.engraving && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Гравировка:</span>{" "}
                            {item.engraving}
                          </p>
                        </div>
                      )}

                      <Button
                        className="mobile:w-full tablet:w-auto"
                        variant="outline"
                        size="sm"
                        onClick={() => openEngravingDialog(item.id)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        {item.engraving
                          ? "Изменить гравировку"
                          : "Добавить гравировку"}
                      </Button>

                      <div className="flex flex-wrap items-center mt-3 gap-3">
                        <div className="flex items-center border rounded-md mobile:w-full tablet:w-auto justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <div className="w-10 text-center">
                            {item.quantity}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-l-none"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 mobile:w-full tablet:w-auto"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Удалить
                        </Button>
                      </div>
                    </div>

                    <div className="text-left tablet:mt-4 mobile:mt-2 font-medium">
                      {parseFloat(item.price * item.quantity).toLocaleString(
                        "ru-RU"
                      )}{" "}
                      ₽
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex flex-col-reverse justify-between items-start gap-2 tablet:flex-row tablet:justify-between">
              <Button variant="outline" onClick={() => navigate("/products")}>
                Продолжить покупки
              </Button>

              <div className="text-xl font-medium">
                Сумма: {parseFloat(totalAmount).toLocaleString("ru-RU")} ₽
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="grow">
          <Card>
            <CardHeader>
              <CardTitle>Оформление заказа</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <label className="block mb-1">
                    Ф.И.О <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="customerName"
                    value={orderForm.customerName}
                    onChange={handleInputChange}
                    placeholder="Иванов Иван Иванович"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">
                    Телефон <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="customerPhone"
                    value={orderForm.customerPhone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    required
                  />
                  {formErrors.customerPhone && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="customerEmail"
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={handleInputChange}
                    placeholder="example@email.com"
                    required
                  />
                  {formErrors.customerEmail && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.customerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">
                    Почтовый индекс <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="customerZipCode"
                    value={orderForm.customerZipCode}
                    onChange={handleInputChange}
                    placeholder=""
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1">
                    Адрес доставки <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    name="customerAddress"
                    value={orderForm.customerAddress}
                    onChange={handleInputChange}
                    placeholder="Город, улица, дом, квартира"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreeToTerms}
                    onCheckedChange={setAgreeToTerms}
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Я согласен на{" "}
                    <Link
                      to="/agreement"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      обработку персональных данных
                    </Link>
                  </label>
                </div>

                <div>
                  <label className="block mb-1">Комментарий к заказу</label>
                  <Textarea
                    name="customerComment"
                    value={orderForm.customerComment}
                    onChange={handleInputChange}
                    placeholder="Дополнительная информация к заказу"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !!formErrors.customerPhone ||
                    !!formErrors.customerEmail ||
                    !agreeToTerms
                  }
                >
                  Оформить заказ
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Engraving Dialog */}
      <Dialog open={showEngravingDialog} onOpenChange={setShowEngravingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Гравировка на изделии</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={engravingText}
              onChange={(e) => setEngravingText(e.target.value)}
              placeholder="Введите текст для гравировки"
              className="min-h-[100px]"
              maxLength={50}
            />
            <div className="text-sm text-muted-foreground mt-2">
              Если заказываете более одного экземпляра и нужен разный текст
              гравировки для каждого экземпляра - уточните{" "}
              <b>в комментарии к заказу</b> детали или{" "}
              <b>при подтверждении заказа по телефону</b>
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEngravingDialog(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveEngraving}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;
