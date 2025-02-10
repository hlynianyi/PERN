import * as React from "react";
import { NavigationMenu } from "radix-ui";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { useLoadCategories } from "../../hooks/useLoadCategories";

const Navbar = () => {
  const categories = useLoadCategories();

  return (
    <NavigationMenu.Root className=" relative z-10 flex w-full">
      <div className="flex justify-center w-full">
        <NavigationMenu.List className="center m-0 flex list-none rounded-md  p-1 shadow-md dark:shadow-gray-800">
          <NavigationMenu.Item>
            <NavigationMenu.Link
              className="block select-none rounded px-2 tablet:px-4 py-2 text-[18px] font-medium
              leading-none text-slate-800 dark:text-white no-underline outline-none 
              hover:bg-slate-50 dark:hover:bg-slate-800 
              focus:shadow-[0_0_0_2px] focus:shadow-slate-200 dark:focus:shadow-slate-700
              transition-colors"
              href="/"
            >
              Главная
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger
              className="group flex select-none items-center justify-between gap-0.5 rounded 
              px-2 tablet:px-4 py-2 text-[18px] font-medium leading-none 
              text-slate-800 dark:text-white outline-none 
              hover:bg-slate-100 dark:hover:bg-slate-800 
              focus:shadow-[0_0_0_2px] focus:shadow-slate-200 dark:focus:shadow-slate-700
              transition-colors"
            >
              Каталог{" "}
              <CaretDownIcon
                className="relative top-px text-slate-600 dark:text-slate-400 
                transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
                aria-hidden
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className="absolute left-0 top-0 w-full 
              bg-white dark:bg-slate-300
              shadow-lg dark:shadow-slate-800
              data-[motion=from-end]:animate-enterFromRight 
              data-[motion=from-start]:animate-enterFromLeft 
              data-[motion=to-end]:animate-exitToRight 
              data-[motion=to-start]:animate-exitToLeft 
              sm:w-auto"
            >
              <ul className="one m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[500px] sm:grid-cols-[0.75fr_1fr]">
                <ListItem title="Все товары" href={`/products`}>
                  Каталог товаров без определенной категории
                </ListItem>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <ListItem
                      key={category}
                      title={category}
                      href={`/products?category=${encodeURIComponent(
                        category
                      )}`}
                    >
                      Смотреть товары в категории "{category}"
                    </ListItem>
                  ))
                ) : (
                  <ListItem title="Товары отсутствуют" href={`/`}>
                    Необходимо добавить товары для корректного отображения и
                    фильтрации
                  </ListItem>
                )}
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger
              className="group flex select-none items-center justify-between gap-0.5 rounded 
              px-2 tablet:px-4 py-2 text-[18px] font-medium leading-none 
              text-slate-800 dark:text-slate-100 outline-none 
              hover:bg-slate-100 dark:hover:bg-slate-800 
              focus:shadow-[0_0_0_2px] focus:shadow-slate-200 dark:focus:shadow-slate-700
              transition-colors"
            >
              Информация{" "}
              <CaretDownIcon
                className="relative top-px text-slate-600 dark:text-slate-400 
                transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
                aria-hidden
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className="absolute left-0 top-0 w-full 
              bg-white dark:bg-slate-300
              shadow-lg dark:shadow-slate-800
              sm:w-auto"
            >
              <ul className="m-0 grid list-none gap-x-2.5 p-[22px] sm:w-[600px] sm:grid-flow-col sm:grid-rows-3">
                <ListItem title="О компании" href="/company">
                  Познакомьтесь с нашим производством
                </ListItem>
                <ListItem title="Контакты" href="/contacts">
                  Данные для связи с нами
                </ListItem>
                <ListItem title="Сотрудничество" href="/partnership">
                  Для оптовых заказов или бизнес-предложений
                </ListItem>
                <ListItem title="Оплата" href="/payment">
                  О процессе и вариантах оплаты
                </ListItem>
                <ListItem title="Доставка" href="/delivery">
                  Условия доставки товаров
                </ListItem>
                <ListItem title="Вопрос-ответ" href="/faq">
                  Часто задаваемые вопросы
                </ListItem>
                <ListItem
                  title="Отзывы"
                  href="/reviews"
                  className="tablet:hidden"
                >
                  Что о нас думают наши клиенты
                </ListItem>
              </ul>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Link
              className="hidden tablet:block select-none rounded px-2 tablet:px-4 py-2 text-[18px] font-medium
              leading-none text-slate-800 dark:text-slate-100 no-underline outline-none 
              hover:bg-slate-100 dark:hover:bg-slate-800 
              focus:shadow-[0_0_0_2px] focus:shadow-slate-200 dark:focus:shadow-slate-700
              transition-colors"
              href="/reviews"
            >
              Отзывы
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Indicator
            className="top-full z-10 flex h-2.5 items-end justify-center overflow-hidden 
            transition-[width,transform_250ms_ease] 
            data-[state=hidden]:animate-fadeOut 
            data-[state=visible]:animate-fadeIn"
          >
            <div
              className="relative top-[70%] size-2.5 rotate-45 rounded-tl-sm 
              bg-white dark:bg-slate-300"
            />
          </NavigationMenu.Indicator>
        </NavigationMenu.List>

        <div className="perspective-[2000px] absolute left-0 top-full flex w-full justify-center">
          <NavigationMenu.Viewport
            className="relative mt-2.5 
            h-[var(--radix-navigation-menu-viewport-height)] 
            w-full origin-[top_center] overflow-hidden rounded-md 
            bg-white dark:bg-slate-300
            shadow-lg dark:shadow-slate-800
            transition-[width,_height] duration-300 
            data-[state=closed]:animate-scaleOut 
            data-[state=open]:animate-scaleIn 
            sm:w-[var(--radix-navigation-menu-viewport-width)]"
          />
        </div>
      </div>
    </NavigationMenu.Root>
  );
};

const ListItem = React.forwardRef(
  ({ className, children, title, ...props }, forwardedRef) => (
    <li>
      <NavigationMenu.Link asChild>
        <a
          className={classNames(
            "block select-none rounded-md p-3 text-[18px] leading-none no-underline outline-none transition-colors hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-violet7",
            className
          )}
          {...props}
          ref={forwardedRef}
        >
          <div className="mb-[5px] font-medium leading-[1.2] text-violet12">
            {title}
          </div>
          <p className="leading-[1.4] text-mauve11">{children}</p>
        </a>
      </NavigationMenu.Link>
    </li>
  )
);

export default Navbar;
