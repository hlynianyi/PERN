import { useContacts } from "@/hooks/useContacts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Phone,
  Mail,
  Clock,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { TgIcon, InstIcon, WsAppIcon, VkIcon } from "@/assets/SocialMediaIcons";

const SocialLink = ({ href, icon: Icon, children }) => {
  if (!href?.trim()) return null;

  const getFormattedUrl = (type, username) => {
    const cleanUsername = username.replace(/^@/, "").trim();

    switch (type.toLowerCase()) {
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
      className="flex items-center gap-2 hover:text-teal-600 transition-colors"
    >
      <Icon className="h-5 w-5" />
      <span>{children}</span>
    </a>
  );
};

const ContactBlock = ({ icon: Icon, title, children }) => {
  if (!children) return null;

  return (
    <div className="flex items-start gap-3">
      <Icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        {children}
      </div>
    </div>
  );
};

const Contacts = () => {
  const contacts = useContacts();
  const contactsData = contacts?.data;

  if (!contactsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (contactsData.error) {
    return (
      <div className=" max-w-3xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>{contactsData.error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasAddress =
    contactsData?.city?.trim() || contactsData?.address?.trim();
  const hasPhones = contactsData?.phones?.length > 0;
  const hasEmail = contactsData?.email?.trim();
  const hasWorkSchedule =
    contactsData?.work_days?.trim() || contactsData?.work_hours?.trim();
  const hasDescription = contactsData?.description?.trim();

  const hasSocialLinks = [
    contactsData?.telegram?.trim(),
    contactsData?.whatsapp?.trim(),
    contactsData?.instagram?.trim(),
    contactsData?.vkontakte?.trim(),
  ].some(Boolean);

  return (
    <div className="mx-auto px-4 py-4 tablet:py-8">
      <div className="text-center mb-6 tablet:mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Контакты</h1>
        <div className="h-1 w-20 bg-primary mx-auto"></div>
      </div>

      <div className="mb-4 pb-4 grid grid-cols-1 laptop:grid-cols-2 gap-8">
        {/* Основная информация */}
        <div className="space-y-6">
          {hasAddress && (
            <ContactBlock icon={MapPin} title="Адрес">
              <p>
                {[contactsData.city, contactsData.address]
                  .filter(Boolean)
                  .map((item) => item.trim())
                  .join(", ")}
              </p>
            </ContactBlock>
          )}

          {hasPhones && (
            <ContactBlock icon={Phone} title="Телефоны">
              <div className="space-y-1">
                {contactsData.phones
                  .filter((phone) => phone?.trim())
                  .map((phone, index) => (
                    <p key={index}>
                      <a
                        href={`tel:${phone.replace(/\D/g, "")}`}
                        className="hover:text-teal-600 transition-colors"
                      >
                        {phone}
                      </a>
                    </p>
                  ))}
              </div>
            </ContactBlock>
          )}

          {hasEmail && (
            <ContactBlock icon={Mail} title="Email">
              <p>
                <a
                  href={`mailto:${contactsData.email}`}
                  className="hover:text-teal-600 transition-colors"
                >
                  {contactsData.email}
                </a>
              </p>
            </ContactBlock>
          )}

          {hasWorkSchedule && (
            <ContactBlock icon={Clock} title="Режим работы">
              {contactsData.work_days?.trim() && (
                <p>{contactsData.work_days}</p>
              )}
              {contactsData.work_hours?.trim() && (
                <p>{contactsData.work_hours}</p>
              )}
            </ContactBlock>
          )}

          {hasSocialLinks && (
            <ContactBlock icon={MessageCircle} title="Социальные сети">
              <div className="space-y-2">
                <SocialLink href={contactsData.telegram} icon={TgIcon}>
                  Telegram
                </SocialLink>
                <SocialLink href={contactsData.whatsapp} icon={WsAppIcon}>
                  WhatsApp
                </SocialLink>
                <SocialLink href={contactsData.instagram} icon={InstIcon}>
                  Instagram
                </SocialLink>
                <SocialLink href={contactsData.vkontakte} icon={VkIcon}>
                  ВКонтакте
                </SocialLink>
              </div>
            </ContactBlock>
          )}
        </div>

        {/* Соцсети и описание */}
        <div className="relative">
          {hasDescription && (
            <div className="prose prose-gray max-w-none relative">
              <div className="hidden tablet:block absolute left-0 top-0 w-[2px] h-full bg-primary"></div>
              <p className="whitespace-pre-line text-balance tablet:pl-6">
                {contactsData.description}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <iframe
          className="border-2 rounded-lg"
          src="https://yandex.ru/map-widget/v1/?um=constructor%3Ab78748c4c85668c1a5729102d2f14d576d7bc1c31aa53595952ad3856f235231&amp;source=constructor"
          width="100%"
          height="500"
        ></iframe>
      </div>
    </div>
  );
};

export default Contacts;
