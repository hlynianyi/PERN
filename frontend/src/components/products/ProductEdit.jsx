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
  NumberDecrementStepper,
  Badge
} from '@chakra-ui/react';
import { DeleteIcon, StarIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi, PRODUCT_STATUSES } from '../../api/products';

const ProductEdit = () => {
  const { id } = useParams();
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

  const [currentImages, setCurrentImages] = useState([]);
  const [currentCertificates, setCurrentCertificates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({
    images: [],
    certificates: []
  });
  const [previewUrls, setPreviewUrls] = useState({
    images: [],
    certificates: []
  });
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [deletedCertificateIds, setDeletedCertificateIds] = useState([]);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const product = await productsApi.getOne(id);
      console.log('Loaded product:', product);
      setFormData({
        name: product.name,
        category: product.category,
        description: product.description,
        price: product.price,
        steel: product.steel || '',
        handle: product.handle || '',
        length: product.length || '',
        status: product.status
      });
      setCurrentImages(product.images || []);
      setCurrentCertificates(product.certificates || []);
    } catch (error) {
      toast({
        title: 'Ошибка при загрузке продукта',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleFileSelect = (type, e) => {
    const files = Array.from(e.target.files);
    const currentFiles = type === 'images' ? currentImages : currentCertificates;
    const maxFiles = type === 'images' ? 10 : 5;
    const deletedIds = type === 'images' ? deletedImageIds : deletedCertificateIds;
    
    if (currentFiles.length - deletedIds.length + selectedFiles[type].length + files.length > maxFiles) {
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

  const handleRemoveCurrentFile = (type, fileId) => {
    if (type === 'images') {
      setDeletedImageIds(prev => [...prev, fileId]);
    } else {
      setDeletedCertificateIds(prev => [...prev, fileId]);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    try {
      await productsApi.setPrimaryImage(id, imageId);
      loadProduct();
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

  // frontend/src/components/products/ProductEdit.jsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Создаем объект с данными вместо FormData
      const updateData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: formData.price,
        status: formData.status,
        steel: formData.steel || '',
        handle: formData.handle || '',
        length: formData.length || '',
        deletedImages: deletedImageIds,
        deletedCertificates: deletedCertificateIds,
        images: selectedFiles.images,
        certificates: selectedFiles.certificates
      };
  
      console.log('Sending update data:', updateData);
      await productsApi.update(id, updateData);
      
      toast({
        title: 'Продукт обновлен',
        status: 'success',
        duration: 3000,
      });
      navigate('/admin/products');
    } catch (error) {
      console.error('Error updating product:', error);
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

          {/* Текущие изображения */}
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
                        onClick={() => handleRemoveCurrentFile('images', image.id)}
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

          {/* Текущие сертификаты */}
          {currentCertificates.length > 0 && (
            <Box>
              <Text mb={2}>Текущие сертификаты:</Text>
              <HStack spacing={4} overflowX="auto" p={2}>
                {currentCertificates
                  .filter(cert => !deletedCertificateIds.includes(cert.id))
                  .map((cert) => (
                    <Box key={cert.id} position="relative">
                      <Box
                        border="1px solid"
                        borderColor="gray.200"
                        p={2}
                        borderRadius="md"
                      >
                        <Text>Сертификат {cert.id}</Text>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => window.open(`http://localhost:5002${cert.certificate_url}`, '_blank')}
                        >
                          Просмотр
                        </Button>
                      </Box>
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        position="absolute"
                        top={1}
                        right={1}
                        onClick={() => handleRemoveCurrentFile('certificates', cert.id)}
                      />
                    </Box>
                  ))}
              </HStack>
            </Box>
          )}

          {/* Загрузка новых изображений */}
          <FormControl>
            <FormLabel>Добавить изображения (до 10 штук)</FormLabel>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileSelect('images', e)}
            />
          </FormControl>

          {previewUrls.images.length > 0 && (
            <Box>
              <Text mb={2}>Новые изображения:</Text>
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

          {/* Загрузка новых сертификатов */}
          <FormControl>
            <FormLabel>Добавить сертификаты (до 5 штук)</FormLabel>
            <Input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => handleFileSelect('certificates', e)}
            />
          </FormControl>

          {previewUrls.certificates.length > 0 && (
            <Box>
              <Text mb={2}>Новые сертификаты:</Text>
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
            Обновить продукт
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default ProductEdit;