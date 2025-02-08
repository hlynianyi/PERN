// src/pages/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const isSuccess = login(credentials.username, credentials.password);

    if (isSuccess) {
      const from = location.state?.from?.pathname || "/admin/products";
      toast({
        title: "Успешная авторизация",
        duration: "800",
      });
      navigate(from, { replace: true });
    } else {
      toast({
        title: "Ошибка авторизации",
        description: "Неверный логин или пароль",
        variant: "destructive",
        duration: "1000",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center">Вход в админ-панель</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              type="text"
              value={credentials.username}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
