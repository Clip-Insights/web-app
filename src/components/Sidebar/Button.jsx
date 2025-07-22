const Button = ({ icon, text, active, onClick }) => {
  return (
    <button
      type="button"
      className={`flex items-center gap-3 ml-9 px-4 py-3 cursor-pointer transition-colors ${
        active ? "text-customPrimary" : "text-gray-700"
      } focus:outline-none`}
      onClick={onClick}
    >
      {/* Always render the icon div with the same dimensions */}
      <div className="w-6 h-6 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-lg font-medium font-inter">{text}</div>
      {active && (
        <div className="ml-auto">
          <img
            src="/Logo/logo-dark.svg" // Make sure the path is correct
            alt="Active Indicator"
            className="w-5 h-5"
          />
        </div>
      )}
    </button>
  );
};

export default Button;