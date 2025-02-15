import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLoadCategories } from "@/hooks/useLoadCategories";
import { useLoadProducts } from "@/hooks/useLoadProducts";

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
  partnership: "Сотрудничество",
  delivery: "Доставка",
  warranty: "Гарантия",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const categories = useLoadCategories();
  const { products, isLoading } = useLoadProducts();
  
  const pathnames = location.pathname.split("/").filter((segment) => segment);
  
  const isProductDetailsPage = pathnames.includes("products") && pathnames.includes("details");
  const productId = isProductDetailsPage ? pathnames[pathnames.indexOf("details") + 1] : null;
  const currentProduct = productId && products ? products.find(p => p.id.toString() === productId) : null;

  const crumbs = [
    {
      name: "Главная",
      path: "/",
    },
  ];

  let cumulativePath = "";

  pathnames.forEach((segment) => {
    cumulativePath += `/${segment}`;

    // Skip "details" segment for product detail pages
    if (isProductDetailsPage && segment === "details") {
      return;
    }

    // For product ID, use product name and category
    if (isProductDetailsPage && segment === productId && currentProduct) {
      // Add category
      if (currentProduct.category) {
        crumbs.push({
          name: currentProduct.category,
          path: `/products?category=${encodeURIComponent(currentProduct.category)}`,
          disabled: true,
        });
      }
      // Add product name
      crumbs.push({
        name: currentProduct.name,
        path: cumulativePath,
        disabled: true,
      });
      return;
    }

    // Handle regular segments
    if (!isProductDetailsPage || (segment !== "details" && segment !== productId)) {
      const displayName = breadcrumbNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({
        name: displayName,
        path: cumulativePath,
        disabled: segment !== "products",
      });
    }
  });

  // Add category from search params only if we're not on a product details page
  const category = searchParams.get("category");
  if (category && pathnames.includes("products") && !isProductDetailsPage) {
    crumbs.push({
      name: category,
      path: `${cumulativePath}?category=${encodeURIComponent(category)}`,
      disabled: true,
    });
  }

  return (
    <Breadcrumb className="hidden tablet:block px-0">
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