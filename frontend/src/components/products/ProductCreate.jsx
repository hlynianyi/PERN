// frontend/src/components/products/ProductCreate.jsx
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  Image,
  HStack,
  IconButton,
  Text
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/products';

const ProductCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 10) {
      toast({
        title: 'Ошибка',
        description: 'Можно загрузить максимум 10 изображений',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSelectedFiles([...selectedFiles, ...files]);

    // Создаем превью для новых файлов
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleRemoveFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Освобождаем URL для предотвращения утечек памяти
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);

      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await productsApi.create(formDataToSend);
      toast({
        title: 'Продукт создан',
        status: 'success',
        duration: 3000,
      });
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: 'Ошибка при создании продукта',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Очищаем URL превью при размонтировании компонента
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <Box p={5}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Название</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Описание</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Цена</FormLabel>
            <Input
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Изображения (до 10 штук)</FormLabel>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
          </FormControl>

          {previewUrls.length > 0 && (
            <Box>
              <Text mb={2}>Выбранные изображения:</Text>
              <HStack spacing={4} overflowX="auto" p={2}>
                {previewUrls.map((url, index) => (
                  <Box key={index} position="relative">
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      boxSize="100px"
                      objectFit="cover"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => handleRemoveFile(index)}
                    />
                  </Box>
                ))}
              </HStack>
            </Box>
          )}

          <Button type="submit" colorScheme="blue">
            Создать продукт
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ProductCreate;