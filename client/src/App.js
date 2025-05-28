import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DiscoverPage from "./pages/DiscoverPage";
import GoogleCallback from "./pages/GoogleCallback";
import SignUpPage from "./pages/SignUpPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/oauth2/redirect/google" element={<GoogleCallback />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
      </Routes>
    </Router>
  );
}
