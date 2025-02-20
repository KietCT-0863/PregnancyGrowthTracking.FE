import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/home";
import Blog from "./pages/blog/index";
import Login from "./pages/Login/Login";
import BlogAll from "./pages/blog/BlogAll";
import BlogDetail from "./pages/blog/BlogDetail";
import Member from "../layout/Member/Member";
import Register from "./pages/Register/Register";
import BasicTracking from "./pages/BasicTracking/BasicTracking";
import Layout from "../layout/Member/Member";
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

import Footer from "./components/Footer/Footer";
import BasicUserNavbar from "./components/BasicUserNavbar/BasicUserNavbar";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route cho thành viên VIP */}
      <Route path="/" element={<Member />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />}>
          <Route index element={<BlogAll />} />
          <Route path=":id" element={<BlogDetail />} />
        </Route>
        <Route path="basictracking" element={<BasicTracking />} />
        <Route path="calendar" element={<CalendarAll />} >
        <Route path=":id" element={<CalendarHistory />} />
        </Route>
        <Route path="ghi-chu-bac-si" element={<DoctorNotes />} />
        <Route path="cong-dong" element={<Community />} />
      </Route>

      {/* Route cho admin */} 
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="blogs" element={<BlogManagement />} />
      </Route>

      {/* Route độc lập */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Route cho basic user */}
      <Route
        path="/basic-user"
        element={
          <>
            <BasicUserNavbar />
            <Outlet />
            <Footer />
          </>
        }
      >
        <Route index element={<BasicUserLayout   />} />
        <Route path="blog" element={<GuestBlogAll />} />
        <Route path="blog/:id" element={<GuestBlogDetail />} />
        <Route path="community" element={<Community />} />
        <Route path="about" element={<h1>Về chúng tôi</h1>} />
        <Route path="contact" element={<h1>Liên hệ</h1>} />
      </Route>

      {/* Route 404 Not Found */}
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
