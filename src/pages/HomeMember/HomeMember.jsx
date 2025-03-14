import BlogSildeMember from "../../components/BlogSildeMember/BlogSildeMember";
import FoetusList from "../../components/FoetusList/FoetusList";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";
import NotesList from "../../components/NotesList/NotesList";
import "./HomeMember.scss";

const HomeMember = () => {
  return (
    <div className="home-member">
      <PregnancyTimeline />
      <FoetusList />
      <NotesList />
      <BlogSildeMember />
    </div>
  );
};

export default HomeMember;
