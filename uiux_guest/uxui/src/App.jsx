import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import BlogPosts from "./components/BlogPosts";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import Dashboard from "./Dashboard/dashboard";
import Register from "./register/Register";
import Login from "./Login/login";

function App() {
  return (
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
    </Router>
  );
}

export default App;
