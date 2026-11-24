import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ProjectIntroduction from './components/ProjectIntroduction.jsx'
import Flipbook from './components/Flipbook.jsx'
import ArtistProfile from './components/ArtistProfile.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectIntroduction />
        <Flipbook />
        <ArtistProfile />
      </main>
      <Footer />
    </>
  )
}
