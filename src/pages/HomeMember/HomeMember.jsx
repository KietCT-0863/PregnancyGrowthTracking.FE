import BlogSildeMember from "../../components/BlogSildeMember/BlogSildeMember";
import FoetusList from "../../components/FoetusList/FoetusList";
import PregnancyTimeline from "../../components/PregnancyTimeline/PregnancyTimeline";
import NotesList from "../../components/NotesList/NotesList";

const HomeMember = () => {
  return (
    <>
      <PregnancyTimeline />
      <FoetusList />
      <NotesList />
      <BlogSildeMember />
    </>
  );
};

export default HomeMember;
