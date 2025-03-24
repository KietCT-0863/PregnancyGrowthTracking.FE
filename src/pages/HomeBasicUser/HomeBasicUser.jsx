import "./BasicUserLayout.scss";
import BlogSildeGuest from "../../components/BlogSildeGuest/BlogSildeGuest";
import VipBenefits from "../../components/VipBenefit/VipBenefit";
import FoetusList from "../../components/FoetusList/FoetusList";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";

const HomeBasicUser = () => {
  return (
    <div className="home-basic-user">
      <div className="top-section">
        <div className="timeline-wrapper">
          <PregnancyTimeline />
        </div>
        <div className="foetus-wrapper">
          <FoetusList />
        </div>
      </div>
      <div className="mid-section">
        <BlogSildeGuest />
      </div>
      <div className="bottom-section">
        <VipBenefits />
      </div>
    </div>
  );
};

export default HomeBasicUser;
