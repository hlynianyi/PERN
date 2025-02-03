import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useToast,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  Table,
  Tbody,
  Tr,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { StarIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { productsApi, PRODUCT_STATUSES } from "../../api/products";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    user_name: "",
    rating: 5,
    comment: "",
  });
  const [editingReview, setEditingReview] = useState(null);

  const toast = useToast();
  const {
    isOpen: isNewReviewOpen,
    onOpen: onNewReviewOpen,
    onClose: onNewReviewClose,
  } = useDisclosure();
  const {
    isOpen: isEditReviewOpen,
    onOpen: onEditReviewOpen,
    onClose: onEditReviewClose,
  } = useDisclosure();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productsApi.getOne(id);
      setProduct(data);
      const primaryImage =
        data.images?.find((img) => img.is_primary) || data.images?.[0];
      setSelectedImage(primaryImage);
    } catch (error) {
      toast({
        title: "Ошибка при загрузке продукта",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const getMainStats = () => {
    if (!product) return [];

    let stats = [
      {
        label: "Категория",
        value: product.category,
      },
    ];

    if (product.steel) {
      stats.push({
        label: "Сталь",
        value: product.steel,
      });
    }
    if (product.handle) {
      stats.push({
        label: "Рукоять",
        value: product.handle,
      });
    }
    if (product.length) {
      stats.push({
        label: "Длина",
        value: `${product.length} мм.`,
      });
    }

    if (product.average_rating) {
      stats.push({
        label: "Средняя оценка",
        value: `${parseFloat(product.average_rating).toFixed(1)} из 5`,
      });
    }

    return stats;
  };

  const handleEditReviewClick = (review) => {
    setEditingReview(review);
    setReviewForm({
      user_name: review.user_name,
      rating: review.rating,
      comment: review.comment,
    });
    onEditReviewOpen();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        await productsApi.updateReview(editingReview.id, reviewForm);
        onEditReviewClose();
      } else {
        await productsApi.addReview(id, reviewForm);
        onNewReviewClose();
      }
      setReviewForm({ user_name: "", rating: 5, comment: "" });
      setEditingReview(null);
      loadProduct();
      toast({
        title: editingReview ? "Отзыв обновлен" : "Отзыв добавлен",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await productsApi.deleteReview(reviewId);
      loadProduct();
      toast({
        title: "Отзыв удален",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Ошибка при удалении отзыва",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleModalClose = () => {
    setReviewForm({ user_name: "", rating: 5, comment: "" });
    setEditingReview(null);
    onNewReviewClose();
    onEditReviewClose();
  };

  if (!product) {
    return <Box p={5}>Загрузка...</Box>;
  }

  return (
    <Box p={5}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
        <GridItem>
          <VStack spacing={4} align="stretch">
            {selectedImage && (
              <Image
                src={`http://localhost:5002${selectedImage.image_url}`}
                alt={product.name}
                objectFit="cover"
                borderRadius="md"
                width="100%"
                height="400px"
              />
            )}
            <SimpleGrid columns={4} spacing={2}>
              {product.images?.map((image) => (
                <Image
                  key={image.id}
                  src={`http://localhost:5002${image.image_url}`}
                  alt={product.name}
                  cursor="pointer"
                  opacity={selectedImage?.id === image.id ? 1 : 0.6}
                  onClick={() => setSelectedImage(image)}
                  borderRadius="md"
                  height="100px"
                  objectFit="cover"
                />
              ))}
            </SimpleGrid>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between" wrap="wrap">
              <Heading size="lg">{product.name}</Heading>
              <HStack>
                {product.is_new && (
                  <Badge colorScheme="green" fontSize="md">
                    Новинка
                  </Badge>
                )}
                <Badge
                  colorScheme={product.status === "in_stock" ? "green" : "red"}
                  fontSize="md"
                >
                  {PRODUCT_STATUSES[product.status]}
                </Badge>
              </HStack>
            </HStack>

            <Text fontSize="2xl" fontWeight="bold">
              {parseFloat(product.price).toLocaleString("ru-RU")} ₽
            </Text>

            <Divider />

            <Table variant="simple">
              <Tbody>
                {getMainStats().map((stat, index) => (
                  <Tr key={index}>
                    <Td fontWeight="bold" width="40%">
                      {stat.label}
                    </Td>
                    <Td>{stat.value}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Box>
              <Heading size="md" mb={2}>
                Описание
              </Heading>
              <Text whiteSpace="pre-wrap">{product.description}</Text>
            </Box>

            {product.certificates?.length > 0 && (
              <Box>
                <Heading size="md" mb={2}>
                  Сертификаты
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  {product.certificates.map((cert, index) => (
                    <Button
                      key={cert.id}
                      onClick={() =>
                        window.open(
                          `http://localhost:5002${cert.certificate_url}`,
                          "_blank"
                        )
                      }
                      colorScheme="blue"
                      variant="outline"
                      leftIcon={<i className="fas fa-file-certificate" />}
                    >
                      Сертификат {index + 1}
                    </Button>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </VStack>
        </GridItem>
      </Grid>

      <Box mt={8}>
        <HStack justify="space-between" mb={4}>
          <VStack align="start" spacing={1}>
            <Heading size="md">Отзывы ({product.reviews?.length || 0})</Heading>
            {product.average_rating > 0 && (
              <HStack>
                {[...Array(5)].map((_, index) => (
                  <StarIcon
                    key={index}
                    color={
                      index < Math.round(product.average_rating)
                        ? "yellow.400"
                        : "gray.300"
                    }
                  />
                ))}
                <Text ml={2} color="gray.600">
                  {parseFloat(product.average_rating).toFixed(1)} из 5
                </Text>
              </HStack>
            )}
          </VStack>
          <Button colorScheme="blue" onClick={onNewReviewOpen}>
            Оставить отзыв
          </Button>
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {product.reviews?.map((review) => (
            <Card key={review.id}>
              <CardBody>
                <Stack spacing={3}>
                  <HStack justify="space-between">
                    <Heading size="sm">{review.user_name}</Heading>
                    <HStack>
                      <IconButton
                        icon={<EditIcon />}
                        colorScheme="blue"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditReviewClick(review)}
                        aria-label="Редактировать отзыв"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReviewDelete(review.id)}
                        aria-label="Удалить отзыв"
                      />
                    </HStack>
                  </HStack>
                  <HStack>
                    {[...Array(5)].map((_, index) => (
                      <StarIcon
                        key={index}
                        color={
                          index < review.rating ? "yellow.400" : "gray.300"
                        }
                      />
                    ))}
                  </HStack>
                  <Text>{review.comment}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {format(new Date(review.created_at), "dd MMMM yyyy", {
                      locale: ru,
                    })}
                  </Text>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>

      {/* Модальное окно для нового отзыва */}
      <Modal isOpen={isNewReviewOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Оставить отзыв</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleReviewSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Ваше имя</FormLabel>
                  <Input
                    value={reviewForm.user_name}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        user_name: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Оценка</FormLabel>
                  <NumberInput
                    min={1}
                    max={5}
                    value={reviewForm.rating}
                    onChange={(value) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: parseInt(value),
                      }))
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Комментарий</FormLabel>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <Button type="submit" colorScheme="blue" width="100%">
                  Отправить
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Модальное окно для редактирования отзыва */}
      <Modal isOpen={isEditReviewOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Редактировать отзыв пользователя</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleReviewSubmit}>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Имя пользователя</FormLabel>
                  <Heading size="md">{reviewForm.user_name}</Heading>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Оценка</FormLabel>
                  <NumberInput
                    min={1}
                    max={5}
                    value={reviewForm.rating}
                    onChange={(value) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        rating: parseInt(value),
                      }))
                    }
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Комментарий</FormLabel>
                  <Textarea
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <Button type="submit" colorScheme="blue" width="100%">
                  Сохранить изменения
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductDetails;
