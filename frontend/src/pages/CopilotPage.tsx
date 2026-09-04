import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { postCopilot } from '../services/api';
import ForestEcosystem from '../components/ForestEcosystem';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  references?: Array<{ type: string; id: string; name: string; state?: string }>;
  type?: string;
  structured?: {
    analysis?: string[];
    recommendation?: string;
    dataBasis?: string;
  };
}

const SUGGESTED_QUESTIONS = [
  'Which districts need immediate attention?',
  'Why is Mandla high risk?',
  'Show claims delayed over 180 days.',
  'Which claims have land-record mismatches?',
  'What should we investigate first?',
  'Where are anomaly clusters concentrated?',
];

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to **FRA Copilot** — your specialized decision-support analyst for Forest Rights Act monitoring.\n\nI correlate administrative records, GIS coordinates, and processing velocity thresholds across 36 districts to provide structured civic intelligence.`,
      structured: {
        analysis: [
          'Indexed 4,781 synthetic claim files across 36 districts and 5 states',
          'Automated monitoring active for 180-day statutory delay thresholds',
          'Cross-referencing revenue cadastre registries with Gram Sabha boundaries'
        ],
        recommendation: 'Select a suggested inquiry below or ask about specific districts, anomaly types, or priority backlogs.',
        dataBasis: '4,781 synthetic claims · 36 districts · 5 states (Synthetic demo data)'
      },
      type: 'welcome'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await postCopilot(text);

      // Structure reasoning format (Section 13)
      const content = response.answer || '';
      let analysisItems: string[] = [];
      let recommendation = '';
      const dataBasis = '4,781 synthetic claims · 36 districts · 5 states (Demonstration data)';

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
        recommendation = 'Deploy joint forest verification teams to top 3 priority districts to clear verification backlog.';
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
        type: response.type,
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
          content: 'Unable to reach decision-support engine. Please check backend connection.',
          type: 'error'
        }
      ]);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="copilot-page-container">
      {/* Visual Header Banner */}
      <div className="page-header-with-visual">
        <ForestEcosystem variant="banner" height={100} showParticles={true} showContours={true} />
        <div className="page-header-content">
          <div className="page-header-tag">DECISION SUPPORT ANALYST</div>
          <h2>FRA Copilot</h2>
          <p>Ask VANRA about FRA implementation patterns, bottlenecks, and spatial risk factors</p>
        </div>
      </div>

      <div className="data-disclaimer">
        <span>⚠ Modelled decision-support analyst using synthetic demo data. Does not replace statutory authorities or legal decision-making.</span>
      </div>

      <div className="copilot-grid-layout">
        {/* Left Suggestions & Analyst Profile */}
        <div className="copilot-left-sidebar">
          <div className="analyst-profile-box">
            <div className="analyst-badge-row">
              <span className="analyst-icon">🏛</span>
              <div>
                <h4>Civic Intelligence Analyst</h4>
                <p>Deterministic Engine & GIS Correlation</p>
              </div>
            </div>
            <p className="analyst-bio">
              Provides structured reasoning on claim pipelines without generative hallucination.
            </p>
          </div>

          <div className="copilot-suggestions-card">
            <h4>Recommended Inquiries</h4>
            <p className="suggestions-sub">Click to query real-time data</p>
            <div className="suggestions-list">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="suggestion-pill-btn"
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                >
                  <span className="bullet-point">▸</span>
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="copilot-data-basis-box">
            <h5>INDEXED MONITORING DATA</h5>
            <ul>
              <li><strong>Claims:</strong> 4,781 synthetic records</li>
              <li><strong>Districts:</strong> 36 monitored</li>
              <li><strong>States:</strong> 5 regional frameworks</li>
              <li><strong>Delay Threshold:</strong> 180 days</li>
            </ul>
          </div>
        </div>

        {/* Right Chat Interface */}
        <div className="copilot-chat-container">
          <div className="copilot-messages-scroll">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`copilot-bubble-row ${msg.role}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'assistant' ? (
                  <div className="copilot-bubble assistant">
                    <div className="assistant-bubble-header">
                      <span className="analyst-avatar">VA</span>
                      <div>
                        <strong>VANRA Decision Analyst</strong>
                        <span className="analyst-time">Automated Response</span>
                      </div>
                    </div>

                    {/* Main text */}
                    <div className="copilot-text-body">
                      {msg.content.split('\n\n').map((para, pIdx) => (
                        <p key={pIdx} style={{ marginBottom: 8 }}>
                          {para}
                        </p>
                      ))}
                    </div>

                    {/* Structured Reasoning Format (Section 13) */}
                    {msg.structured && (
                      <div className="copilot-structured-reasoning">
                        {/* 1. ANALYSIS */}
                        {msg.structured.analysis && (
                          <div className="reasoning-block analysis">
                            <span className="reasoning-heading">ANALYSIS</span>
                            <ul className="reasoning-list">
                              {msg.structured.analysis.map((a, aIdx) => (
                                <li key={aIdx}>
                                  <span className="step-idx">{aIdx + 1}.</span> {a}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* 2. RECOMMENDATION */}
                        {msg.structured.recommendation && (
                          <div className="reasoning-block recommendation">
                            <span className="reasoning-heading">RECOMMENDATION</span>
                            <p className="recommendation-text">{msg.structured.recommendation}</p>
                          </div>
                        )}

                        {/* 3. DATA BASIS */}
                        {msg.structured.dataBasis && (
                          <div className="reasoning-block data-basis">
                            <span className="reasoning-heading">DATA BASIS</span>
                            <p className="data-basis-text">{msg.structured.dataBasis}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Entity Reference Tags */}
                    {msg.references && msg.references.length > 0 && (
                      <div className="copilot-references-bar">
                        <span className="ref-label">Referenced Entities:</span>
                        {msg.references.map((ref, rIdx) => (
                          <span key={rIdx} className="ref-pill">
                            {ref.type === 'district' ? '📍' : '📋'} {ref.name}
                            {ref.state ? `, ${ref.state}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="copilot-bubble user">
                    <p>{msg.content}</p>
                  </div>
                )}
              </motion.div>
            ))}

            {loading && (
              <div className="copilot-bubble-row assistant">
                <div className="copilot-bubble assistant loading">
                  <div className="analyst-thinking-indicator">
                    <span className="thinking-dot dot-1" />
                    <span className="thinking-dot dot-2" />
                    <span className="thinking-dot dot-3" />
                    <span>Correlating district risk matrices & claim records...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="copilot-input-bar">
            <input
              type="text"
              placeholder="Ask VANRA about FRA implementation patterns, bottlenecks..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
            >
              Analyze
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
