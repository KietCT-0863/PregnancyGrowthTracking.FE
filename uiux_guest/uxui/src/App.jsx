import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./Admin/admin";
import Orders from "./Admin/pages/Orders";
import Users from "./Admin/pages/Users";
import Blogs from "./Admin/pages/Blogs";
import Settings from "./Admin/pages/Settings";

import Features from "./components/Features/Features";
import BlogPosts from "./components/BlogPosts/BlogPosts";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";
import Dashboard from "./components/Dashboard/Dashboard";
import Register from "./Register/Register";
import Login from "./Login/login";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import Blog from "./features/blogs/Blogs";
import ScrollToTop from "./components/ScrollToTop/SrollToTop";
// import Home from "./components/Home/Home"; // Tạm thời comment lại

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}{" "}
            {/* Tạm thời comment lại */}
            <Route
              path="/"
              element={
                <main>
                  <Hero />
                  <Features />
                  <BlogPosts />
                  <CTA />
                </main>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute roles={["user"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/blogs" element={<Blogs />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </div>
      </Router>
      <ScrollToTop />
      <Footer />
   
    </AuthProvider>
  
  );
}

export default App;
