import React from "react";
import { PhoneIncoming } from "lucide-react";

const NavbarContacts = () => {
  return (
    <div className=" hidden laptop:flex flex-row items-center gap-1">
      <PhoneIncoming size={32} strokeWidth={1} absoluteStrokeWidth />
      <div className="flex flex-col leading-6 font-sans font-normal text-sm">
        <p>+7-(988)-99-55-44</p>
        <p>+7-(988)-99-55-44</p>
      </div>
    </div>
  );
};

export default NavbarContacts;
