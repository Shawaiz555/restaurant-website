import React from "react";
import "../../styles/loader.css";

const Loader = () => {
  return (
    <div className="page-loader">
      <div className="loader-logo">
        <img
          src="/assets/images/BitesLogo.png"
          alt="Bites Logo"
          className="h-28 w-48 lg:w-52 lg:h-32 object-contain transition-all"
        />
      </div>
      <div className="loader-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loader-subtext">Loading delicious content...</div>
    </div>
  );
};

export default Loader;
