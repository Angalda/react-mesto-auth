import React from "react";
import logo from '../images/header-logo.svg';

function Header() {
  return (
    <header className="header">
      <a href={logo} className="header__logo"></a>
    </header>
  );
}

export default Header;