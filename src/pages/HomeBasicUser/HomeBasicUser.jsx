import "./BasicUserLayout.css";
import BlogSildeGuest from "../../components/BlogSildeGuest/BlogSildeGuest";
import VipBenefits from "../../components/VipBenefit/VipBenefit";
import AddChild from "../../components/AddChild/AddChild";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";
const HomeBasicUser = () => {
  return (
    <>
       <PregnancyTimeline />
      <AddChild />
      <BlogSildeGuest />
      <VipBenefits />
    </>
  );
};

export default HomeBasicUser;
