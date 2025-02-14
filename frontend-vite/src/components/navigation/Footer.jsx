import React from "react";
import { Separator } from "../ui/separator";
import { contactsApi } from "@/api/contacts";

const Footer = () => {
  return (
    <>
      <Separator />
      <footer className="container my-8 grid grid-cols-3">
        <div className="flex flex-col">
          <h3 className="font-exo text-lg font-semibold">Каталог</h3>
          <div>

          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-exo text-lg font-semibold">Клиентам</h3>
          <div>

          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-exo text-lg font-semibold">Контакты</h3>
          <div>

          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
