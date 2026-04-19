import React from 'react';
import { NavLink } from 'react-router-dom';
import './Home.css';

const skills = [
  { name: 'Python', icon: '🐍', color: '#6ee7b7' },
  { name: 'HTML/CSS', icon: '🎨', color: '#f472b6' },
  { name: 'JavaScript', icon: '⚡', color: '#fbbf24' },
  { name: 'React', icon: '⚛️', color: '#818cf8' },
  { name: 'AI / ML', icon: '🤖', color: '#34d399' },
  { name: 'Git & GitHub', icon: '🗂️', color: '#fb923c' },
];

function Home() {
  return (
    <main className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-noise" />
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">Available for internships</div>
          <h1 className="hero-title">
            Hi, I'm <span className="gradient-text">Vivardhan</span>
            <br />Reddy
          </h1>
          <p className="hero-sub">
            A Computer Science student at Mahindra University passionate about building intelligent systems and clean web experiences.
          </p>
          <div className="hero-actions">
            <NavLink to="/projects" className="btn-primary">View Projects →</NavLink>
            <a href="mailto:vivardhan146290@gmail.com" className="btn-ghost">Get in touch</a>
          </div>
        </div>
        <div className="hero-avatar">
          <div className="avatar-ring">
            <div className="avatar-inner">
              <span className="avatar-initials">VR</span>
            </div>
          </div>
          <div className="avatar-tag tag-1">Python 🐍</div>
          <div className="avatar-tag tag-2">React ⚛️</div>
          <div className="avatar-tag tag-3">AI/ML 🤖</div>
        </div>
      </section>

      {/* About */}
      <section className="section about-section">
        <div className="section-label">About Me</div>
        <div className="about-grid">
          <div className="about-text">
            <h2 className="section-title">Driven by curiosity,<br />powered by code.</h2>
            <p>
              I'm <strong>Vivardhan Reddy</strong>, a B.Tech student in Computer Science at Mahindra University, Hyderabad.
              I love solving real-world problems through machine learning, data analysis, and modern web technologies.
            </p>
            <p>
              My research interests lie at the intersection of <em>Artificial Intelligence</em>, <em>Data Science</em>, and
              full-stack development — building systems that are not just functional, but meaningful.
            </p>
          </div>
          <div className="about-details-card">
            <div className="detail-row">
              <span className="detail-label">🎓 University</span>
              <span>Mahindra University, Hyderabad</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">📧 Personal</span>
              <a href="mailto:vivardhan146290@gmail.com">vivardhan146290@gmail.com</a>
            </div>
            <div className="detail-row">
              <span className="detail-label">🏫 College</span>
              <a href="mailto:se23uvse006@mahindrauniversity.edu.in">se23uvse006@mahindrauniversity.edu.in</a>
            </div>
            <div className="detail-row">
              <span className="detail-label">📱 Phone</span>
              <span>+91 995xxxxxxx</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">💼 GitHub</span>
              <a href="https://github.com/Vivardhan02" target="_blank" rel="noreferrer">github.com/Vivardhan02 ↗</a>
            </div>
          </div>
        </div>
      </section>

      {/* Research Interests */}
      <section className="section interests-section">
        <div className="section-label">Research Interests</div>
        <h2 className="section-title">What I'm exploring</h2>
        <div className="interests-grid">
          {[
            { icon: '🧠', title: 'Machine Learning', desc: 'Building predictive models and exploring supervised/unsupervised learning techniques.' },
            { icon: '📊', title: 'Data Science', desc: 'Deriving actionable insights from complex datasets through analysis and visualization.' },
            { icon: '🌐', title: 'Web Development', desc: 'Crafting fast, accessible, and beautiful web experiences with modern frameworks.' },
            { icon: '🔬', title: 'AI Applications', desc: 'Applying AI to solve real-world challenges in business, health, and beyond.' },
          ].map((item) => (
            <div className="interest-card" key={item.title}>
              <span className="interest-icon">{item.icon}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="section skills-section">
        <div className="section-label">Skills</div>
        <h2 className="section-title">My toolkit</h2>
        <div className="skills-grid">
          {skills.map((skill) => (
            <div className="skill-chip" key={skill.name} style={{ '--chip-color': skill.color }}>
              <span>{skill.icon}</span>
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section cta-section">
        <div className="cta-card">
          <h2>Want to see what I've built?</h2>
          <p>Check out my projects — from ML models to full-stack apps.</p>
          <NavLink to="/projects" className="btn-primary">Explore Projects →</NavLink>
        </div>
      </section>
    </main>
  );
}

export default Home;
