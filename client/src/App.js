import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DiscoverPage from "./pages/DiscoverPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
      </Routes>
    </Router>
  );
}
