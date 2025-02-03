import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
} from "@chakra-ui/react";
import Breadcrumbs from "./breadcrumps";

export default function AdminMenu() {
  const navigate = useNavigate();

  return (
    <Flex px="4" pt="4" justifyContent="space-between">
      <Breadcrumbs />

      <Menu variant="solid">
        <MenuButton as={Button} colorScheme="gray">
          Управление категориями
        </MenuButton>
        <MenuList>
          <MenuItem onClick={() => navigate("/admin/products")}>
            Товары
          </MenuItem>
          <MenuItem onClick={() => navigate("/admin/")}>О компании</MenuItem>
          <MenuItem onClick={() => navigate("/admin/")}>Контакты</MenuItem>
          <MenuItem onClick={() => navigate("/admin/")}>
            Сотрудничество
          </MenuItem>
          <MenuItem onClick={() => navigate("/admin/reviews")}>Отзывы</MenuItem>
          <MenuItem onClick={() => navigate("/admin/")}>Оплата</MenuItem>
          <MenuItem onClick={() => navigate("/admin/")}>Вопрос-ответ</MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
}
