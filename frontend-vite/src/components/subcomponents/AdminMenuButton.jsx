// admin-menu-button.jsx
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "./Breadcrumbs";

export default function AdminMenuButton() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 flex justify-between items-center">
      <Breadcrumbs />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary">Управление категориями</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigate("/admin/products")}>
            Товары
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/company/edit")}>
            О компании
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/")}>
            Контакты
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/")}>
            Сотрудничество
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/reviews")}>
            Отзывы
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/")}>
            Оплата
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/")}>
            Вопрос-ответ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
