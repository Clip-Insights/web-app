import React from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "./Button";
import Contact from "./Contact";
import Logo from "./Logo";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const logoutUser = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  const menuItems = [
    {
      text: "Dashboard",
      path: "/",
      icon: (isActive) => (
        <img src={isActive ? "/icons/1-active.svg" : "/icons/1.svg"} alt="" className="w-6 h-6" />
      ),
      match: (pathname) => pathname === "/",
    },
    {
      text: "Files",
      path: "/files",
      icon: (isActive) => (
        <img src={isActive ? "/icons/2-active.svg" : "/icons/2.svg"} alt="" className="w-6 h-6" />
      ),
      match: (pathname) => pathname === "/files" || pathname.startsWith("/files/"),
    },
    {
      text: "Folders",
      path: "/folders",
      icon: (isActive) => (
        <img src={isActive ? "/icons/3-active.svg" : "/icons/3.svg"} alt="" className="w-6 h-6" />
      ),
      match: (pathname) => pathname.startsWith("/folders"),
    },
    {
      text: "Products",
      path: "/products",
      icon: (isActive) => (
        <img src={isActive ? "/icons/4-active.svg" : "/icons/4.svg"} alt="" className="w-6 h-6" />
      ),
      match: (pathname) => pathname.startsWith("/products"),
    },
    {
      text: "Pricing",
      path: "/pricing",
      icon: (isActive) => (
        <img src={isActive ? "/icons/5-active.svg" : "/icons/5.svg"} alt="" className="w-6 h-6" />
      ),
      match: (pathname) => pathname.startsWith("/pricing"),
    },
  ];

  return (
    <>
      {/* Improved Overlay (mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-60 z-50 md:hidden"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50 }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-72 border-r-2 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:relative md:z-10 md:flex`}
        style={{ zIndex: 60 }} /* Higher z-index than overlay to appear on top */
      >
        <div className="flex flex-col h-full">
          <Logo />

          <div className="flex-1 overflow-y-auto mb-12">
            {menuItems.map((item) => {
              const isActive = item.match(location.pathname);
              return (
                <Link
                  key={item.text}
                  to={item.path}
                  className="block"
                  onClick={() => setIsOpen(false)}
                >
                  <Button icon={item.icon(isActive)} text={item.text} active={isActive} />
                </Link>
              );
            })}
          </div>

          <Contact />

          <div className="mb-3" onClick={logoutUser}>
            <Link to="/login" className="block" onClick={() => setIsOpen(false)}>
              <Button icon={<img src="/icons/6.svg" alt="Logout" />} text="Logout" active={false} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;