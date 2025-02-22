import { Outlet } from "react-router-dom";
import HeaderContent from "../../components/HeaderContent/HeaderContent";
import BlogSilde from "../../components/BlogSilde/BlogSilde";
import FooterContent from "../../components/FooterContent/FooterContent";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <HeaderContent />
      <BlogSilde />
      <FooterContent />
      <Footer/>
    </>
  );
};
export default Home;
