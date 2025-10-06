import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Layout/Navbar";
import HeroSection from "./pages/Home/HeroSection";
import ArticleSection from "./pages/Home/ArticleSection";
import Footer from "./components/Layout/Footer";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegisterSuccess from "./pages/Auth/RegisterSuccess";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import ProfilePage from "./pages/Auth/Profile";
import ResetPassword from "./pages/Auth/ResetPassword";
import ProfileLayout from "./components/Layout/ProfileLayout";
import SiglePost from "./pages/Blog/SiglePost";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-1 md:mt-[35px]">
          <Routes>
            <Route path="/" element={<><HeroSection /><ArticleSection /></>} />
            <Route path="/posts/:slugOrId" element={<SiglePost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/success" element={<RegisterSuccess />} />
            <Route element={<RequireAuth />}>
              <Route path="/profile" element={<ProfileLayout />}>
                <Route index element={<ProfilePage />} />
                <Route path="reset" element={<ResetPassword />} />
              </Route>
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
