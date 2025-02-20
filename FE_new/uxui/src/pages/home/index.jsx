import { Outlet } from "react-router-dom";
import HeaderContent from "../../components/HeaderContent/HeaderContent";
import FeatureContent from "../../components/FeatureContent/FeatureContent";
import BlogSilde from "../../components/BlogSilde/BlogSilde";
import FooterContent from "../../components/FooterContent/FooterContent";

const Home = () => {
    return (<>
    
    <div>Home Page</div>
  <Outlet/>
  <HeaderContent/>
  <FeatureContent/>
  <BlogSilde/>
  <FooterContent/>
  </>

    )
}
export default Home;