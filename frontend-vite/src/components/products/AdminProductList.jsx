// ProductList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

const AdminProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Ошибка при загрузке продуктов",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await productsApi.delete(id);
      loadProducts();
      toast({
        title: "Продукт удален",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении продукта",
        variant: "destructive",
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
        <Button onClick={() => navigate("/admin/products/create")}>
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
                      src={`http://localhost:5002${productImage.image_url}`}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <p>{product.name}</p>
                  {product.is_new && (
                    <Badge variant="success" className="mt-2">
                      Новинка
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price} руб.</TableCell>
                <TableCell>
                  {product.status === "in_stock" ? (
                    <Badge>В наличии</Badge>
                  ) : (
                    <Badge variant="secondary">Нет в наличии</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigate(`/admin/products/details/${product.id}`)
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
