import { Outlet } from "react-router-dom";
import HeaderContent from "../../components/HeaderContent/HeaderContent";
import FeatureContent from "../../components/FeatureContent/FeatureContent";
import BlogSilde from "../../components/BlogSilde/BlogSilde";
import FooterContent from "../../components/FooterContent/FooterContent";
import Navbar from "../../components/Navbar/Navbar";
const Home = () => {
  return (
    <>
      <Navbar />

      <Outlet />
      <HeaderContent />
      <FeatureContent />
      <BlogSilde />
      <FooterContent />
    </>
  );
};
export default Home;
