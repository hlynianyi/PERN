import React, { useState, useEffect } from "react";
import {
  PhoneIncoming,
  Mail,
  Clock,
  ExternalLink,
  Map,
  CircleUserRound,
} from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { contactsApi } from "@/api/contacts";

const NavbarContacts = () => {
  const [contactsData, setContactsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await contactsApi.getContacts();
        setContactsData(data);
      } catch (err) {
        setError("Не удалось загрузить контактную информацию");
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  const hasAddress =
    contactsData?.city?.trim() || contactsData?.address?.trim();
  const hasPhones = contactsData?.phones?.length > 0;
  const hasEmail = contactsData?.email?.trim();
  const hasWorkSchedule =
    contactsData?.work_days?.trim() || contactsData?.work_hours?.trim();

  const Content = () => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">Свяжитесь с нами</h4>
      <div className="space-y-2">
        {hasPhones && (
          <div className="space-y-1">
            {contactsData.phones
              .filter((phone) => phone?.trim())
              .map((phone, index) => (
                <p key={index} className="flex flex-row gap-2 items-center">
                  <PhoneIncoming size={20} className="text-muted-foreground" />

                  <a
                    href={`tel:${phone.replace(/\D/g, "")}`}
                    className="hover:text-teal-600 transition-colors"
                  >
                    {phone}
                  </a>
                </p>
              ))}
          </div>
        )}
        {hasEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Mail size={20} className="text-muted-foreground" />
            <a
              href={`mailto:${contactsData.email}`}
              className="hover:text-teal-600 transition-colors"
            >
              {contactsData.email}
            </a>
          </div>
        )}
        {hasWorkSchedule && (
          <div className="flex flex-row items-center gap-2 text-sm">
            <Clock size={20} className="text-muted-foreground" />
            <div className="flex flex-col">
              {contactsData.work_days?.trim() && (
                <p className="">{contactsData.work_days}</p>
              )}
              {contactsData.work_hours?.trim() && (
                <p className="">{contactsData.work_hours}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const LocationContent = () => (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Наш адрес</h4>
      <div className="space-y-2">
        {hasAddress && (
          <p className="">
            {[contactsData.city, contactsData.address]
              .filter(Boolean)
              .map((item) => item.trim())
              .join(", ")}
          </p>
        )}
        <a
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink size={20} /> Открыть карту
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex flex-row items-center gap-2 ">
      {/* Contacts */}
      <div className="hidden laptop:block">
        <HoverCard>
          <HoverCardTrigger asChild>
            <CircleUserRound
              size={38}
              strokeWidth={1.1}
              absoluteStrokeWidth
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <Content />
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="laptop:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <CircleUserRound
              size={38}
              strokeWidth={0.6}
              absoluteStrokeWidth
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Контакты</DialogTitle>
            </DialogHeader>
            <Content />
          </DialogContent>
        </Dialog>
      </div>

      {/* Location */}
      <div className="hidden laptop:block">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Map
              size={40}
              strokeWidth={1.1}
              absoluteStrokeWidth
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <LocationContent />
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="laptop:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Map
              size={40}
              strokeWidth={0.8}
              absoluteStrokeWidth
              className="text-foreground hover:text-primary transition-colors cursor-pointer"
            />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Адрес</DialogTitle>
            </DialogHeader>
            <LocationContent />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default NavbarContacts;
