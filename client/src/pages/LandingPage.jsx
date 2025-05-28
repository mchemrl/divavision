import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

import SleepingTroll from '../assets/trolls/sleeping_troll.gif';
import Footer from '../components/Footer';

  export default function LandingPage() {
    const navigate = useNavigate();
    const handleLoginClick = (e) => {
      e.preventDefault();
      navigate('/login');
    };
    const handleSignUpClick = (e) => {
      e.preventDefault();
      navigate('/signup');
    };

  return (
    <div className="landing-page">
      <nav className="nav">
        <div className="nav-logo">🎬 Divavision</div>
        <ul className="nav-links">
          <li><a href="#movies">Movies</a></li>
          <li><a href="#lists">Lists</a></li>
        </ul>
        <div className="nav-actions">
          <button className="btn-outline" onClick={handleLoginClick}>Login</button>
          <button className="btn-primary" onClick={handleSignUpClick}>Sign Up</button>
        </div>
      </nav>

      <header className="hero">
        <h1 className="hero-title">Track, rate, and discover movies you love.</h1>
        <p className="hero-sub">
          Connect with friends, create lists, earn badges, and get personalized recommendations. Minimal, beautiful, and built for movie lovers like you.
        </p>
        <button className="btn-primary hero-btn" onClick={handleSignUpClick}>Get Started Free</button>
      </header>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">💡</div>
          <h3>Recommendations</h3>
          <p>Get recommendations based on your interests and personality.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⭐</div>
          <h3>Personal Ratings</h3>
          <p>Rate, review, and share your movie experiences with friends.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Vibe With Friends</h3>
          <p>Follow friends, compare moods, and vibe together over films.</p>
        </div>
      </section>

      <section className="vibe-section">
        <img src={SleepingTroll} alt="sleeping troll" className="vibe-image" />
        <div className="vibe-text">
          <h2>All your movie vibes, in one place</h2>
          <ul>
            <li>Track what you watch & how it makes you feel</li>
            <li>Mood journaling with every review</li>
            <li>Share mood-boards, playlists, and lists</li>
            <li>Connect & vibe with your friends</li>
          </ul>
        </div>
      </section>

      <section className="hot-section">
  <h2 className="hot-title">🔥 Hot Right Now</h2>
  <div className="hot-cards">
    <div className="hot-card">
      <div className="hot-header">
        <span className="hot-user">bimbim</span>
        <span className="hot-time">2h ago</span>
      </div>
      <div className="hot-movie">
        <span className="movie-icon">🎬</span>
        <strong>Barbie (2023)</strong>
      </div>
      <p className="hot-comment">s(he's) bro(ken)</p>
      <div className="hot-footer">
        <span className="hot-like">💗 27</span>
        <span className="hot-reply">💬 3</span>
      </div>
    </div>

    <div className="hot-card">
      <div className="hot-header">
        <span className="hot-user">Skylar R.</span>
        <span className="hot-time">5h ago</span>
      </div>
      <div className="hot-movie">
        <span className="movie-icon">🎬</span>
        <strong>A Minecraft Movie</strong>
      </div>
      <p className="hot-comment">
        the last time i was this horrified by minecraft content was when dream did his face reveal
      </p>
      <div className="hot-footer">
        <span className="hot-like">💗 19</span>
        <span className="hot-reply">💬 2</span>
      </div>
    </div>

    <div className="hot-card">
      <div className="hot-header">
        <span className="hot-user">Lila S.</span>
        <span className="hot-time">7h ago</span>
      </div>
      <div className="hot-movie">
        <span className="movie-icon">🎬</span>
        <strong>Spider-Man</strong>
      </div>
      <p className="hot-comment">
        Uncle Ben would be alive if Pro Wrestling had a union.
      </p>
      <div className="hot-footer">
        <span className="hot-like">💗 33</span>
        <span className="hot-reply">💬 7</span>
      </div>
    </div>
  </div>
</section>


      <Footer/>
    </div>
  );
}