// frontend/src/pages/Reviews.jsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { reviewApi } from "@/api/reviews";
import { toast } from "sonner";

// Схема валидации для формы отзыва
const reviewSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Имя должно содержать минимум 2 символа" }),
  email: z.string().email({ message: "Некорректный формат email" }).optional(),
  phone: z
    .string()
    .regex(
      /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
      { message: "Некорректный формат телефона" }
    )
    .optional(),
  text: z
    .string()
    .min(10, { message: "Отзыв должен содержать минимум 10 символов" }),
});

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Форма для создания отзыва
  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      text: "",
    },
  });

  // Загрузка отзывов при монтировании и смене страницы
  useEffect(() => {
    fetchReviews();
  }, [page]);

  // Получение списка отзывов
  const fetchReviews = async () => {
    try {
      const result = await reviewApi.getAllReviews({
        page,
        limit: 10,
      });

      // Safely handle the response
      const reviewsList = result?.reviews || [];
      const totalPagesCount = result?.totalPages || 0;

      setReviews(reviewsList);
      setTotalPages(totalPagesCount);
    } catch (error) {
      toast.error("Ошибка", {
        description: "Не удалось загрузить отзывы",
        richColors: true,
      });
    }
  };

  // Обработчик отправки формы
  const onSubmit = async (data) => {
    try {
      await reviewApi.createReview(data);

      // Очистка формы
      form.reset();

      // Показ уведомления об успехе
      toast.success("Успех", {
        description: "Ваш отзыв отправлен и ожидает модерации",
        richColors: true,
      });

      // Обновление списка отзывов
      fetchReviews();
    } catch (error) {
      toast.error("Ошибка", {
        description: "Не удалось отправить отзыв",
        richColors: true,
      });
    }
  };

  return (
    <div className="w-full mx-auto py-4 tablet:py-8 qhd:px-0 grid laptop:grid-cols-2 gap-4 laptop:gap-8">
      {/* Форма для создания отзыва */}
      <Card>
        <CardHeader>
          <CardTitle>Оставить отзыв</CardTitle>
          <CardDescription>
            Поделитесь своим мнением о нашей продукции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[16px]">Имя *</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите ваше имя" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[16px]">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Введите email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[16px]">Телефон</FormLabel>
                    <FormControl>
                      <Input placeholder="+7 (___) ___-__-__" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[16px]">Ваш отзыв *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Напишите ваш отзыв"
                        {...field}
                        className="min-h-[120px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Отправить отзыв
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Список отзывов */}
      <Card>
        <CardHeader>
          <CardTitle>Отзывы о нашей продукции</CardTitle>
          <CardDescription>Всего отзывов: {reviews.length}</CardDescription>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center text-muted-foreground">
              Пока нет оставленных отзывов
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 bg-background"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{review.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-balance font-serif">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Предыдущая
              </Button>
              <span className="text-sm text-muted-foreground">
                Страница {page} из {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Следующая
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Reviews;
