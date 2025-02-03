// frontend/src/components/products/ProductList.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Image,
  Flex,
  useToast,
  Badge,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../../api/products";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadProducts();
    console.log(products);
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Ошибка при загрузке продуктов",
        status: "error",
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
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении продукта",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Функция для получения изображения продукта
  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    const primaryImage = product.images.find((img) => img.is_primary);
    return primaryImage || product.images[0];
  };

  return (
    <Box p={0}>
      <Flex justifyContent="flex-end" p="4">
        <Button
          colorScheme="blue"
          onClick={() => navigate("/admin/products/create")}
        >
          Добавить продукт
        </Button>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Изображение</Th>
            <Th>Название</Th>
            <Th>Категория</Th>
            <Th>Цена</Th>
            <Th>Статус</Th>
            <Th>Действия</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => {
            const productImage = getProductImage(product);

            return (
              <Tr key={product.id}>
                <Td>
                  {productImage && (
                    <Image
                      src={`http://localhost:5002${productImage.image_url}`}
                      alt={product.name}
                      boxSize="50px"
                      objectFit="cover"
                    />
                  )}
                </Td>
                <Td>
                  <Text>{product.name}</Text>
                  {product.is_new && (
                    <Badge colorScheme="green" mt="2">
                      Новинка
                    </Badge>
                  )}
                </Td>
                <Td>{product.category}</Td>
                <Td>{product.price} руб.</Td>
                <Td>
                  {product.status === "in_stock"
                    ? "В наличии"
                    : "Нет в наличии"}
                </Td>
                <Td>
                  <Flex flexDirection="column" gap="1">
                    <Button
                      colorScheme="teal"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      Просмотр
                    </Button>
                    <Button
                      colorScheme="yellow"
                      onClick={() =>
                        navigate(`/admin/products/edit/${product.id}`)
                      }
                    >
                      Редактировать
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => handleDelete(product.id)}
                    >
                      Удалить
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProductList;
