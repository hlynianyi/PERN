// frontend/src/components/products/ProductCreate.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  Image,
  useToast,
  IconButton,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { productsApi, PRODUCT_STATUSES } from '../../api/products';

const ProductCreate = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    steel: '',
    handle: '',
    length: '',
    status: 'in_stock'
  });

  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    certificates: []
  });

  const [previewUrls, setPreviewUrls] = useState({
    images: [],
    certificates: []
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleFileSelect = (type, e) => {
    const files = Array.from(e.target.files);
    const maxFiles = type === 'images' ? 10 : 5;
    
    if (files.length + selectedFiles[type].length > maxFiles) {
      toast({
        title: 'Ошибка',
        description: `Можно загрузить максимум ${maxFiles} ${type === 'images' ? 'изображений' : 'сертификатов'}`,
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...files]
    }));

    // Создаем превью для новых файлов
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => ({
      ...prev,
      [type]: [...prev[type], ...newPreviewUrls]
    }));
  };

  const handleRemoveFile = (type, index) => {
    setSelectedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));

    URL.revokeObjectURL(previewUrls[type][index]);
    setPreviewUrls(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        images: selectedFiles.images,
        certificates: selectedFiles.certificates
      };

      await productsApi.create(dataToSend);
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
      [...previewUrls.images, ...previewUrls.certificates].forEach(url => URL.revokeObjectURL(url));
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

          <FormControl isRequired>
            <FormLabel>Категория</FormLabel>
            <Input
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="Введите категорию"
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
            <NumberInput
              min={0}
              value={formData.price}
              onChange={(valueString) => setFormData(prev => ({ ...prev, price: valueString }))}
            >
              <NumberInputField name="price" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Сталь</FormLabel>
            <Input
              name="steel"
              value={formData.steel}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Рукоять</FormLabel>
            <Input
              name="handle"
              value={formData.handle}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Длина (см)</FormLabel>
            <NumberInput
              min={0}
              value={formData.length}
              onChange={(valueString) => setFormData(prev => ({ ...prev, length: valueString }))}
            >
              <NumberInputField name="length" />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </FormControl>

          <FormControl>
            <FormLabel>Статус</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              {Object.entries(PRODUCT_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Изображения (до 10 штук)</FormLabel>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect('images', e)}
            />
          </FormControl>

          {previewUrls.images.length > 0 && (
            <Box>
              <Text mb={2}>Выбранные изображения:</Text>
              <HStack spacing={4} overflowX="auto" p={2}>
                {previewUrls.images.map((url, index) => (
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
                      onClick={() => handleRemoveFile('images', index)}
                    />
                  </Box>
                ))}
              </HStack>
            </Box>
          )}

          <FormControl>
            <FormLabel>Сертификаты (до 5 штук)</FormLabel>
            <Input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => handleFileSelect('certificates', e)}
            />
          </FormControl>

          {previewUrls.certificates.length > 0 && (
            <Box>
              <Text mb={2}>Выбранные сертификаты:</Text>
              <HStack spacing={4} overflowX="auto" p={2}>
                {previewUrls.certificates.map((url, index) => (
                  <Box key={index} position="relative">
                    <Box
                      border="1px solid"
                      borderColor="gray.200"
                      p={2}
                      borderRadius="md"
                    >
                      <Text>{selectedFiles.certificates[index].name}</Text>
                    </Box>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      position="absolute"
                      top={1}
                      right={1}
                      onClick={() => handleRemoveFile('certificates', index)}
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