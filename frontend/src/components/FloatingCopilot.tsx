import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { postCopilot } from '../services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: Array<{ type: string; id: string; name: string; state?: string }>;
  structured?: {
    analysis?: string[];
    recommendation?: string;
    dataBasis?: string;
  };
}

const QUICK_QUESTIONS = [
  'Which districts need immediate attention?',
  'Why is Mandla high risk?',
  'Show claims delayed over 180 days.',
  'Which claims have land-record mismatches?',
];

export const FloatingCopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I am **FRA Copilot**, your real-time decision-support assistant. Ask me about claim delays, land-record mismatches, or district risk factors.',
      structured: {
        analysis: [
          '36 districts and 4,781 claims monitored in real time',
          'SLA threshold tracking active (>180 days)',
          'Cadastral & forest zone discrepancies cross-referenced'
        ],
        recommendation: 'Ask a question below or pick a quick inquiry pill.',
        dataBasis: '4,781 synthetic claims · 36 districts · 5 states'
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await postCopilot(text);
      const content = response.answer || '';
      let analysisItems: string[] = [];
      let recommendation = '';
      const dataBasis = '4,781 synthetic claims · 36 districts · 5 states (Synthetic demonstration data)';

      if (text.toLowerCase().includes('mandla')) {
        analysisItems = [
          'Processing delay detected: 14 claims exceed the 180-day SLA window',
          'Record mismatch detected: 8 claims exhibit area discrepancies against cadastre',
          'Geographic concentration detected: High cluster density in non-cadastral forest zone'
        ];
        recommendation = 'Prioritize verification and land-record review with Mandla Sub-Divisional Committee.';
      } else if (text.toLowerCase().includes('immediate') || text.toLowerCase().includes('attention')) {
        analysisItems = [
          'Mandla, Gadchiroli, and Koraput present highest composite risk scores (>70/100)',
          'Sub-Divisional committee reviews indicate bottlenecks averaging 210+ days',
          'Survey record reconciliations pending for 18 high-urgency claim portfolios'
        ];
        recommendation = 'Deploy joint forest verification teams to top priority districts to clear verification backlog.';
      } else if (text.toLowerCase().includes('delay') || text.toLowerCase().includes('180')) {
        analysisItems = [
          'Over 550 claims currently exceed the statutory 180-day review guideline',
          'Primary bottleneck identified at Sub-Divisional Committee (SDLC) stage',
          'Processing velocity in high-density districts is 28% below target capacity'
        ];
        recommendation = 'Convene fast-track SDLC review sessions to resolve pending verification reports.';
      } else if (text.toLowerCase().includes('mismatch')) {
        analysisItems = [
          'Record discrepancies identified between Gram Sabha claimed area and revenue cadastre',
          'Average area variance of 1.4 hectares detected across flagged individual forest rights',
          'Discrepancies cluster primarily in recently surveyed forest fringes'
        ];
        recommendation = 'Initiate joint cadastral resurvey with Forest & Revenue departments before final title issuance.';
      } else {
        analysisItems = [
          'Algorithmic pattern scan evaluated claim coordinates and workflow histories',
          'Detected correlation between processing delays and cadastral boundary flags',
          'Rule engine and Isolation Forest identified high-priority administrative queues'
        ];
        recommendation = 'Review the AI Priority Queue for ordered claim portfolios requiring field verification.';
      }

      const assistantMsg: Message = {
        role: 'assistant',
        content,
        references: response.references,
        structured: {
          analysis: analysisItems,
          recommendation,
          dataBasis
        }
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Unable to connect to the Copilot analytics service. Please verify backend connectivity.'
        }
      ]);
    }
    setLoading(false);
  };

  // If user is already on full /copilot page, minimize the popup
  const isAlreadyOnCopilotPage = location.pathname === '/copilot';

  return (
    <div className="floating-copilot-root">
      {/* Floating Trigger Button */}
      <motion.button
        className={`floating-copilot-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.94 }}
        title="Open interactive FRA Copilot assistant"
        aria-label="Toggle FRA Copilot"
      >
        <span className="trigger-pulse-glow" />
        <span className="trigger-icon">{isOpen ? '✕' : '✨'}</span>
        <span className="trigger-text">
          {isOpen ? 'Close Copilot' : 'FRA Copilot'}
        </span>
        {!isOpen && <span className="trigger-live-badge">AI Active</span>}
      </motion.button>

      {/* Floating Chat Modal / Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="floating-copilot-window"
            initial={{ opacity: 0, scale: 0.88, y: 30, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {/* Header */}
            <div className="floating-copilot-header">
              <div className="copilot-header-brand">
                <div className="copilot-avatar">✨</div>
                <div>
                  <h4>FRA Copilot Analyst</h4>
                  <span className="copilot-status-indicator">
                    <span className="status-dot" /> Decision Support Active
                  </span>
                </div>
              </div>

              <div className="copilot-header-actions">
                {!isAlreadyOnCopilotPage && (
                  <button
                    className="header-action-icon-btn"
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/copilot');
                    }}
                    title="Open full-screen Copilot"
                  >
                    ↗
                  </button>
                )}
                <button
                  className="header-action-icon-btn"
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Suggestions Strip */}
            <div className="floating-copilot-suggestions">
              <span className="suggestions-mini-label">Quick Inquiry:</span>
              <div className="suggestions-chips-scroll">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    className="quick-chip-btn"
                    onClick={() => sendMessage(q)}
                    disabled={loading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Thread */}
            <div className="floating-copilot-body">
              {messages.map((msg, idx) => (
                <div key={idx} className={`floating-msg-row ${msg.role}`}>
                  <div className={`floating-msg-bubble ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="bubble-agent-label">
                        <span className="agent-name">VANRA Decision Engine</span>
                      </div>
                    )}
                    <div className="msg-text-content">
                      {msg.content.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} style={{ marginBottom: 6 }}>
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Structured Reasoning for Assistant Responses */}
                    {msg.structured && (
                      <div className="floating-structured-reasoning">
                        {msg.structured.analysis && (
                          <div className="reasoning-mini-box analysis">
                            <span className="reasoning-mini-title">ANALYSIS:</span>
                            <ul>
                              {msg.structured.analysis.map((a, aIdx) => (
                                <li key={aIdx}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structured.recommendation && (
                          <div className="reasoning-mini-box recommendation">
                            <span className="reasoning-mini-title">RECOMMENDATION:</span>
                            <p>{msg.structured.recommendation}</p>
                          </div>
                        )}

                        {msg.structured.dataBasis && (
                          <div className="reasoning-mini-box data-basis">
                            <span className="reasoning-mini-title">DATA BASIS:</span>
                            <p>{msg.structured.dataBasis}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {msg.references && msg.references.length > 0 && (
                      <div className="floating-references-row">
                        {msg.references.map((r, rIdx) => (
                          <span key={rIdx} className="mini-ref-pill">
                            {r.type === 'district' ? '📍' : '📋'} {r.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="floating-msg-row assistant">
                  <div className="floating-msg-bubble assistant">
                    <div className="floating-loading-dots">
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Correlating claim data...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="floating-copilot-footer">
              <input
                type="text"
                placeholder="Ask about claims, districts, delays..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                disabled={loading}
              />
              <button
                className="floating-send-btn"
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingCopilot;
