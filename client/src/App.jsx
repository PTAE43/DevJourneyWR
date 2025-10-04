import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Layout/Navbar";
import HeroSection from "./pages/Home/HeroSection";
import ArticleSection from "./pages/Home/ArticleSection";
import Footer from "./components/Layout/Footer";
import SiglePost from "./pages/Blog/SiglePost";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import RegisterSuccess from "./pages/Auth/RegisterSuccess";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import ProfilePage from "./pages/Auth/Profile";
import ResetPassword from "./pages/Auth/ResetPassword";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<><HeroSection /><ArticleSection /></>} />
            <Route path="/posts/:id" element={<SiglePost />} />
            <Route path="/login" element={<Login />} />

            {/* ต้องล็อกอินก่อน */}
            <Route element={<RequireAuth />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/reset" element={<ResetPassword />} />
            </Route>

            {/* สมัครสมาชิก */}
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<RegisterSuccess />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
