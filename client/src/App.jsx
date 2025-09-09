import NavBar from './components/Layout/Navbar';
import HeroSection from './pages/Home/HeroSection';
import Footer from './components/Layout/Footer';
import ArticleSextion from './pages/Home/ArticleSection';
import './App.css';
import { Button } from "@/components/ui/button"


function App() {
  return (
    <>
      {/*Navbar*/}
      <NavBar />
      {/*Herosection*/}
      <HeroSection />
      <ArticleSextion />

      <div className="flex flex-wrap justify-center items-center gap-2 md:flex-row">
        <Button>Button</Button>
      </div>

      <Footer />
    </>
  )
}

export default App;
