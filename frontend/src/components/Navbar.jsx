// frontend/src/components/Navbar.jsx
import React from "react";
import { Box, Flex, HStack, Link, useColorModeValue } from "@chakra-ui/react"; // ** Импортируем необходимые компоненты Chakra UI
import { Link as RouterLink } from "react-router-dom"; // ** Импортируем Link для роутинга из react-router-dom

const Navbar = () => {
  // ## Определяем элементы навбара с названиями и путями (роуты должны совпадать с именами компонентов)
  const navItems = [
    { label: "Каталог", path: "/products" },
    { label: "О компании", path: "/about" },
    { label: "Контакты", path: "/contacts" },
    { label: "Сотрудничество", path: "/collaboration" },
    { label: "Отзывы", path: "/reviews" },
    { label: "Оплата", path: "/payment" },
    { label: "Вопрос-ответ", path: "/faq" },
  ];

  // ## Вызываем хуки useColorModeValue на верхнем уровне компонента, а не внутри callback-функций
  const bgColor = useColorModeValue("gray.100", "gray.900");
  const hoverBg = useColorModeValue("gray.200", "gray.700");

  return (
    <Box bg={bgColor} px={4}>
      <Flex h={12} alignItems="center" justifyContent="center">
        <HStack spacing={4}>
          {navItems.map((item) => (
            <Link
              as={RouterLink}
              to={item.path}
              key={item.label}
              px={2}
              py={2}
              rounded="md"
              fontSize="14"
              fontWeight="400"
              _hover={{
                textDecoration: "none",
                bg: hoverBg, // ** Используем значение hoverBg, полученное на верхнем уровне
              }}
            >
              {item.label}
            </Link>
          ))}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
