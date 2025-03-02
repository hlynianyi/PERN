// frontend/src/pages/reviews/AdminReviewsEdit.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { reviewApi } from '@/api/reviews';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const AdminReviewsEdit = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('pending');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [page, status]);

  const fetchReviews = async () => {
    try {
      const result = await reviewApi.getAllReviews({
        page,
        limit: 10,
        status
      });

      setReviews(result.reviews);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Ошибка загрузки отзывов', error);
      toast.error('Ошибка загрузки отзывов', {
        description: error.message || 'Не удалось загрузить список отзывов',
        richColors: true,
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await reviewApi.updateReviewStatus(id, newStatus);
      fetchReviews();
      
      const statusText = 
        newStatus === 'approved' ? 'одобрен' : 
        newStatus === 'rejected' ? 'отклонен' : 'изменен';
      
      toast.success('Статус отзыва обновлен', {
        description: `Отзыв #${id} успешно ${statusText}`,
        richColors: true,
      });
    } catch (error) {
      console.error('Ошибка обновления статуса', error);
      toast.error('Ошибка обновления статуса', {
        description: error.message || 'Не удалось обновить статус отзыва',
        richColors: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await reviewApi.deleteReview(id);
      fetchReviews();
      toast.success('Отзыв удален', {
        description: `Отзыв #${id} успешно удален`,
        richColors: true,
      });
    } catch (error) {
      console.error('Ошибка удаления отзыва', error);
      toast.error('Ошибка удаления отзыва', {
        description: error.message || 'Не удалось удалить отзыв',
        richColors: true,
      });
    }
  };

  const openReviewDetails = (review) => {
    setSelectedReview(review);
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full my-4">
      <CardHeader className='space-y-6'>
        <CardTitle>Управление отзывами</CardTitle>
        <div className="flex items-center space-x-4 mt-4">
          <span className="font-medium">Статус отзывов:</span>
          <Select
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">На модерации</SelectItem>
              <SelectItem value="approved">Одобренные</SelectItem>
              <SelectItem value="rejected">Отклоненные</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Имя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>{review.name}</TableCell>
                <TableCell>{review.email || 'Не указан'}</TableCell>
                <TableCell>{review.phone || 'Не указан'}</TableCell>
                <TableCell>
                  {new Date(review.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReviewDetails(review)}
                    >
                      Просмотр
                    </Button>
                    {status === 'pending' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleStatusChange(review.id, 'approved')}
                        >
                          Одобрить
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStatusChange(review.id, 'rejected')}
                        >
                          Отклонить
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            Предыдущая
          </Button>
          <span>
            Страница {page} из {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(prev => prev + 1)}
          >
            Следующая
          </Button>
        </div>

        {/* Review Details Dialog */}
        {selectedReview && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Детали отзыва</DialogTitle>
                <DialogDescription>
                  Подробная информация об отзыве
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Имя:</span>
                  <span className="col-span-3">{selectedReview.name}</span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Email:</span>
                  <span className="col-span-3">
                    {selectedReview.email || 'Не указан'}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Телефон:</span>
                  <span className="col-span-3">
                    {selectedReview.phone || 'Не указан'}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Дата:</span>
                  <span className="col-span-3">
                    {new Date(selectedReview.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <span className="font-medium">Статус:</span>
                  <span className="col-span-3">
                    {selectedReview.status === 'pending'
                      ? 'На модерации'
                      : selectedReview.status === 'approved'
                        ? 'Одобрен'
                        : 'Отклонен'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <span className="font-medium">Текст отзыва:</span>
                  <p className="col-span-3 p-2 border rounded">
                    {selectedReview.text}
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminReviewsEdit;