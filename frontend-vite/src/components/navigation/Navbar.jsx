import React from "react";
import NavbarMenu from "./NavbarMenu";
import { ThemeToggle } from "../../subcomponents/ThemeToggle";
import { AxeIcon } from "lucide-react";
import NavbarContacts from "./NavbarContacts";
import { SearchProducts } from "../../subcomponents/SearchProducts";
import Breadcrumbs from "@/subcomponents/Breadcrumbs";

const Navbar = () => {
  return (
    <div className="flex flex-row w-full justify-between py-2 px-4  gap-4 center">
      {/* 1/3 */}
      <div className="flex flex-col gap-4 ">
        <div className="flex gap-1 h-[42px] items-center">
          <AxeIcon size={38} strokeWidth={1.4} absoluteStrokeWidth />
          <a
            href="/admin/products"
            className="hidden tablet:block font-sans text-lg font-normal leading-5"
          >
            <p>Мастерская</p>
            <p>Поддубного</p>
          </a>
        </div>
        <div className="flex min-h-[40px] items-center">
          <Breadcrumbs />
        </div>
      </div>

      {/* 2/2 */}
      <div className="flex flex-col items-center justify-between gap-4">
        <NavbarMenu />
        <SearchProducts />
        <div className="flex-1 max-w-xl"></div>
      </div>

      {/* 3/3 */}
      <div className="flex flex-col gap-4 items-end">
        <NavbarContacts />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Navbar;
