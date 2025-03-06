import { Routes, Route, Outlet } from "react-router-dom";

import HomePublic from "./pages/HomePublic/HomePublic";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import BasicTracking from "./pages/BasicTracking/BasicTracking";
import AdminLayout from "../layout/AdminLayout/AdminLayout";
import Dashboard from "./pages/DashBoardAdmin/DashBoard";
import UserManagement from "./pages/UserManagementAmin/UserManagement";
import CalendarAll from "./pages/Calender/CalendarAll";
import DoctorNotes from "./pages/DoctorNotes/DoctorNotes";
import CalendarHistory from "./pages/Calender/CalendarHistory";
import Community from "./pages/Community/Community";
import BasicUserLayout from "../layout/BasicUserLayout/BasicUserLayout";
import AboutUs from "./pages/AboutUs/AboutUs";
import FAQ from "./pages/FAQ/FAQ";
import FAQDetail from "./pages/FAQ/FAQDetail";
import FAQAll from "./pages/FAQ/FAQAll";
import Contact from "./pages/Contact/Contact";
import NavBarGuest from "./components/NavBarGuest/NavBarGuest";
import FooterGuest from "./components/FooterGuest/FooterGuest";
import ChooseVip from "./pages/VipChoose/ChooseVip";
import NavBarMember from "./components/NavBarMember/NavBarMember";
import FooterMember from "./components/FooterMember/FooterMember";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import GrowthStandardList from "./components/GrowthStandard/GrowthStandardList";
import PaymentResult from "./pages/Payment/PaymentResult";
import ChatAI from "./components/ChatBoxAI/ChatAI";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import ProtectedBasicUserRoute from "./components/ProtectedBasicUserRoute/ProtectedBasicUserRoute";
import Member from "../layout/Member/Member";
import BlogManagement from "./pages/BlogManagement/BlogManagement";
import BlogAllPublic from "./pages/BlogPublic/BlogAllPublic";
import BlogDetailPublic from "./pages/BlogPublic/BlogDetailPublic";
import BlogPublic from "./pages/BlogPublic";
import BlogGuest from "./pages/guest/blog";
import GuestBlogAll from "./pages/guest/blog/GuestBlogAll";
import GuestBlogDetail from "./pages/guest/blog/GuestBlogDetail";
import Blog from "./pages/blog";
import BlogAll from "./pages/blog/BlogAll";
import BlogDetail from "./pages/blog/BlogDetail";
import EditProfile from "./pages/Profile/EditProfile";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route công khai - không cần đăng nhập */}
      <Route
        path="/"
        element={
          <>
            <NavBar />
            <div style={{ margin: "20px 0" }} />
            <Outlet />
            <div style={{ margin: "20px 0" }} />
            <ChatAI />
            <Footer />
          </>
        }
      >
        <Route index element={<HomePublic />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/blog" element={<BlogPublic />} >
        <Route index element={<BlogAllPublic />} />
        <Route path=":id" element={<BlogDetailPublic />} /></Route>
        
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/faq" element={<FAQ />}>
        <Route index element={<FAQAll />} />
        <Route path=":id" element={<FAQDetail />} />
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
              <ChatAI />
              <FooterGuest />
            </>
          </ProtectedBasicUserRoute>
        }
      >
        <Route index element={<BasicUserLayout />} />
        <Route path="community" element={<Community />} />
        <Route path="/basic-user/choose-vip" element={<ChooseVip />} />
        <Route path="/basic-user/payment-result" element={<PaymentResult />} />
        <Route path="/basic-user/profile/edit" element={<EditProfile />} />
        <Route path="/basic-user/blog" element={<BlogGuest />} >
          <Route index element={<GuestBlogAll />} />
          <Route path=":id" element={<GuestBlogDetail />} />
        </Route>
      </Route>

      {/* Route cho thành viên VIP - cần đăng nhập */}
      <Route
        path="/member"
        element={
          <ProtectedBasicUserRoute>
            <NavBarMember />
            <div style={{ margin: "20px 0" }} />
            <Outlet />
            <div style={{ margin: "20px 0" }} />
            <ChatAI />
            <FooterMember />
          </ProtectedBasicUserRoute>
        }
      >
        <Route index element={<Member />} />
        <Route path="/member/basic-tracking" element={<BasicTracking />} />
        <Route path="/member/calendar" element={<CalendarAll />}>
          <Route path="/member/calendar/:id" element={<CalendarHistory />} />
        </Route>
        <Route path="/member/doctor-notes" element={<DoctorNotes />} />
        <Route path="/member/community" element={<Community />} />  
        <Route path="/member/blog" element={<Blog />} >
        <Route index element={<BlogAll />} />
        <Route path=":id" element={<BlogDetail />} /></Route>
        <Route path="/member/profile/edit" element={<EditProfile />} />
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
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/blogs" element={<BlogManagement />} />
        <Route path="growth-standard" element={<GrowthStandardList />} />
      </Route>

      {/* Route 404 Not Found */}
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
