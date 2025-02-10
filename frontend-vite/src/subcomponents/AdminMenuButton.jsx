// admin-menu-button.jsx
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";

export default function AdminMenuButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Add logout button to your existing menu
  const handleLogout = () => {
    logout();
    // Redirect to home or login page
  };

  return (
    <div className="px-4 pt-4 w-full flex gap-2 justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="">
            Управление категориями
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => navigate("/admin/products")}>
            Товары
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/company/edit")}>
            О компании
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/contacts/edit")}>
            Контакты
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/partnership/edit")}>
            Сотрудничество
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/reviews/edit")}>
            Отзывы
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/payment/edit")}>
            Оплата
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/admin/faq/edit")}>
            Вопрос-ответ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button onClick={handleLogout} variant="destructive">
        Выйти
      </Button>
    </div>
  );
}
