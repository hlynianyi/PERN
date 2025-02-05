// components/products/ProductDetails/ReviewForm.jsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const ReviewForm = ({
  isOpen,
  onClose,
  reviewForm,
  setReviewForm,
  handleSubmit,
  isEditing,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Редактировать отзыв" : "Оставить отзыв"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing ? (
            <div className="space-y-2">
              <Label>Ваше имя</Label>
              <Input
                value={reviewForm.user_name}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    user_name: e.target.value,
                  }))
                }
                required
              />
            </div>
          ) : (
            <h3 className="text-lg font-semibold">{reviewForm.user_name}</h3>
          )}

          <div className="space-y-2">
            <Label>Оценка</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm((prev) => ({
                  ...prev,
                  rating: parseInt(e.target.value),
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Комментарий</Label>
            <Textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({
                  ...prev,
                  comment: e.target.value,
                }))
              }
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? "Сохранить изменения" : "Отправить"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
