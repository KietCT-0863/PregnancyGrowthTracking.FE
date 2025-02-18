import NavBar from '../../src/components/NavBar/NavBar';
import Footer from '../../src/components/Footer/Footer';
import { Outlet } from 'react-router-dom';
import FeatureContent from '../../src/components/FeatureContent/FeatureContent';
import FooterContent from '../../src/components/FooterContent/FooterContent';
import HeaderContent from '../../src/components/HeaderContent/HeaderContent';
const Layout = () => {
    return (
   <>
<NavBar/>
    <Outlet/>
    <HeaderContent/>

    <FeatureContent/>
    <FooterContent/>
    <Footer/>
  </>
    )
}   
export default Layout;
