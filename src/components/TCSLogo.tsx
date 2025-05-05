
import React from "react";

const TCSLogo = () => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-2">TATA CONSULTANCY SERVICES</h2>
      <div className="flex items-center">
        <span className="text-4xl font-extrabold text-tcs-blue">T</span>
        <span className="text-4xl font-extrabold text-tcs-red">C</span>
        <span className="text-4xl font-extrabold text-tcs-yellow">S</span>
      </div>
      <p className="text-sm mt-2">We believe</p>
      <p className="text-sm mt-1 max-w-md text-center">
        The Pursuit of Health & Wellness is a right and shared responsibility
      </p>
    </div>
  );
};

export default TCSLogo;
