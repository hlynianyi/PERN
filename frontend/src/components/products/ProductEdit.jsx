// frontend/src/components/products/ProductEdit.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Image,
  useToast,
  HStack,
  IconButton,
  Text,
  Badge
} from '@chakra-ui/react';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api/products';

const ProductEdit = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await productsApi.getOne(id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
      });
      setCurrentImages(product.images || []);
    } catch (error) {
      toast({
        title: 'Ошибка при загрузке продукта',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = currentImages.length - deletedImageIds.length + selectedFiles.length + files.length;
    
    if (totalImages > 10) {
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
    
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleRemoveCurrentImage = (imageId) => {
    setDeletedImageIds([...deletedImageIds, imageId]);
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productsApi.setPrimaryImage(id, imageId);
      loadProduct(); // Перезагружаем продукт для обновления статусов изображений
      toast({
        title: 'Основное изображение обновлено',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Ошибка при обновлении основного изображения',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      
      if (deletedImageIds.length > 0) {
        formDataToSend.append('deletedImages', JSON.stringify(deletedImageIds));
      }

      selectedFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      await productsApi.update(id, formDataToSend);
      toast({
        title: 'Продукт обновлен',
        status: 'success',
        duration: 3000,
      });
      navigate('/admin/products');
    } catch (error) {
      toast({
        title: 'Ошибка при обновлении продукта',
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

          {currentImages.length > 0 && (
            <Box>
              <Text mb={2}>Текущие изображения:</Text>
              <HStack spacing={4} overflowX="auto" p={2}>
                {currentImages
                  .filter(img => !deletedImageIds.includes(img.id))
                  .map((image) => (
                    <Box key={image.id} position="relative">
                      <Image
                        src={`http://localhost:5002${image.image_url}`}
                        alt="Product"
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
                        onClick={() => handleRemoveCurrentImage(image.id)}
                      />
                      <IconButton
                        icon={<StarIcon />}
                        size="sm"
                        colorScheme={image.is_primary ? 'yellow' : 'gray'}
                        position="absolute"
                        top={1}
                        left={1}
                        onClick={() => handleSetPrimaryImage(image.id)}
                      />
                      {image.is_primary && (
                        <Badge
                          colorScheme="yellow"
                          position="absolute"
                          bottom={1}
                          left="50%"
                          transform="translateX(-50%)"
                        >
                          Основное
                        </Badge>
                      )}
                    </Box>
                  ))}
              </HStack>
            </Box>
          )}

          <FormControl>
            <FormLabel>Добавить новые изображения</FormLabel>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
            />
          </FormControl>

          {previewUrls.length > 0 && (
            <Box>
              <Text mb={2}>Новые изображения:</Text>
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
            Обновить продукт
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ProductEdit;