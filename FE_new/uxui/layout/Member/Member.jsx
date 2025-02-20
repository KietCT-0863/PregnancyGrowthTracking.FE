import NavBar from "../../src/components/NavBar/NavBar";
import Footer from "../../src/components/Footer/Footer";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <NavBar />
      <Outlet />

      <Footer />
    </>
  );
};
export default Layout;
