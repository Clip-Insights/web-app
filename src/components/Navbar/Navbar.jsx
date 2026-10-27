// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import Logo from "./Logo";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";

// function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();

//   const toggleMenu = useCallback(() => {
//     setIsMenuOpen((prev) => !prev);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768) {
//         setIsMenuOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   const navItems = [
//     { href: "/", label: "Dashboard" },
//     { href: "/userspace", label: "Files"},
//     { href: "/folders", label: "Folders"},
//     { href: "https://clipinsights.org/", label: "Product" },
//     { href: "https://clipinsights.org/contact/", label: "Contact" },
//     { href: "https://clipinsights.org/pricing/", label: "Pricing" },
//     ...(isAuthenticated
//       ? [{ label: "Logout", onClick: handleLogout }]
//       : [
//           { href: "/login", label: "Login" },
//           { href: "/signup", label: "Signup" },
//         ]),
//   ];

//   return (
//     <nav
//       className="w-full h-12 py-3 px-28 flex items-center justify-between shadow-md overflow-hidden"
//       role="navigation"
//     >
//       {/* Logo */}
//       <Logo />

//       {/* Desktop Links */}
//       <div className="hidden md:flex space-x-6 lg:space-x-8">
//         {navItems.map((item) => (
//           item.onClick ? (
//             <button
//               key={item.label}
//               onClick={item.onClick}
//               className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
//             >
//               {item.label}
//             </button>
//           ) : (
//             <Link
//               key={item.href}
//               to={item.href}
//               className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
//             >
//               {item.label}
//             </Link>
//           )
//         ))}
//       </div>

//       {/* Mobile Menu Icon */}
//       <div className="md:hidden flex">
//         <button
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//           className="text-gray-600 focus:outline-none hover:text-gray-900 transition-colors duration-200"
//         >
//           <svg
//             className="h-6 w-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//             role="img"
//           >
//             <title>Menu</title>
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 6h16M4 12h16m-7 6h7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Mobile Menu Dropdown */}
//       {isMenuOpen && (
//         <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md z-10">
//           {navItems.map((item) => (
//             item.onClick ? (
//               <button
//                 key={item.label}
//                 onClick={() => {
//                   item.onClick();
//                   setIsMenuOpen(false);
//                 }}
//                 className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
//               >
//                 {item.label}
//               </button>
//             ) : (
//               <Link
//                 key={item.href}
//                 to={item.href}
//                 className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 {item.label}
//               </Link>
//             )
//           ))}
//         </div>
//       )}
//     </nav>
//   );
// }

// export default Navbar;

// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import Logo from "./Logo";
// import { useAuth } from "../../context/AuthContext";
// import { useNavigate } from "react-router-dom";
// import Joyride, { STATUS } from 'react-joyride';

// function Navbar() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const { isAuthenticated, logout } = useAuth();
//   const navigate = useNavigate();
//   const [runTour, setRunTour] = useState(false);
//   const [steps] = useState([
//     {
//       target: '.dashboard-link',
//       content: 'This is your Dashboard where you can see an overview of your account',
//     },
//     {
//       target: '.files-link',
//       content: 'Access and manage all your files here',
//     },
//     {
//       target: '.folders-link',
//       content: 'Organize your files into folders for better management',
//     },
//     {
//       target: '.product-link',
//       content: 'Learn more about our product features and capabilities',
//     },
//     {
//       target: '.contact-link',
//       content: 'Get in touch with our support team for any queries',
//     },
//     {
//       target: '.pricing-link',
//       content: 'View our different pricing plans and subscription options',
//     },
//     {
//       target: '.logout-link',
//       content: 'Click here to safely log out of your account',
//     }
//   ]);

//   const toggleMenu = useCallback(() => {
//     setIsMenuOpen((prev) => !prev);
//   }, []);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 768) {
//         setIsMenuOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleLogout = async () => {
//     await logout();
//     navigate('/login');
//   };

