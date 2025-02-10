import React from "react";
import {
  PhoneIncoming,
  Mail,
  Clock,
  ExternalLink,
  Map,
  MapPin,
  Contact,
  Locate,
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

const NavbarContacts = () => {
  const Content = () => (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Свяжитесь с нами</h4>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <PhoneIncoming size={20} className="text-muted-foreground" />
          <a
            href="tel:+79889955441"
            className="text-foreground hover:text-primary transition-colors"
          >
            +7 (988) 99-55-441
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <PhoneIncoming size={20} className="text-muted-foreground" />
          <a
            href="tel:+79889955442"
            className="text-foreground hover:text-primary transition-colors"
          >
            +7 (988) 99-55-442
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Mail size={20} className="text-muted-foreground" />
          <a
            href="mailto:info@example.com"
            className="text-foreground hover:text-primary transition-colors"
          >
            info@example.com
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={20} className="text-muted-foreground" />
          <span>Пн-Пт: 9:00 - 18:00</span>
        </div>
      </div>
    </div>
  );
  const LocationContent = () => (
    <div className="space-y-1">
      <h4 className="text-sm font-semibold">Наш адрес</h4>
      <div className="space-y-2">
        <p className="text-sm">г. Кизляр, ул. Примерная, д. 123</p>
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
    <div className="flex flex-row items-center gap-2">
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
