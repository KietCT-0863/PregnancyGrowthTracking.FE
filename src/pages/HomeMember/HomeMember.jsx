import BlogSildeMember from "../../components/BlogSildeMember/BlogSildeMember";
import FoetusList from "../../components/FoetusList/FoetusList";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";
import NotesList from "../../components/NotesList/NotesList";
import "./HomeMember.scss";

const HomeMember = () => {
  return (
    
    <div className="home-member" style={{ margin: "20px 0" }}>
        
        <PregnancyTimeline/>
      <FoetusList />
      <NotesList />
      <BlogSildeMember />
    </div>
  );
};

export default HomeMember;
