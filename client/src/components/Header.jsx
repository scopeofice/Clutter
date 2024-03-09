import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const Header = () => {
  

  return (
    <div className="header">
      <nav>
        <NavLink activeclassname="active" to="/">
          Home
        </NavLink>
        <NavLink activeclassname="active" to="/upload">
          Upload
        </NavLink>
        <NavLink activeclassname="active" to="/list">
          Files List
        </NavLink>
      </nav>
      
    </div>
  );
};

export default Header;
