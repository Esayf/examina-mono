"use client"; // Next.js 13+ kullanıyorsanız ekleyin (server bileşeninde istemci özellikleri için)

/* Örnek ikon: heroicons */
import { Bars3Icon } from "@heroicons/react/24/outline";
import React from "react";

const CurvedHeader = () => {
  return (
    <header className="bg-[radial-gradient(circle_at_top_left,_#fff,_#d9f9b1,_#91e7f3,_#b0e8ff)] py-4">
      <nav
        className="
        relative
        mx-auto
        flex
        h-16
        w-[90%]
        max-w-[1200px]
        items-center
        justify-between
        rounded-full
        bg-[#101010]
        px-4
        text-white
        shadow-lg
      "
      >
        {/* SOL: Menü ikonu (daire içinde) */}
        <button
          className="
            flex 
            h-10 
            w-10 
            items-center 
            justify-center 
            rounded-full
            border 
            border-white
            hover:bg-white 
            hover:text-[#101010]
            transition 
            duration-300
          "
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        {/* ORTA: Logonuz veya markanız */}
        <div className="flex-1 text-center text-xl font-bold tracking-wide">Choz</div>

        {/* SAĞ: İki buton (TABLET/DESKTOP) */}
        <div className="hidden items-center gap-4 sm:flex">
          <button className="text-sm font-medium uppercase tracking-wider hover:text-gray-300 transition duration-200">
            CONTACT US
          </button>
          <button
            className="
              rounded-full
              bg-lime-500
              px-4 
              py-2
              text-sm
              font-semibold
              text-black
              shadow-sm
              hover:bg-lime-600
              transition
              duration-300
            "
          >
            START BUILDING
          </button>
        </div>
      </nav>
    </header>
  );
};

export default CurvedHeader;
