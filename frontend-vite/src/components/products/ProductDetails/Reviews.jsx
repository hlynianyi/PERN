import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Edit2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { CustomPagination } from "../../../subcomponents/CustomPagination";

export const Reviews = ({
  reviews,
  averageRating,
  onNewReview,
  onEditReview,
  onDeleteReview,
}) => {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination values
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = reviews?.slice(startIndex, endIndex) || [];

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
        <Button className='dark:text-secondary-foreground' onClick={onNewReview}>Оставить отзыв</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{review.user_name}</h3>
                {isAuthenticated && (
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
                )}
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

      {reviews?.length > itemsPerPage && (
        <CustomPagination
          currentPage={currentPage}
          totalItems={reviews.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
