import "./BasicUserLayout.css";
import BlogSildeGuest from "../../components/BlogSildeGuest/BlogSildeGuest";
import VipBenefits from "../../components/VipBenefit/VipBenefit";
import FoetusList from "../../components/FoetusList/FoetusList";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";
const HomeBasicUser = () => {
  return (
    <>
       <PregnancyTimeline />
     <FoetusList />
      <BlogSildeGuest />
      <VipBenefits />
    </>
  );
};

export default HomeBasicUser;
