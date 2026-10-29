import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode, CheckCircle2 } from 'lucide-react';
import { VERILOG_SOURCES } from '../data/processorData';

export default function SourceCodeViewer() {
  const fileKeys = Object.keys(VERILOG_SOURCES);
  const [selectedFile, setSelectedFile] = useState(fileKeys[0]);
  const [copied, setCopied] = useState(false);

  const activeSource = VERILOG_SOURCES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSource.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeLines = activeSource.code.split('\n');

  return (
    <section id="source" className="section">
      <div className="container">
        <div className="section-title-wrap">
          <div className="section-tag">
            <Code2 size={14} />
            <span>Verilog HDL Implementation</span>
          </div>
          <h2 className="section-title">Synthesizable Verilog Source Code</h2>
          <p className="section-subtitle">
            Browse the complete synthesizable Verilog-2001 RTL modules and self-checking testbench.
            All code conforms to IEEE 1364-2001 standards and is 100% latch-free.
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          marginBottom: '1.25rem'
        }}>
          {fileKeys.map((file) => (
            <button
              key={file}
              className={`btn btn-sm ${selectedFile === file ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                setSelectedFile(file);
                setCopied(false);
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
                gap: '0.4rem'
              }}
            >
              <FileCode size={14} />
              <span>{file}</span>
            </button>
          ))}
        </div>

        {/* Code Container */}
        <div className="card-elevated" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Header bar */}
          <div style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.85rem 1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>{selectedFile}</span>
                <span className="badge badge-sky">{activeSource.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  Path: {activeSource.path}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                {activeSource.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {codeLines.length} lines
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCopy}
                style={{ gap: '0.4rem' }}
              >
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy RTL'}</span>
              </button>
            </div>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div style={{
            background: '#020617',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            lineHeight: 1.6,
            maxHeight: '600px',
            overflowY: 'auto',
            display: 'flex'
          }}>
            {/* Line numbers column */}
            <div style={{
              userSelect: 'none',
              padding: '1rem 0.75rem',
              textAlign: 'right',
              color: 'var(--text-muted)',
              borderRight: '1px solid var(--border-subtle)',
              background: 'rgba(3, 7, 18, 0.6)',
              minWidth: '45px'
            }}>
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code text column */}
            <div style={{ padding: '1rem', overflowX: 'auto', flex: 1, color: '#f1f5f9' }}>
              <pre style={{ margin: 0 }}>
                <code>{activeSource.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

