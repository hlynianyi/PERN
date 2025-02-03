// frontend/src/components/Breadcrumbs.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ** Импортируем хуки для работы с маршрутизацией
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react"; // ** Импортируем компоненты хлебных крошек из Chakra UI
import { ChevronRightIcon } from "@chakra-ui/icons"; // ** Импортируем иконку разделителя

// ## Маппинг URL-сегментов в отображаемые названия хлебных крошек
const breadcrumbNameMap = {
  admin: "Панель администратора",
  products: "Товары",
  about: "О компании",
  collaboration: "Сотрудничество",
  contacts: "Контакты",
  reviews: "Отзывы",
  payment: "Оплата",
  faq: "Вопрос-ответ",
  edit: "Редактирование",
};

export default function Breadcrumbs() {
  const location = useLocation(); // ** Получаем текущий URL
  const navigate = useNavigate(); // ** Функция для навигации по маршрутам

  // ## Разбиваем текущий путь на сегменты, исключая пустые строки
  const pathnames = location.pathname.split("/").filter((segment) => segment);
  console.log("🚀 ~ Breadcrumbs ~ pathnames:", pathnames);

  // ## Начинаем формирование хлебных крошек с элемента "Главная"
  const crumbs = [
    {
      name: "Главная",
      path: "/",
    },
  ];

  // ## Создаем кумулятивный путь и добавляем соответствующие хлебные крошки
  let cumulativePath = "";
  pathnames.forEach((segment) => {
    cumulativePath += `/${segment}`;
    // ** Если для сегмента есть отображаемое название в маппинге, используем его; иначе делаем первую букву заглавной
    const displayName =
      breadcrumbNameMap[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    crumbs.push({
      name: displayName,
      path: cumulativePath,
    });
  });

  return (
    <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <BreadcrumbItem key={crumb.path} isCurrentPage={isLast}>
            {isLast ? (
              <BreadcrumbLink>{crumb.name}</BreadcrumbLink> // ** Последняя крошка отображается без onClick
            ) : (
              <BreadcrumbLink onClick={() => navigate(crumb.path)}>
                {crumb.name}
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}
