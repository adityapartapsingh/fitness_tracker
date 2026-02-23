import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; 

// --- DATA CONSTANTS ---
const PROGRAMS = [
  {
    title: "Workout Tracking",
    desc: "Log your exercises, sets, reps, and weight with our intuitive tracking interface. Monitor your progress in real-time.",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "AI Fitness Coach",
    desc: "Get personalized workout plans and fitness advice powered by AI. Your personal trainer in your pocket 24/7.",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Progress Analytics",
    desc: "Visualize your fitness journey with detailed charts, statistics, and streak tracking to stay motivated.",
    img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80"
  }
];

const TRANSFORMATIONS = [
  {
    name: "John Fitness Enthusiast",
    result: "🔥 180+ Workouts Logged",
    program: "Consistent Training",
    before: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=60",
    after: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=60"
  },
  {
    name: "Sarah Active Member",
    result: "💪 65-Day Workout Streak",
    program: "Daily Tracking",
    before: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=60",
    after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=60"
  }
];

// --- MAIN COMPONENT ---
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="landing-root">
      {/* NAVBAR */}
      <nav className="site-nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">Fitness Tracker</Link>
          
          <button 
            className="nav-toggle" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>

          <div className={`nav-right ${mobileOpen ? "open" : ""}`}>
            <Link to="/auth/login" className="nav-link">Login</Link>
            <Link to="/auth/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="badge badge-accent">⭐ Track • Achieve • Transform</span>
            <h1>Your Personal <br /><span className="text-accent">Fitness Journal</span></h1>
            <p>Log workouts, track progress, and achieve your fitness goals with our intelligent workout tracker powered by AI coaching.</p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/auth/signup" className="btn btn-primary">Start Trial</Link>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat">
                  <h3>500+</h3>
                  <p>Active Users</p>
                </div>
                <div className="stat">
                  <h3>50k+</h3>
                  <p>Workouts Logged</p>
                </div>
                <div className="stat">
                  <h3>99%</h3>
                  <p>Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-image-wrapper">
             <img 
               src="https://images.unsplash.com/photo-1549476464-37392f717541?auto=format&fit=crop&w=1000&q=80" 
               alt="Athlete Training" 
               className="hero-img"
             />
          </div>
        </div>
      </header>

      {/* PROGRAMS SECTION */}
      <section className="section" id="programs">
        <div className="container">
          <div className="section-header">
          <h2>Key <span className="text-accent">Features</span></h2>
          <p>Everything you need to track and improve your fitness journey.</p>
          </div>
          
          <div className="grid-3">
            {PROGRAMS.map((p, index) => (
              <div key={index} className="card">
                <img src={p.img} alt={p.title} />
                <div className="card-content">
                  <h3>{p.title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRANSFORMATIONS SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-header">
          <h2>Member <span className="text-accent">Success Stories</span></h2>
          <p>See how our members stay consistent and achieve their fitness goals.</p>
          </div>
          <p>See how our members stay consistent and achieve their fitness goals.</p>

          <div className="transform-grid">
            {TRANSFORMATIONS.map((t, index) => (
              <div key={index} className="transform-card">
                <div style={{ marginBottom: '1.5rem' }}>
                   <h3>{t.name}</h3>
                   <p className="text-accent" style={{ fontSize: '0.9rem' }}>{t.result}</p>
                   <p style={{ color: '#666', fontSize: '0.8rem' }}>Program: {t.program}</p>
                </div>
                <div className="comparison">
                  <div style={{ position: 'relative' }}>
                    <span style={{position:'absolute', top:5, left:5, background:'black', fontSize:'10px', padding:'2px 6px', borderRadius:4}}>Before</span>
                    <img src={t.before} alt="Before" />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <span style={{position:'absolute', top:5, left:5, background:'var(--accent)', color:'black', fontSize:'10px', padding:'2px 6px', borderRadius:4, fontWeight:'bold'}}>After</span>
                    <img src={t.after} alt="After" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand">Fitness Tracker</Link>
            <p style={{ marginTop: '1rem', color: '#9ca3af' }}>
              Track smarter. Progress faster. Achieve more. Your all-in-one fitness companion.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/auth/login">Login</Link></li>
              <li><Link to="/auth/signup">Sign Up</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><a href="mailto:support@fitnesstracker.com">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
           © {new Date().getFullYear()} Fitness Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
}