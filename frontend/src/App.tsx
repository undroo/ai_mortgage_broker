import React from 'react';
import Chat from './components/Chat';
import './App.css';

function App() {
  return (
    <div className="site-wrapper">
      <header className="site-header">
        <nav className="navbar">
          <div className="site-name">Mortgage Mate</div>
        </nav>
      </header>
      <section className="hero-section">
        <h1 className="hero-headline">Get instant answers to your mortgage questions.</h1>
        <p className="hero-subtitle">Your free, friendly mortgage assistant.</p>
      </section>
      <main className="main-content">
        <div className="chatbot-card">
          <Chat />
        </div>
      </main>
      <footer className="site-footer">
        <p className="footer-disclaimer">This is not financial advice. For professional help, speak to a licensed mortgage broker.</p>
      </footer>
    </div>
  );
}

export default App;
