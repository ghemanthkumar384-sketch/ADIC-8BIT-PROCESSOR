import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProjectOverview from './components/ProjectOverview';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import InstructionSetSection from './components/InstructionSetSection';
import RegisterFileViewer from './components/RegisterFileViewer';
import AluExplorer from './components/AluExplorer';
import PipelineExplorer from './components/PipelineExplorer';
import VerificationCenter from './components/VerificationCenter';
import SourceCodeViewer from './components/SourceCodeViewer';
import DocumentationViewer from './components/DocumentationViewer';
import Footer from './components/Footer';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 75;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Track active section during scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'architecture', 'isa', 'registers', 'alu', 'pipeline', 'verification', 'source', 'docs'];
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sections[i]);
        if (sec && sec.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeSection={activeSection} onNavigate={scrollToSection} />

      <main style={{ flex: 1 }}>
        <ProjectOverview onNavigate={scrollToSection} />
        <ArchitectureDiagram />
        <InstructionSetSection />
        <RegisterFileViewer />
        <AluExplorer />
        <PipelineExplorer />
        <VerificationCenter />
        <SourceCodeViewer />
        <DocumentationViewer />
      </main>

      <Footer />
    </div>
  );
}

