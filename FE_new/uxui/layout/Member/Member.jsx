import Navbar from "../../src/components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import Home from "../../src/pages/HomeBasicUser/HomeBasicUser";
import Footer from "../../src/components/Footer/Footer";
const Member = () => {
  return (
    <>
      <Navbar />
      <Home />
      <Footer />
    </>
  );
};

export default Member;
