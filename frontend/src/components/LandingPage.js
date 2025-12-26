import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; 

// --- DATA CONSTANTS ---
const PROGRAMS = [
  {
    title: "Weight Loss",
    desc: "Shed fat and boost metabolism with high-intensity interval training tailored for rapid results.",
    img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Muscle Building",
    desc: "Hypertrophy-focused routines designed to maximize muscle growth and strength gains.",
    img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Strength & Mobility",
    desc: "Build functional strength while improving flexibility and joint health for longevity.",
    img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&w=800&q=80"
  }
];

const TRANSFORMATIONS = [
  {
    name: "Leslie Alexander",
    result: "Lost 18kg in 4 months",
    program: "Fat Loss Program",
    before: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=60",
    after: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=60"
  },
  {
    name: "Jacob Jones",
    result: "Gained 5kg Muscle",
    program: "Hypertrophy X",
    before: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=60",
    after: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=400&q=60"
  }
];

const PRICING = [
  {
    plan: "Starter",
    price: "999",
    desc: "Perfect for beginners.",
    features: ["Beginner programs", "Weekly tracking", "Community access"],
    popular: false,
    btn: "btn-outline"
  },
  {
    plan: "Pro",
    price: "1999",
    desc: "For serious enthusiasts.",
    features: ["Advanced workouts", "Nutrition plans", "Trainer support", "Daily check-ins"],
    popular: true,
    btn: "btn-primary"
  },
  {
    plan: "Elite",
    price: "3499",
    desc: "1-on-1 Premium Coaching.",
    features: ["1-on-1 Coaching", "Custom Diet", "Video Form Analysis", "Priority Support"],
    popular: false,
    btn: "btn-outline"
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
          <Link to="/" className="brand">FitNix.</Link>
          
          <button 
            className="nav-toggle" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            ☰
          </button>

          <div className={`nav-right ${mobileOpen ? "open" : ""}`}>
            <Link to="/program" className="nav-link">Programs</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/auth/login" className="nav-link"> Login</Link>
            <Link to="/auth/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="badge badge-accent">⭐ Trusted by 2000+ Members</span>
            <h1>Build Your <br /><span className="text-accent">Strongest Self</span></h1>
            <p>FitNix helps you transform your body and mindset with expert-designed fitness programs and measurable results.</p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/auth/signup" className="btn btn-primary">Start Trial</Link>
              <Link to="/program" className="btn btn-outline">View Programs</Link>
            </div>

            {/* Stats */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat">
                  <h3>160+</h3>
                  <p>Trainers</p>
                </div>
                <div className="stat">
                  <h3>2k+</h3>
                  <p>Members</p>
                </div>
                <div className="stat">
                  <h3>92%</h3>
                  <p>Results</p>
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
            <h2>Our <span className="text-accent">Programs</span></h2>
            <p>Structured workouts designed by certified fitness experts for every goal.</p>
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
            <h2>Real <span className="text-accent">Results</span></h2>
            <p>See how FitNix has helped members transform their lives.</p>
          </div>

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

      {/* PRICING SECTION */}
      <section className="section" id="pricing">
        <div className="container">
          <div className="section-header">
            <h2>Simple <span className="text-accent">Pricing</span></h2>
            <p>No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid-3" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {PRICING.map((plan, index) => (
              <div key={index} className={`card pricing-card ${plan.popular ? 'popular' : ''}`}>
                {plan.popular && <div className="badge badge-accent" style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)' }}>Most Popular</div>}
                
                <h3>{plan.plan}</h3>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{plan.desc}</p>
                
                <div className="price">
                  ₹{plan.price}<span>/mo</span>
                </div>

                <ul className="features">
                  {plan.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                <Link to="/auth/signup" className={`btn ${plan.btn}`} style={{ textAlign: 'center' }}>
                  Choose Plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <Link to="/" className="brand">FitNix.</Link>
            <p style={{ marginTop: '1rem', color: '#9ca3af' }}>
              Train smarter. Live healthier. Join the revolution in fitness coaching today.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Product</h4>
            <ul>
              <li><Link to="/programs">Programs</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="container" style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
           © {new Date().getFullYear()} FitNix. All rights reserved.
        </div>
      </footer>
    </div>
  );
}