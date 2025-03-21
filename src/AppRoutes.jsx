import { Routes, Route, Outlet } from "react-router-dom";
import HomePublic from "./pages/HomePublic/HomePublic";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
// import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
// import ResetPassword from "./pages/Auth/ResetPassword/ResetPassword";
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
import GrowthStandardList from "./pages/GrowthStandard/GrowthStandardList";
import PaymentResult from "./pages/Payment/PaymentResult";
import ChatAI from "./components/ChatBoxAI/ChatAI";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute/ProtectedAdminRoute";
import ProtectedBasicUserRoute from "./components/ProtectedBasicUserRoute/ProtectedBasicUserRoute";
import ProtectedMemberRoute from "./components/ProtectedMemberRoute/ProtectedMemberRoute";
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
import CalendarChange from "./pages/Calender/CalendarChange";
import CalendarDetail from "./pages/Calender/CalendarDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Các trang đăng nhập và đăng ký - không có NavBar và Footer */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      {/* <Route path="/reset-password" element={<ResetPassword />} /> */}

      {/* Route công khai - không cần đăng nhập */}
      <Route
        path="/"
        element={
          <>
            <NavBar />
            <div style={{ margin: "10px 0" }} />
            <Outlet />
            <div style={{ margin: "10px 0" }} />
            <ChatAI />
            <Footer />
          </>
        }
      >
        <Route index element={<HomePublic />} />
        <Route path="about" element={<AboutUs />} />
        <Route path="/community" element={<Community/>}/>
        <Route path="/blog" element={<BlogPublic />}>
          <Route index element={<BlogAllPublic />} />
          <Route path=":id" element={<BlogDetailPublic />} />
        </Route>

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
              <div style={{ margin: "10px 0" }} />
              <Outlet />
              <div style={{ margin: "10px 0" }} />
              <ChatAI />
              <FooterGuest />
            </>
          </ProtectedBasicUserRoute>
        }
      >
        <Route index element={<BasicUserLayout />} />
        <Route path="community" element={<Community />} />
        <Route path="choose-vip" element={<ChooseVip />} />
        <Route path="payment-result" element={<PaymentResult />} />
        <Route path="profile/edit" element={<EditProfile />} />
        <Route path="blog" element={<BlogGuest />}>
          <Route index element={<GuestBlogAll />} />
          <Route path=":id" element={<GuestBlogDetail />} />
        </Route>
      </Route>

      {/* Route cho thành viên VIP - cần đăng nhập */}
      <Route
        path="/member"
        element={
          <ProtectedMemberRoute>
            <>
              <NavBarMember />
              <div style={{ margin: "10px 0" }} />
              <Outlet />
              <div style={{ margin: "300px 0" }} />
              <ChatAI />
              <FooterMember />
            </>
          </ProtectedMemberRoute>
        }
      >
        <Route index element={<Member />} />
        <Route path="basic-tracking" element={<BasicTracking />} />
        <Route path="calendar" element={<CalendarAll />} />
        <Route path="calendar/history" element={<CalendarHistory />} />
        <Route path="calendar/change/:remindId" element={<CalendarChange />} />
        <Route path="calendar/detail/:remindId" element={<CalendarDetail />} />
        <Route path="doctor-notes" element={<DoctorNotes />} />
        <Route path="community" element={<Community />} />
        <Route path="blog" element={<Blog />}>
          <Route index element={<BlogAll />} />
          <Route path=":id" element={<BlogDetail />} />
        </Route>
        <Route path="profile/edit" element={<EditProfile />} />
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
        <Route path="growth-standard" element={<GrowthStandardList />} />
      </Route>

      {/* Route 404 Not Found */}
      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
