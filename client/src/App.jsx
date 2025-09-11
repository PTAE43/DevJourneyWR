import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Layout/Navbar";
import HeroSection from "./pages/Home/HeroSection";
import ArticleSection from "./pages/Home/ArticleSection";
import Footer from "./components/Layout/Footer";
import SiglePost from "./pages/Blog/SiglePost";
import Login from "./pages/About/Login";
import Register from "./pages/About/Register";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<><HeroSection /><ArticleSection /></>} />
            <Route path="/posts/:id" element={<><SiglePost /><Toaster /></>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
