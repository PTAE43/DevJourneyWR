import NavBar from './components/Navbar';
import HeroSection from './components/HeroSection';
import './App.css';
import { Button } from "@/components/ui/button";

function App() {
  return (
    <>
      {/*Navbar*/}
      <NavBar />

      {/*Herosection*/}
      <HeroSection />
      <Button>Hello world</Button>
    </>
  )
}

export default App;
