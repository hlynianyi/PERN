// ProductList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { productsApi } from "../../api/products";
import { toast } from "sonner";

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      toast.error("Ошибка при загрузке продуктов", {
        richColors: true,
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      loadProducts();
      toast.success("Продукт удален", {
        richColors: true,
        duration: 3000,
      });
    } catch (error) {
      toast.error("Ошибка при удалении продукта", {
        richColors: true,
        duration: 3000,
      });
    }
  };

  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const primaryImage = product.images.find((img) => img.is_primary);
    return primaryImage || product.images[0];
  };

  return (
    <div className="p-0">
      <div className="flex justify-end p-4">
        <Button
          className="dark:text-secondary-foreground"
          onClick={() => navigate("/admin/products/create")}
        >
          Добавить продукт
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Изображение</TableHead>
            <TableHead>Название</TableHead>
            <TableHead>Категория</TableHead>
            <TableHead>Цена</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const productImage = getProductImage(product);

            return (
              <TableRow key={product.id}>
                <TableCell>
                  {productImage && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        productImage.image_url
                      }`}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <p>{product.name}</p>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price} руб.</TableCell>
                <TableCell>
                  <div className="h-full flex flex-col gap-2">
                    {product.status === "in_stock" ? (
                      <Badge className="flex justify-center dark:text-secondary-foreground">
                        В наличии
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="flex justify-center"
                      >
                        Нет в наличии
                      </Badge>
                    )}
                    {product.is_new && (
                      <Badge className="flex justify-center " variant="success">
                        Новинка
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/products/details/${product.id}`)
                      }
                    >
                      Просмотр
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(`/admin/products/edit/${product.id}`)
                      }
                    >
                      Редактировать
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminProductList;