//   const navItems = [
//     { href: "/", label: "Dashboard" },
//     { href: "/userspace", label: "Files"},
//     { href: "/folders", label: "Folders"},
//     { href: "https://clipinsights.org/", label: "Product" },
//     { href: "https://clipinsights.org/contact/", label: "Contact" },
//     { href: "https://clipinsights.org/pricing/", label: "Pricing" },
//     ...(isAuthenticated
//       ? [{ label: "Logout", onClick: handleLogout }]
//       : [
//           { href: "/login", label: "Login" },
//           { href: "/signup", label: "Signup" },
//         ]),
//   ];

//   const handleJoyrideCallback = (data) => {
//     const { status } = data;
//     if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
//       setRunTour(false);
//     }
//   };

//   useEffect(() => {
//     if (isAuthenticated) {
//       // Check if user has seen the tour before
//       const hasSeenTour = localStorage.getItem('hasSeenNavTour');
//       if (!hasSeenTour) {
//         setRunTour(true);
//         localStorage.setItem('hasSeenNavTour', 'true');
//       }
//     }
//   }, [isAuthenticated]);

//   return (
//     <nav
//       className="w-full h-12 py-3 px-28 flex items-center justify-between shadow-md overflow-hidden"
//       role="navigation"
//     >
//       {/* Logo */}
//       <div className="flex-shrink-0">
//         <Logo />
//       </div>

//       {/* Desktop Links - Adjusted margin and alignment */}
//       <div className="hidden md:flex items-center space-x-6 lg:space-x-8 ml-auto">
//         {navItems.map((item) => (
//           item.onClick ? (
//             <button
//               key={item.label}
//               onClick={item.onClick}
//               className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${
//                 item.label === 'Logout' ? 'logout-link' : ''
//               }`}
//             >
//               {item.label}
//             </button>
//           ) : (
//             <Link
//               key={item.href}
//               to={item.href}
//               className={`text-gray-600 hover:text-gray-900 transition-colors duration-200 ${
//                 item.label === 'Dashboard' ? 'dashboard-link' :
//                 item.label === 'Files' ? 'files-link' :
//                 item.label === 'Folders' ? 'folders-link' :
//                 item.label === 'Product' ? 'product-link' :
//                 item.label === 'Contact' ? 'contact-link' :
//                 item.label === 'Pricing' ? 'pricing-link' : ''
//               }`}
//             >
//               {item.label}
//             </Link>
//           )
//         ))}
//       </div>

//       {/* Mobile Menu Icon */}
//       <div className="md:hidden flex">
//         <button
//           onClick={toggleMenu}
//           aria-label="Toggle menu"
//           className="text-gray-600 focus:outline-none hover:text-gray-900 transition-colors duration-200"
//         >
//           <svg
//             className="h-6 w-6"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//             aria-hidden="true"
//             role="img"
//           >
//             <title>Menu</title>
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 6h16M4 12h16m-7 6h7"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Mobile Menu Dropdown */}
//       {isMenuOpen && (
//         <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-md z-10">
//           {navItems.map((item) => (
//             item.onClick ? (
//               <button
//                 key={item.label}
//                 onClick={() => {
//                   item.onClick();
//                   setIsMenuOpen(false);
//                 }}
//                 className="block w-full text-left px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
//               >
//                 {item.label}
//               </button>
//             ) : (
//               <Link
//                 key={item.href}
//                 to={item.href}
//                 className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 {item.label}
//               </Link>
//             )
//           ))}
//         </div>
//       )}

//       {/* Joyride Tour */}
//       <Joyride
//         steps={steps}
//         run={runTour}
//         callback={handleJoyrideCallback}
//         continuous={true}
//         showProgress={true}
//         showSkipButton={true}
//         styles={{
//           options: {
//             zIndex: 10000,
//           },
//         }}
//       />
//     </nav>
//   );
// }

// export default Navbar;


