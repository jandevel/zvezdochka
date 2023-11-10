import React from "react";
import NavigationMenu from "./NavigationMenu.jsx";

const Layout = ({ children }) => {
  return (
    <>
      <NavigationMenu />
      <main>{children}</main>
    </>
  );
};

export default Layout;