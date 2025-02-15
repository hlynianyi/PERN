import React from "react";
import { Separator } from "../ui/separator";
import { useContacts } from "@/hooks/useContacts";
import { Link } from "react-router-dom";
import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { useLoadCategories } from "../../hooks/useLoadCategories";
import { TgIcon, InstIcon, WsAppIcon, VkIcon } from "@/assets/SocialMediaIcons";

const Footer = () => {
  const { data: contactsData, isLoaded: contactsLoaded } = useContacts();
  const categories = useLoadCategories();

  const sitePages = [
    { title: "О компании", path: "/company" },
    { title: "Отзывы", path: "/reviews" },
    { title: "Доставка", path: "/delivery" },
    { title: "Оплата", path: "/payment" },
    { title: "Вопрос-ответ", path: "/faq" },
    { title: "Сотрудничество", path: "/partnership" },
    { title: "Контакты", path: "/contacts" },
  ];

  const SocialLink = ({ href, icon: Icon, children }) => {
    if (!href?.trim()) return null;

    const getFormattedUrl = (type, username) => {
      const cleanUsername = username.replace(/^@/, "").trim();
      switch (type) {
        case "telegram":
          return `https://t.me/${cleanUsername}`;
        case "whatsapp":
          return `https://wa.me/${cleanUsername}`;
        case "instagram":
          return `https://instagram.com/${cleanUsername}`;
        case "vkontakte":
          return `https://vk.com/${cleanUsername}`;
        default:
          return username;
      }
    };

    return (
      <a
        href={getFormattedUrl(children, href)}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-teal-600 transition-colors"
      >
        <Icon className="h-5 w-5" />
      </a>
    );
  };

  return (
    <footer className="px-4 container py-2 tablet:py-4 gap-4 grid grid-cols-2 gap-x-8 gap-y-12 tablet:grid-cols-3 tablet:gap-x-2 laptop:gap-x-8   ">
      <div className="">
        <h3 className="font-exo font-bold text-lg mb-4">
          <Link
            to="/products"
            className="font-exo font-semibold text-lg mb-4 hover:text-primary transition-colors hover:underline"
          >
            Каталог
          </Link>
        </h3>

        <nav className="space-y-2">
          {categories?.map((category) => (
            <Link
              key={category}
              to={`/products?category=${encodeURIComponent(category)}`}
              className="block text-muted-foreground hover:text-primary transition-colors"
            >
              {category}
            </Link>
          ))}
        </nav>
      </div>

      <div>
        <h3 className="font-exo font-bold text-lg mb-4">Клиентам</h3>
        <nav className="space-y-2">
          {sitePages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              className="block text-muted-foreground hover:text-primary transition-colors"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex flex-col">
        <h3 className="font-exo font-bold text-lg mb-4">
          <Link
            to="/contacts"
            className="font-exo font-semibold text-lg mb-4 hover:text-primary transition-colors hover:underline"
          >
            Контакты
          </Link>
        </h3>
        {contactsLoaded && contactsData && (
          <div className="space-y-4 text-sm">
            {contactsData.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <p>
                  {contactsData.city && `${contactsData.city}, `}
                  {contactsData.address}
                </p>
              </div>
            )}
            {contactsData.work_days && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 mt-1" />
                <div>
                  <p>{contactsData.work_days}</p>
                  {contactsData.work_hours && <p>{contactsData.work_hours}</p>}
                </div>
              </div>
            )}
            {contactsData.phones?.length > 0 && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 mt-1" />
                <div>
                  {contactsData.phones.map((phone, index) => (
                    <a
                      key={index}
                      href={`tel:${phone.replace(/\D/g, "")}`}
                      className="block hover:text-primary transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {contactsData.email && (
              <a
                href={`mailto:${contactsData.email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>{contactsData.email}</span>
              </a>
            )}

            <div className="flex gap-4 mt-2">
              <SocialLink href={contactsData.telegram} icon={TgIcon}>
                telegram
              </SocialLink>
              <SocialLink href={contactsData.whatsapp} icon={WsAppIcon}>
                whatsapp
              </SocialLink>
              <SocialLink href={contactsData.instagram} icon={InstIcon}>
                instagram
              </SocialLink>
              <SocialLink href={contactsData.vkontakte} icon={VkIcon}>
                vkontakte
              </SocialLink>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
