import React from "react";

const Logo = () => {
  return (
    <div className="flex items-center gap-2 px-5 py-4">
      <div className="w-14 h-14 flex items-center justify-center">
        <img src="/Logo/logo-light.svg" alt="Clip Insights Logo" className="w-12 h-12 object-contain" />
      </div>
      <div className="text-2xl font-bold whitespace-nowrap">Clip Insights</div>
    </div>
  );
};

export default Logo;
