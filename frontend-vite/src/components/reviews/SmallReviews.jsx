import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { reviewApi } from "@/api/reviews";
import { MessageSquareCode } from "lucide-react";
import { MessageCircle } from "lucide-react";

const SmallReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRandomReviews();
  }, []);

  const fetchRandomReviews = async () => {
    try {
      setIsLoading(true);
      // Get all reviews to determine total count
      const allReviewsResult = await reviewApi.getAllReviews({
        page: 1,
        limit: 100, // Using a large number to get an accurate count
      });

      // Extract data safely
      const reviewsList = allReviewsResult?.reviews || [];
      const total = allReviewsResult?.total || reviewsList.length;

      setTotalReviews(total);

      // Select 3 random reviews if we have more than 3
      if (reviewsList.length > 3) {
        const randomReviews = [];
        const usedIndices = new Set();

        while (
          randomReviews.length < 3 &&
          usedIndices.size < reviewsList.length
        ) {
          const randomIndex = Math.floor(Math.random() * reviewsList.length);

          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            randomReviews.push(reviewsList[randomIndex]);
          }
        }

        setReviews(randomReviews);
      } else {
        // If we have 3 or fewer reviews, use all of them
        setReviews(reviewsList);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format date in Russian style: day month year
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Array of month names in Russian, in genitive case
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  };

  if (isLoading) {
    return null; // Don't show anything while loading
  }

  // If there are no reviews, don't render the component
  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="">
      <div className="text-center mb-6 tablet:mb-8">
        <h2 className="text-3xl font-semibold tracking-tight mb-1">Отзывы</h2>
        <Link
          to="/reviews"
          className="text-sm text-primary underline underline-offset-4 hover:text-primary transition-colors"
        >
          Все ({totalReviews})
        </Link>
        <div className="mt-4 h-1 w-20 bg-primary mx-auto mb-2"></div>
      </div>
      <div className="grid grid-cols-1 tablet:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <Card
            key={review.id}
            className="overflow-hidden border-primary/20 h-full flex flex-col"
          >
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-start gap-[6px] items-center mb-2">
                <MessageCircle />
                <h3 className="font-semibold text-lg h-[30px]">
                  {review.name}
                </h3>
              </div>
              <div className="mt-2 text-muted-foreground flex-1 font-serif">
                <p className="line-clamp-5 text-balance">{review.text}</p>
              </div>
              <span className="text-sm text-muted-foreground text-end mt-2">
                {formatDate(review.created_at)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-3 laptop:mt-6">
        <Link
          to="/reviews"
          className="text-primary hover:underline transition-all"
        >
          Оставить свой отзыв →
        </Link>
      </div>
    </section>
  );
};

export default SmallReviews;
