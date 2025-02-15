import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Features from "./components/Features/Features";
import BlogPosts from "./components/BlogPosts/BlogPosts";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";
import Dashboard from "./Dashboard/dashboard";
import Register from "./register/Register";
import Login from "./Login/login";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";

function App() {
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
    
  );
}

export default App;
