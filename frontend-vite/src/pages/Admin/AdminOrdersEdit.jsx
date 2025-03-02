// src/pages/admin/AdminOrdersEdit.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ordersApi } from "@/api/orders";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Status labels for display
const ORDER_STATUS_LABELS = {
  new: "Ожидает обработки",
  shipped: "Отправлен",
  completed: "Выполнен",
  rejected: "Отклонен",
};

// Status colors for visual indication
const STATUS_COLORS = {
  new: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const AdminOrdersEdit = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState("new");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const fetchOrders = async () => {
    try {
      const result = await ordersApi.getAllOrders({
        page,
        limit: 10,
        status: status === "all" ? null : status,
      });

      setOrders(result.orders);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Ошибка загрузки заказов", error);
      toast.error("Ошибка загрузки", {
        description: "Не удалось загрузить список заказов",
        richColors: true,
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersApi.updateOrderStatus(id, newStatus);
      setIsStatusDialogOpen(false);
      fetchOrders();
      toast.success("Статус обновлен", {
        description: `Заказ #${id} переведен в статус "${ORDER_STATUS_LABELS[newStatus]}"`,
        richColors: true,
      });
    } catch (error) {
      console.error("Ошибка обновления статуса", error);
      toast.error("Ошибка", {
        description: error.message || "Не удалось обновить статус заказа",
        richColors: true,
      });
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Вы уверены, что хотите удалить этот заказ? Это действие нельзя отменить."
      )
    ) {
      try {
        await ordersApi.deleteOrder(id);
        fetchOrders();
        toast.success("Заказ удален", {
          description: `Заказ #${id} успешно удален`,
          richColors: true,
        });
      } catch (error) {
        console.error("Ошибка удаления заказа", error);
        toast.error("Ошибка", {
          description: error.message || "Не удалось удалить заказ",
          richColors: true,
        });
      }
    }
  };

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  };

  const openStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalItems = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + parseInt(item.quantity), 0);
  };

  return (
    <Card className="w-full my-4">
      <CardHeader className="space-y-6">
        <CardTitle>Управление заказами</CardTitle>
        <div className="flex items-center space-x-4 mt-4">
          <span className="font-medium">Статус заказов:</span>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Выберите статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Ожидает обработки</SelectItem>
              <SelectItem value="shipped">Отправлен</SelectItem>
              <SelectItem value="completed">Выполнен</SelectItem>
              <SelectItem value="rejected">Отклонен</SelectItem>
              <SelectItem value="all">Все заказы</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№ заказа</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Клиент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Сумма</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{order.customer_name || "Не указан"}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>
                    {parseFloat(order.total_amount).toLocaleString("ru-RU")} ₽
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        Детали
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusDialog(order)}
                      >
                        Статус
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(order.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  Нет заказов в данной категории
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            Предыдущая
          </Button>
          <span>
            Страница {page} из {totalPages || 1}
          </span>
          <Button
            variant="outline"
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Следующая
          </Button>
        </div>

        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-full laptop:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Заказ #{selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedOrder.created_at)}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Информация о клиенте</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">ФИО:</span>{" "}
                        {selectedOrder.customer_name || "Не указан"}
                      </p>
                      <p>
                        <span className="font-medium">Телефон:</span>{" "}
                        {selectedOrder.customer_phone}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span>{" "}
                        {selectedOrder.customer_email || "Не указан"}
                      </p>
                      <p>
                        <span className="font-medium">Индекс:</span>{" "}
                        {selectedOrder.customer_zip_code || "Не указан"}
                      </p>
                      <p>
                        <span className="font-medium">Адрес:</span>{" "}
                        {selectedOrder.customer_address || "Не указан"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Информация о заказе</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Статус:</span>
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[selectedOrder.status]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[selectedOrder.status]}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Кол-во товаров:</span>{" "}
                        {calculateTotalItems(selectedOrder.items)} шт.
                      </p>
                      <p>
                        <span className="font-medium">Сумма заказа:</span>{" "}
                        {parseFloat(selectedOrder.total_amount).toLocaleString(
                          "ru-RU"
                        )}{" "}
                        ₽
                      </p>
                      {selectedOrder.customer_comment && (
                        <>
                          <p className="font-medium">Комментарий:</p>
                          <p className="bg-secondary p-2 rounded text-sm">
                            {selectedOrder.customer_comment}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-medium mb-2">Товары в заказе</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Товар</TableHead>
                        <TableHead>Цена</TableHead>
                        <TableHead>Кол-во</TableHead>
                        <TableHead>Гравировка</TableHead>
                        <TableHead>Сумма</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items &&
                        selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              {parseFloat(item.price).toLocaleString("ru-RU")} ₽
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.engraving || "Нет"}</TableCell>
                            <TableCell>
                              {parseFloat(
                                item.price * item.quantity
                              ).toLocaleString("ru-RU")}{" "}
                              ₽
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Update Status Dialog */}
        {selectedOrder && (
          <Dialog
            open={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Изменить статус заказа #{selectedOrder.id}
                </DialogTitle>
                <DialogDescription>
                  Выберите новый статус для заказа
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Ожидает обработки</SelectItem>
                    <SelectItem value="shipped">Отправлен</SelectItem>
                    <SelectItem value="completed">Выполнен</SelectItem>
                    <SelectItem value="rejected">Отклонен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsStatusDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(selectedOrder.id, newStatus)
                  }
                >
                  Сохранить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrdersEdit;