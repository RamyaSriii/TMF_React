import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI-Powered Detection',
    desc: 'Deep CNN trained on 87,000+ images across 38 plant disease classes for accurate, instant diagnosis.'
  },
  {
    icon: '💊',
    title: 'Pesticide Recommendations',
    desc: 'Get specific chemical and organic treatment options matched precisely to the identified disease.'
  },
  {
    icon: '📷',
    title: 'Camera or Upload',
    desc: 'Capture a live photo with your phone camera or upload an existing image from your gallery.'
  },
  {
    icon: '⚡',
    title: 'Instant Results',
    desc: 'Results delivered in under 2 seconds with confidence score and severity assessment.'
  },
  {
    icon: '🌿',
    title: '14 Plant Species',
    desc: 'Covers Apple, Tomato, Potato, Corn, Grape, Pepper, Peach, Cherry, Strawberry and more.'
  },
  {
    icon: '🛡️',
    title: 'Prevention Guidance',
    desc: 'Beyond treatment — get precautions and prevention strategies to protect future crops.'
  },
];

const PLANTS = [
  { name: 'Apple',       emoji: '🍎', diseases: 3 },
  { name: 'Tomato',      emoji: '🍅', diseases: 9 },
  { name: 'Potato',      emoji: '🥔', diseases: 2 },
  { name: 'Corn',        emoji: '🌽', diseases: 3 },
  { name: 'Grape',       emoji: '🍇', diseases: 3 },
  { name: 'Pepper',      emoji: '🫑', diseases: 1 },
  { name: 'Peach',       emoji: '🍑', diseases: 1 },
  { name: 'Cherry',      emoji: '🍒', diseases: 1 },
  { name: 'Strawberry',  emoji: '🍓', diseases: 1 },
  { name: 'Orange',      emoji: '🍊', diseases: 1 },
  { name: 'Soybean',     emoji: '🫘', diseases: 0 },
  { name: 'Squash',      emoji: '🎃', diseases: 1 },
];

export default function HomePage() {
  return (
    <div className="home">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-orbs">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="container hero__inner">
          <div className="hero__badge badge badge-green animate-fade-in">
            <span>✦</span> AI Plant Pathology
          </div>

          <h1 className="hero__title animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Diagnose Plant<br />
            <span className="hero__title-accent">Diseases Instantly</span>
          </h1>

          <p className="hero__subtitle animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Upload a photo of any leaf and get an AI-powered diagnosis with
            pesticide recommendations in seconds. Protect your crops before it's too late.
          </p>

          <div className="hero__ctas animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/predict" className="btn btn-primary hero__cta-primary">
              <span>🔬</span> Analyze Your Plant
            </Link>
            <a href="#features" className="btn btn-secondary">
              Learn More
            </a>
          </div>

          <div className="hero__stats animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat">
              <span className="stat__value">38</span>
              <span className="stat__label">Disease Classes</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__value">87K+</span>
              <span className="stat__label">Training Images</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat__value">&lt; 2s</span>
              <span className="stat__label">Analysis Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-green">Capabilities</span>
            <h2>Everything you need to protect your crops</h2>
            <p>Built on the PlantVillage dataset with a custom CNN architecture</p>
          </div>

          <div className="features__grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="feature-card card animate-fade-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Supported Plants ──────────────────────────────────── */}
      <section className="plants-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-green">Coverage</span>
            <h2>Supported Plant Species</h2>
            <p>Hover to see disease detection count per plant</p>
          </div>

          <div className="plants__grid">
            {PLANTS.map((plant, i) => (
              <div key={i} className="plant-chip">
                <span className="plant-chip__emoji">{plant.emoji}</span>
                <span className="plant-chip__name">{plant.name}</span>
                <span className="plant-chip__count badge badge-gray">
                  {plant.diseases} disease{plant.diseases !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <span className="badge badge-green">Process</span>
            <h2>How PhytoScan Works</h2>
          </div>

          <div className="steps">
            {[
              { n: '01', icon: '📸', title: 'Capture or Upload', desc: 'Take a clear photo of the affected leaf using your camera or upload an existing image.' },
              { n: '02', icon: '⚙️', title: 'AI Analysis',       desc: 'Our CNN preprocesses and classifies your image against 38 disease patterns in under 2 seconds.' },
              { n: '03', icon: '📋', title: 'Get Diagnosis',     desc: 'Receive disease name, confidence score, severity level, and a full pesticide recommendation.' },
              { n: '04', icon: '🌱', title: 'Take Action',       desc: 'Apply the recommended treatment and follow prevention steps to protect future crops.' },
            ].map((step, i) => (
              <div key={i} className="step animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step__number">{step.n}</div>
                <div className="step__icon">{step.icon}</div>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__desc">{step.desc}</p>
                {i < 3 && <div className="step__connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-banner__inner">
            <div className="cta-banner__text">
              <h2>Ready to diagnose your plants?</h2>
              <p>Free, instant, and requires no account. Just upload and scan.</p>
            </div>
            <Link to="/predict" className="btn btn-primary cta-banner__btn">
              <span>🚀</span> Start Free Scan
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container">
          <p className="footer__text">
            🌿 <strong>PhytoScan</strong> — AI Plant Disease Detection &nbsp;·&nbsp;
            Powered by TensorFlow &amp; PlantVillage Dataset
          </p>
          <p className="footer__disclaimer">
            For informational purposes only. Always consult a certified agronomist for professional guidance.
          </p>
        </div>
      </footer>
    </div>
  );
}
