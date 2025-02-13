import { useRef, useState } from "react";
import NavItems from "./navItems";

interface NavbarProps {
  open: boolean;
}

export default function NavMenu({ open }: NavbarProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [animationRunning, setAnimationRunning] = useState(false);
  return (
    <div
      ref={menuRef}
      id="menu"
      className={
        "w-12 flex flex-col gap-2 bg-white rounded-lg absolute top-20 z-40 lg:hidden shadow-lg" +
        (open
          ? " animate-in ease-linear slide-in-from-left duration-200"
          : " animate-out ease-linear slide-out-to-left duration-200")
      }
      onAnimationStart={() => {
        setAnimationRunning(true);
      }}
      onAnimationEnd={() => {
        if (!open) {
          menuRef.current?.style.setProperty("display", "none", "important");
          setAnimationRunning(false);
        }
      }}
      style={{ display: open || animationRunning ? "flex" : "none" }}
    >
      <NavItems />
    </div>
  );
}
