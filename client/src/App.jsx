import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Shell
import SiteShell from "./components/Layout/SiteShell";

// หน้าเว็บปกติ
import HeroSection from "./pages/Home/HeroSection";
import ArticleSection from "./pages/Home/ArticleSection";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import RegisterSuccess from "./pages/Auth/RegisterSuccess";
import RequireAuth from "./components/RequireAuth/RequireAuth";
import ProfilePage from "./pages/Auth/Profile";
import ResetPassword from "./pages/Auth/ResetPassword";
import ProfileLayout from "./components/Layout/ProfileLayout";
import SiglePost from "./pages/Blog/SiglePost";

// แอดมิน
import RequireAdmin from "./components/RequireAuth/RequireAdmin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminProfile from "./pages/Admin/AdminProfile";
import AdminArticles from "./pages/Admin/AdminArticles";
import AdminCategories from "./pages/Admin/AdminCategories";
import AdminNotifications from "./pages/Admin/AdminNotifications";
import AdminResetPassword from "./pages/Admin/AdminResetPassword";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* กลุ่มหน้าเว็บปกติ */}
        <Route element={<SiteShell />}>
          <Route path="/" element={<><HeroSection /><ArticleSection /></>} />
          <Route path="/posts/:slugOrId" element={<SiglePost />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<RegisterSuccess />} />

          {/* user */}
          <Route element={<RequireAuth />}>
            <Route path="/profile" element={<ProfileLayout />}>
              <Route index element={<ProfilePage />} />
              <Route path="reset" element={<ResetPassword />} />
            </Route>
          </Route>
        </Route>

        {/* แอดมิน */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminProfile />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="articles" element={<AdminArticles />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="reset" element={<AdminResetPassword />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}
