import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Features from "./components/Features/Features";
import BlogPage from "./components/BlogPage/BlogPage";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";
import Dashboard from "./components/Dashboard/Dashboard";
import Register from "./Register/Register";
import Login from "./Login/Login";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";

function App() {
<<<<<<< HEAD
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <div style={{ padding: "20px", textAlign: "right" }}>
            <Link
              to="/admin"
              style={{
                padding: "10px 20px",
                backgroundColor: "#1976d2",
                color: "white",
                textDecoration: "none",
                borderRadius: "4px",
                display: "inline-block",
              }}
            >
              Truy cập Admin
            </Link>
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <main>
                  <Hero />
                  <Features />
                  <BlogPage />
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
  
          </Routes>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
=======
  return (<>
  <Router>
      <div className="app">
       <Header />
        <Routes>
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </div>
    </Router></>
    
>>>>>>> 33580e55b394c2adeab1dedf17b78d82e00ef21f
  );
}

export default App;