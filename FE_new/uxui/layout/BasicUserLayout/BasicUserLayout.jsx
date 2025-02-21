import HomeBasicUser from "../../src/pages/HomeBasicUser/HomeBasicUser";
import BasicUserNavbar from "../../src/components/BasicUserNavbar/BasicUserNavbar";

const BasicUserLayout = () => {
  return (
    <>
      <BasicUserNavbar />
      <HomeBasicUser />
    </>
  );
};

export default BasicUserLayout;
