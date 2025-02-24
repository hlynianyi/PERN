import React from "react";
import NavbarMenu from "./NavbarMenu";
import { ThemeToggle } from "../../subcomponents/ThemeToggle";
import NavbarContacts from "./NavbarContacts";
import { SearchProducts } from "../../subcomponents/SearchProducts";
import Breadcrumbs from "@/subcomponents/Breadcrumbs";
import Logo from "../Logo";

const Navbar = () => {
  return (
    <header className="container flex flex-col w-full justify-between py-2 pb-4 mobile:px-2 tablet:px-4  gap-2 center">
      <div className="flex flex-row w-full justify-between gap-2 tablet:gap-0">
        <div className="flex flex-col w-full justify gap-2">
          <div className=" flex gap-1 justify-between pb-2 tablet:pb-0">
            <div className="tablet:hidden">
              <Logo variant="mobile" />
            </div>
            <div className="hidden tablet:block laptop:hidden">
              <Logo variant="tablet" />
            </div>
            <div className="hidden tablet:flex flex-row">
              <div className="flex flex-row gap-[8px] flex-shrink-0  ">
                <div className="hidden laptop:block">
                  <Logo variant="laptop" />
                </div>
                <div className="hidden laptop:flex flex-col  font-semibold leading-[22px] text-[20px]">
                  <p className="text-muted-foreground">Ножевая </p>
                  <p className="text-muted-foreground">мастерская</p>
                  <p className="">Поддубного В.В.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 tablet:gap-4 laptop:-ml-36">
              <NavbarMenu />
              <div className=" flex justify-center">
                <SearchProducts />
              </div>
            </div>
            <div className=" tablet:block ">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex flex-row justify-between w-full mt-2 text-muted-foreground">
            <NavbarContacts />
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
