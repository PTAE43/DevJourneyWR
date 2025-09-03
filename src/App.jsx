import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Footer from './components/Footer';
import ArticleSextion from './components/ArticleSection';
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
