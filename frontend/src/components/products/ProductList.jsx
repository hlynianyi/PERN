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
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { productsApi } from "../../api/products";
import AdminMenu from "../AdminMenu";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Error loading products",
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
        title: "Product deleted",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error deleting product",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Функция для получения изображения продукта
  const getProductImage = (product) => {
    if (!product.images || product.images.length === 0) return null;
    
    // Ищем основное изображение
    const primaryImage = product.images.find(img => img.is_primary);
    
    // Возвращаем основное изображение или первое из массива
    return primaryImage || product.images[0];
  };

  return (
    <Box p={5}>
      <Flex justifyContent="space-between" mb={5}>
        <Button
          colorScheme="blue"
          onClick={() => navigate("/admin/products/create")}
        >
          Добавить товар
        </Button>
        <AdminMenu colorScheme="yellow"></AdminMenu>
      </Flex>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Image</Th>
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Price</Th>
            <Th>Actions</Th>
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
                <Td>{product.name}</Td>
                <Td>{product.description}</Td>
                <Td>${product.price}</Td>
                <Td>
                  <Button
                    colorScheme="yellow"
                    mr={2}
                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
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