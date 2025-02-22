import React from "react";
import NavbarMenu from "./NavbarMenu";
import { ThemeToggle } from "../../subcomponents/ThemeToggle";
import NavbarContacts from "./NavbarContacts";
import { SearchProducts } from "../../subcomponents/SearchProducts";
import Breadcrumbs from "@/subcomponents/Breadcrumbs";
import Logo from "../Logo";

const Navbar = () => {
  return (
    <header className="container flex flex-col w-full justify-between py-2 mobile:px-2 tablet:px-4  gap-4 center">
      <div className="flex flex-row w-full justify-between gap-2">
        <div className="hidden tablet:flex flex-row">
          <div className="flex flex-row gap-[10px] flex-shrink-0  ">
            <Logo />
            <div className="hidden laptop:flex flex-col  font-semibold   text-[18px]">
              <p className="text-muted-foreground">Ножевая </p>
              <p className="text-muted-foreground">мастерская</p>
              <p className="">ПОДДУБНОГО В.В.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full justify gap-2">
          <div className="flex flex-row justify-between gap-3 w-full">
            <div className="hidden tablet:flex flex-col gap-4 "></div>
            <div className="tablet:hidden">
              <ThemeToggle />
            </div>
            <SearchProducts />
            <div className="flex flex-row gap-4 ">
              <NavbarContacts />
              <div className="hidden tablet:block ">
                <ThemeToggle />
              </div>
            </div>
          </div>
          <div className="relative flex gap-4 justify-center tablet:-ml-14 laptop:-ml-28 pb-2 tablet:pb-0">
            <NavbarMenu />
          </div>
        </div>
      </div>

      <div className="hidden tablet:flex min-h-[40px] items-center mt-2">
        <Breadcrumbs />
      </div>
    </header>
  );
};

export default Navbar;
