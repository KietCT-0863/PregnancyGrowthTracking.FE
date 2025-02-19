import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Blog from "./pages/blog/index";
import Login from "./pages/Login/Login";
import BlogAll from "./pages/blog/BlogAll";
import BlogDetail from "./pages/blog/BlogDetail";
import Member from "../layout/Member/Member";
import Register from "./pages/Register/Register";
import BasicTracking from "./pages/BasicTracking/BasicTracking";
import Layout from "../layout/Layout";
import AdminLayout from "../layout/AdminLayout/AdminLayout";
import Dashboard from "./pages/DashBoardAdmin/DashBoard";
import UserManagement from "./pages/UserManagementAmin/UserManagement";
import BlogManagement from "./pages/BlogManagement/BlogManagement";
import CalendarAll from "./pages/Calender/CalendarAll";
import DoctorNotes from "./pages/DoctorNotes/DoctorNotes";
import CalendarHistory from "./pages/Calender/CalendarHistory";
import Community from "./pages/Community/Community";
import BasicUserLayout from "../layout/BasicUserLayout/BasicUserLayout";
import GuestBlogAll from "./pages/guest/blog/GuestBlogAll";
import GuestBlogDetail from "./pages/guest/blog/GuestBlogDetail";


  // Hàm bọc các thành phần trong Layout
  const withLayout = (Component) => (
  <Layout>
    {Component}
  </Layout>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Member />}>
        <Route index element={<Home />} />
      

      </Route>

      {/** Định nghĩa các route trong mảng **/}
      { [
  { path: "/blog", element: <Blog />, index: <BlogAll /> },
  { path: "/basictracking", element: <BasicTracking /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/calendar", element: <CalendarAll /> },
  { path: "/ghi-chu-bac-si", element: <DoctorNotes /> },
  { path: "/cong-dong", element: <Community /> },
  

].map(({ path, element, index }) => (
  <Route
    key={path}
    path={path}
    element={withLayout(element)}
  >
    {index && <Route index element={index} />}
    {path === "/blog" && <Route path=":id" element={<BlogDetail />} />}
    {path === "/calendar-history" && <Route path=":id" element={<CalendarHistory />} />}
  </Route>
))}


      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="blogs" element={<BlogManagement />} />

      </Route>

      {/* Basic User routes */}
      <Route path="/basic-user" element={<BasicUserLayout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<GuestBlogAll />} />
        <Route path="blog/:id" element={<GuestBlogDetail />} />
        <Route path="community" element={<Community />} />
        <Route path="about" element={<h1>Về chúng tôi</h1>} />
        <Route path="contact" element={<h1>Liên hệ</h1>} />
      </Route>

      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
