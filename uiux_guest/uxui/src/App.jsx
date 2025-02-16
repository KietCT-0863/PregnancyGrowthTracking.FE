import React, { use } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Features from "./components/Features/Features";
import BlogPosts from "./components/BlogPosts/BlogPosts";
import CTA from "./components/CTA/CTA";
import Footer from "./components/Footer/Footer";
import Dashboard from "./components/Dashboard/dashboard";
import Register from "./Register/Register";
import Login from "./Login/Login";
import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import UseTheme from "./hooks/UseTheme";
import "./hooks/UseTheme.css";

function App() {
  const [theme,toggleTheme] = UseTheme();
  return (<>
  <Router>
      <div className="app">
      <button onClick={toggleTheme}>
        {theme === "light" ? "🌙" : "☀️"} { theme === "light" ? "Dark" : "Light" } Mode
       </button>
       <Header  />
      
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
