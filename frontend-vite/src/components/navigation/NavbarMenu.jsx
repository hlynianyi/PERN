import * as React from "react";
import { NavigationMenu } from "radix-ui";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { useLoadCategories } from "../../hooks/useLoadCategories";

const Navbar = () => {
  const categories = useLoadCategories();

  return (
    <NavigationMenu.Root className="relative z-10 flex w-full ">
      <div className="flex justify-center w-full">
        <NavigationMenu.List
          className="mobile:h-10 center m-0 flex list-none rounded-md p-1 
          bg-background text-foreground
          shadow-md dark:shadow-primary/25"
        >
          <NavigationMenu.Item>
            <NavigationMenu.Link
              className="block select-none rounded px-[6px] tablet:px-[12px] py-2 text-[15px] tablet:text-[16px] 
              font-medium font-exo leading-none text-foreground no-underline outline-none 
              hover:bg-accent hover:text-accent-foreground 
              focus:ring-2 focus:ring-ring focus:outline-none
              transition-colors"
              href="/"
            >
              Главная
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item>
            <NavigationMenu.Trigger
              className="group flex select-none items-center justify-between gap-0.5 rounded 
              px-[6px] tablet:px-[12px] py-2 text-[15px] tablet:text-[16px] font-medium font-exo leading-none 
              text-foreground outline-none 
              hover:bg-accent hover:text-accent-foreground
              focus:ring-2 focus:ring-ring focus:outline-none
              transition-colors"
            >
              Каталог{" "}
              <CaretDownIcon
                className="relative top-px text-muted-foreground
                transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
                aria-hidden
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className="absolute left-0 top-0 w-full 
              bg-popover text-popover-foreground
              border-2 rounded-lg
              shadow-lg shadow-primary/10
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
              px-[6px] tablet:px-[12px] py-2 text-[15px] tablet:text-[16px] font-medium font-exo leading-none 
              text-foreground outline-none 
              hover:bg-accent hover:text-accent-foreground
              focus:ring-2 focus:ring-ring focus:outline-none
              transition-colors"
            >
              Информация{" "}
              <CaretDownIcon
                className="relative top-px text-muted-foreground
                transition-transform duration-[250] ease-in group-data-[state=open]:-rotate-180"
                aria-hidden
              />
            </NavigationMenu.Trigger>
            <NavigationMenu.Content
              className="absolute left-0 top-0 w-full 
              bg-popover text-popover-foreground
              border-2 rounded-lg
              shadow-lg shadow-primary/10
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
              className="hidden tablet:block select-none rounded px-[6px] tablet:px-[12px] py-2 text-[15px] tablet:text-[16px] 
              font-medium font-exo leading-none text-foreground no-underline outline-none 
              hover:bg-accent hover:text-accent-foreground
              focus:ring-2 focus:ring-ring focus:outline-none
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
              bg-popover"
            />
          </NavigationMenu.Indicator>
        </NavigationMenu.List>

        <div className="perspective-[2000px] absolute left-0 top-full flex w-full justify-center">
          <NavigationMenu.Viewport
            className="relative mt-2.5 
            h-[var(--radix-navigation-menu-viewport-height)] 
            w-full origin-[top_center] overflow-hidden rounded-md 
            bg-popover text-popover-foreground
            shadow-lg shadow-primary/10
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
            "block select-none rounded-md p-3 text-[15px] tablet:text-[16px] font-exo leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:outline-none",
            className
          )}
          {...props}
          ref={forwardedRef}
        >
          <div className="mb-[5px] font-pt-serif font-medium text-primary leading-[1.2]">
            {title}
          </div>
          <p className="leading-[1.4] text-muted-foreground">{children}</p>
        </a>
      </NavigationMenu.Link>
    </li>
  )
);

export default Navbar;
