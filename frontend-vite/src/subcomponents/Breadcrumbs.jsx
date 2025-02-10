// Breadcrumbs.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const breadcrumbNameMap = {
  admin: "Панель администратора",
  create: "Добавление",
  edit: "Редактирование ",
  products: "Товары",
  details: "Просмотр",
  company: "О компании",
  about: "О компании",
  collaboration: "Сотрудничество",
  contacts: "Контакты",
  reviews: "Отзывы",
  payment: "Оплата",
  faq: "Вопрос-ответ",
  login: "Авторизация",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((segment) => segment);

  const crumbs = [
    {
      name: "Главная",
      path: "/",
    },
  ];

  let cumulativePath = "";
  let disableRemainingCrumbs = false;

  pathnames.forEach((segment) => {
    cumulativePath += `/${segment}`;
    const displayName =
      breadcrumbNameMap[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    // Проверяем, если текущий сегмент - "Товары"
    if (displayName === "Товары") {
      disableRemainingCrumbs = true;
    }

    crumbs.push({
      name: displayName,
      path: cumulativePath,
      disabled: disableRemainingCrumbs && displayName !== "Товары",
    });
  });

  return (
    <Breadcrumb className="hidden tablet:block container px-0 ">
      <BreadcrumbList className="text-lg leading-6">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast || crumb.disabled ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={crumb.path}
                    className="cursor-pointer hover:underline"
                  >
                    {crumb.name}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
