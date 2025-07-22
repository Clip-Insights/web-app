import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-transparent border-t-4"
        style={{
          borderImage: "linear-gradient(to right, rgb(62, 79, 253), rgb(128, 0, 187)) 1",
        }}
      ></div>
    </div>
  );
};

export default Loader;
