import React from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuList, MenuItem, Button } from "@chakra-ui/react";

export default function AdminMenu() {
  const navigate = useNavigate();

  return (
    <Menu>
      <MenuButton as={Button} colorScheme="blue">
        Панель управления
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => navigate("/admin/products")}>
          Товары
        </MenuItem>
        <MenuItem onClick={() => navigate("/admin/reviews")}>
          Отзывы
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
