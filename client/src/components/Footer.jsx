import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <section className="footer-area">
      <div className="footer-inner">
        <div className="footer-logo">
          <span role="img" aria-label="film icon">🎬</span> ReelFeel
        </div>
        <div className="footer-social">
          <a href="#" aria-label="Instagram"><i className="fab fa-instagram" /></a>
          <a href="#" aria-label="Help"><i className="fas fa-circle-question" /></a>
          <a href="#" aria-label="TikTok"><i className="fab fa-tiktok" /></a>
        </div>
        <div className="footer-copy">© 2024 ReelFeel. All rights reserved.</div>
      </div>
    </section>
  );
}
