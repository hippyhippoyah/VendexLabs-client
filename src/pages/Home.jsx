import vendexLogo from '../assets/logo.png'
import '../App.css'
import './Home.css'
import Navbar from '../components/Navbar'
import { getEmailClaim } from '../utils/apis'

function Home({ onSignOut }) {
  return (
    <>
      <Navbar />
      <main className="home-main">
        <section className="about-section">
          <h1>Welcome to VendexLabs</h1>
          <img src={vendexLogo} alt="VendexLabs Logo" className="logo" />
        </section>
      </main>
      <div>
        <h3>Signed in to {getEmailClaim()}</h3>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </>
  )
}

export default Home
