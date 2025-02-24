import { Routes, Route, Outlet } from "react-router-dom";
import PublicLayout from "../layout/PublicLayout/PublicLayout";
// import Navbar from "../components/Navbar/Navbar";
import HomePublic from "./pages/HomePublic/HomePublic";
import Blog from "./pages/blog/index";
import Login from "./pages/Login/Login";
import BlogAll from "./pages/blog/BlogAll";
import BlogDetail from "./pages/blog/BlogDetail";

import Register from "./pages/Register/Register";
import BasicTracking from "./pages/BasicTracking/BasicTracking";
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
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import ProtectedBasicUserRoute from "./components/ProtectedBasicUserRoute/ProtectedBasicUserRoute";
import Member from "../layout/Member/Member";
import AboutUs from "./pages/AboutUs/AboutUs";
import FAQ from "./pages/FAQ/FAQ";
import FAQDetail from "./pages/FAQ/FAQDetail";
import FAQAll from "./pages/FAQ/FAQAll";
import Contact from "./pages/Contact/Contact";
import NavBarGuest from "./components/NavBar_Guest/NavBarGuest";
import FooterGuest from "./components/Footer_Guest/FooterGuest";
import ChooseVip from "./pages/VipChoose/ChooseVip";
import NavbarMember from "./components/NavBarMember/NavBarMember";
import FooterMember from "./components/Footer_Member/FooterMember";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
const AppRoutes = () => {
  return (
    <Routes>
      {/* Route công khai - không cần đăng nhập */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <div style={{ margin: "20px 0" }} />
            <Outlet />
            <div style={{ margin: "20px 0" }} />
            <Footer />
          </>
        }
      >
        <Route index element={<HomePublic />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/faq" element={<FAQ />}>
        <Route index element={<FAQAll />} />
        <Route path=":id" element={<FAQDetail />} />
      </Route>

      {/* Route cho thành viên VIP - cần đăng nhập */}
      <Route
        path="/member"
        element={
          <ProtectedBasicUserRoute>
            <NavbarMember />
            <div style={{ margin: "20px 0" }} />
            <Outlet />
            <div style={{ margin: "20px 0" }} />
            <FooterMember />
          </ProtectedBasicUserRoute>
        }
      >
        <Route index element={<Member />} />
        <Route path="/member/blog" element={<Blog />}>
          <Route index element={<BlogAll />} />
          <Route path=":id" element={<BlogDetail />} />
        </Route>
        <Route path="/member/basic-tracking" element={<BasicTracking />} />
        <Route path="/member/calendar" element={<CalendarAll />}>
          <Route path="/member/calendar/:id" element={<CalendarHistory />} />
        </Route>
        <Route path="/member/doctor-notes" element={<DoctorNotes />} />
        <Route path="/member/community" element={<Community />} />
      </Route>

      {/* Route cho admin - cần đăng nhập admin */}
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="blogs" element={<BlogManagement />} />
      </Route>

      {/* Route cho basic user - cần đăng nhập */}
      <Route
        path="/basic-user"
        element={
          <ProtectedBasicUserRoute>
            <>
              <NavBarGuest />
              <div style={{ margin: "20px 0" }} />
              <Outlet />
              <div style={{ margin: "20px 0" }} />
              <FooterGuest />
            </>
          </ProtectedBasicUserRoute>
        }
      >
        <Route index element={<BasicUserLayout />} />
        <Route path="/basic-user/blog" element={<GuestBlogAll />} />
        <Route path="/basic-user/blog/:id" element={<GuestBlogDetail />} />
        <Route path="community" element={<Community />} />
        <Route path="/basic-user/choose-vip" element={<ChooseVip />} />
      </Route>

      {/* Route 404 Not Found */}
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
