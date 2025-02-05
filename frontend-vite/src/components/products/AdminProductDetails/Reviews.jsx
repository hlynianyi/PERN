// components/products/ProductDetails/Reviews.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const Reviews = ({
  reviews,
  averageRating,
  onNewReview,
  onEditReview,
  onDeleteReview,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            Отзывы ({reviews?.length || 0})
          </h2>
          {averageRating > 0 && (
            <div className="flex items-center">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    index < Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-gray-600">
                {parseFloat(averageRating).toFixed(1)} из 5
              </span>
            </div>
          )}
        </div>
        <Button onClick={onNewReview}>Оставить отзыв</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{review.user_name}</h3>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditReview(review)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteReview(review.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p>{review.comment}</p>
              <p className="text-sm text-gray-500">
                {format(new Date(review.created_at), "dd MMMM yyyy", {
                  locale: ru,
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
