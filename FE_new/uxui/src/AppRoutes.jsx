import { Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Blog from "./pages/blog/index";
import Login from "./pages/Login/Login";
import BlogAll from "./pages/blog/BlogAll";
import BlogDetail from "./pages/blog/BlogDetail";
import Guest from "../layout/Guest/Guest";
import Register from "./pages/Register/Register";
import BasicTracking from "./pages/BasicTracking/BasicTracking";
import Layout from "../layout/Layout";
import AdminLayout from "../layout/AdminLayout/AdminLayout";
import Dashboard from "./pages/DashBoardAdmin/DashBoard";
import UserManagement from "./pages/UserManagementAmin/UserManagement";
import BlogManagement from "./pages/BlogManagement/BlogManagement";

// Hàm bọc các thành phần trong Layout
const withLayout = (Component) => (
  <Layout>
    {Component}
  </Layout>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Guest />}>
        <Route index element={<Home />} />
      </Route>

      {/** Định nghĩa các route trong mảng **/}
      { [
        { path: "/blog", element: <Blog />, index: <BlogAll /> },
        { path: "/basictracking", element: <BasicTracking /> },
        { path: "/login", element: <Login /> },
        { path: "/register", element: <Register /> },
      ].map(({ path, element, index }) => (
        <Route
          key={path}
          path={path}
          element={withLayout(element)}
        >
          {index && <Route index element={index} />}
          {path === "/blog" && <Route path=":id" element={<BlogDetail />} />}
        </Route>
      ))}

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="blogs" element={<BlogManagement />} />
      </Route>

      <Route path="*" element={<h1>Not Found</h1>} />
    </Routes>
  );
};

export default AppRoutes;
