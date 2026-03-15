import { useState, useRef, useEffect, useCallback } from 'react';
import '../../../styles/admin/agent-panel.css';

const AGENTS = {
  amp: {
    name: 'AMP',
    icon: '\u26A1',
    role: 'Web Designer',
    tagline: 'Ready to design something electric',
    intro: "I'm Amp, your web designer for your band. Let's build a site that hits as hard as the band. What are you thinking?",
    placeholder: 'Describe your vision...',
    accent: '#ff3250',
    accentEnd: '#ff6b35',
    darkText: false,
  },
  buzz: {
    name: 'BUZZ',
    icon: '\uD83D\uDCE1',
    role: 'Social Media',
    tagline: "Let's blow up the feeds",
    intro: "I'm Buzz, your social media strategist. Instagram, Facebook, YouTube — I'll help your band own every platform. What's the play?",
    placeholder: "What's the strategy?",
    accent: '#00b4ff',
    accentEnd: '#0066ff',
    darkText: false,
  },
  riff: {
    name: 'RIFF',
    icon: '\uD83C\uDFA4',
    role: 'Content Creator',
    tagline: 'Words that hit like a power chord',
    intro: "I'm Riff, your content creator. Captions, bios, gig announcements, press kits — I write copy that makes people feel the music. What do you need?",
    placeholder: 'What content do you need?',
    accent: '#ffc800',
    accentEnd: '#ff8c00',
    darkText: true,
  },
};

function AgentChat({ agent, messages, onSend, loading }) {
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [input, setInput] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="agent-chat">
      <div className="agent-chat__messages">
        {messages.length === 0 && (
          <div className="agent-chat__empty">
            <div className="agent-chat__empty-icon" style={{ filter: `drop-shadow(0 0 20px ${agent.accent}40)` }}>
              {agent.icon}
            </div>
            <div className="agent-chat__empty-tagline">{agent.tagline}</div>
            <div className="agent-chat__empty-intro">{agent.intro}</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`agent-chat__row agent-chat__row--${msg.role}`}>
            {msg.role === 'assistant' && (
              <div
                className="agent-chat__avatar"
                style={{ background: `linear-gradient(135deg, ${agent.accent}, ${agent.accentEnd})` }}
              >
                {agent.icon}
              </div>
            )}
            <div
              className={`agent-chat__bubble agent-chat__bubble--${msg.role}`}
              style={msg.role === 'user' ? {
                background: `linear-gradient(135deg, ${agent.accent}, ${agent.accentEnd})`,
                color: agent.darkText ? '#1a1a0a' : '#fff',
              } : {
                borderColor: `${agent.accent}18`,
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="agent-chat__row agent-chat__row--assistant">
            <div
              className="agent-chat__avatar"
              style={{ background: `linear-gradient(135deg, ${agent.accent}, ${agent.accentEnd})` }}
            >
              {agent.icon}
            </div>
            <div className="agent-chat__bubble agent-chat__bubble--assistant agent-chat__bubble--loading" style={{ borderColor: `${agent.accent}18` }}>
              {[0, 1, 2].map(j => (
                <div key={j} className="agent-chat__dot" style={{ background: agent.accent, animationDelay: `${j * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="agent-chat__input-area" style={{ borderTopColor: `${agent.accent}12` }}>
        <div className="agent-chat__input-wrap" style={{ borderColor: `${agent.accent}25` }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={agent.placeholder}
            rows={1}
            className="agent-chat__textarea"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="agent-chat__send"
            style={{
              background: input.trim()
                ? `linear-gradient(135deg, ${agent.accent}, ${agent.accentEnd})`
                : 'rgba(255,255,255,0.08)',
              color: input.trim() && agent.darkText ? '#1a1a0a' : '#fff',
            }}
          >
            &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AgentPanel() {
  const [activeAgent, setActiveAgent] = useState('amp');
  const [chatHistories, setChatHistories] = useState({ amp: [], buzz: [], riff: [] });
  const [loadingStates, setLoadingStates] = useState({ amp: false, buzz: false, riff: false });

  const sendMessage = useCallback(async (agentKey, text) => {
    const agent = AGENTS[agentKey];
    const userMsg = { role: 'user', content: text };
    const newMessages = [...chatHistories[agentKey], userMsg];

    setChatHistories(prev => ({ ...prev, [agentKey]: newMessages }));
    setLoadingStates(prev => ({ ...prev, [agentKey]: true }));

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          agentKey,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b => b.text || '').join('\n') || "Sorry, couldn't generate a response.";
      setChatHistories(prev => ({ ...prev, [agentKey]: [...newMessages, { role: 'assistant', content: reply }] }));
    } catch {
      setChatHistories(prev => ({
        ...prev,
        [agentKey]: [...newMessages, { role: 'assistant', content: 'Connection error — try again.' }],
      }));
    }
    setLoadingStates(prev => ({ ...prev, [agentKey]: false }));
  }, [chatHistories]);

  const agent = AGENTS[activeAgent];

  return (
    <div className="agent-panel">
      <div className="agent-panel__header">
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)' }}>AI Agents</h1>
        <div className="agent-panel__status">
          <div className="agent-panel__status-dot" />
          AI AGENTS ONLINE
        </div>
      </div>

      <div className="agent-panel__tabs">
        {Object.entries(AGENTS).map(([key, ag]) => {
          const isActive = key === activeAgent;
          const hasMessages = chatHistories[key].length > 0;
          return (
            <button
              key={key}
              className={`agent-panel__tab ${isActive ? 'agent-panel__tab--active' : ''}`}
              onClick={() => setActiveAgent(key)}
              style={isActive ? {
                background: `${ag.accent}12`,
                borderColor: `${ag.accent}30`,
              } : {}}
            >
              <span className="agent-panel__tab-icon">{ag.icon}</span>
              <span className="agent-panel__tab-name" style={{ color: isActive ? ag.accent : undefined }}>{ag.name}</span>
              <span className="agent-panel__tab-role">{ag.role}</span>
              {hasMessages && !isActive && (
                <div className="agent-panel__tab-dot" style={{ background: ag.accent }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="agent-panel__chat-area">
        <AgentChat
          key={activeAgent}
          agent={agent}
          messages={chatHistories[activeAgent]}
          loading={loadingStates[activeAgent]}
          onSend={text => sendMessage(activeAgent, text)}
        />
      </div>
    </div>
  );
}
