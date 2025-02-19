import React from "react";
import Navbar from "../src/components/NavBar/NavBar"; // Giả sử bạn có Navbar component
import Footer from "../src/components/Footer/Footer"; // Giả sử bạn có Footer component
import { Outlet } from "react-router-dom";
const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
