import React, { useState } from 'react';
import { Cpu, CheckCircle2, Menu, X, Code2, Layers, BookOpen, Terminal, Activity, FileText } from 'lucide-react';

export default function Navbar({ activeSection, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Cpu },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'isa', label: 'Instruction Set', icon: BookOpen },
    { id: 'registers', label: 'Registers', icon: Layers },
    { id: 'alu', label: 'ALU Explorer', icon: Activity },
    { id: 'pipeline', label: 'Pipeline Stepper', icon: Activity },
    { id: 'verification', label: 'Verification', icon: CheckCircle2 },
    { id: 'source', label: 'Verilog RTL', icon: Code2 },
    { id: 'docs', label: 'Docs', icon: FileText }
  ];

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <div className="nav-logo" onClick={() => handleNavClick('overview')} style={{ cursor: 'pointer' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            padding: '0.45rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(14, 165, 233, 0.4)'
          }}>
            <Cpu size={22} color="#030712" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ADIC 8-BIT RISC
              <span className="badge badge-sky">3-STAGE</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Verilog-2001 • Vivado Ready
            </div>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div style={{ display: 'none', md: 'flex' }} className="status-pill-desktop">
          <div className="badge badge-emerald" style={{ padding: '0.35rem 0.75rem', gap: '0.5rem' }}>
            <CheckCircle2 size={14} />
            <span>32 / 32 Checks Verified</span>
          </div>
        </div>

        {/* Desktop Links */}
        <ul className="nav-links">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id);
                }}
                href={`#${item.id}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu">
          <div className="badge badge-emerald" style={{ alignSelf: 'flex-start', padding: '0.35rem 0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle2 size={14} />
            <span>32 / 32 Checks Verified</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  background: activeSection === item.id ? 'var(--bg-chip)' : 'transparent',
                  color: activeSection === item.id ? 'var(--accent-sky)' : 'var(--text-main)',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </nav>
  );
}

