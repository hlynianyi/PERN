import React from "react";
import NavbarMenu from "./NavbarMenu";
import { ThemeToggle } from "../../subcomponents/ThemeToggle";
import NavbarContacts from "./NavbarContacts";
import { SearchProducts } from "../../subcomponents/SearchProducts";
import Breadcrumbs from "@/subcomponents/Breadcrumbs";

const Navbar = () => {
  return (
    <div className="flex flex-col w-full justify-between py-2 mobile:px-2 tablet:px-4  gap-4 center">
      <div className="flex flex-row justify-between gap-3 w-full">
        <div className="hidden tablet:flex flex-col gap-4 ">
          <div className="flex gap-1 h-[42px] items-center">
            <a
              href="/admin/products"
              className="hidden tablet:flex font-serif text-lg  "
            >
              <p className="text-4xl">М</p>
              <div className="flex flex-col justify-center">
                <p className="leading-3">астерская</p>
                <p className="leading-4">Поддубного</p>
              </div>
            </a>
          </div>
        </div>
        <div className="tablet:hidden">
          <ThemeToggle />
        </div>
        <SearchProducts />
        <div className="flex flex-row gap-4 ">
          <NavbarContacts />
          <div className="hidden tablet:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <NavbarMenu />
        <div className="flex min-h-[40px] items-center">
          <Breadcrumbs />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
