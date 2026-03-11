import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import API_BASE_URL from '../constants/apiConstants';
import './AIAssistantWidget.css';

const markdownStyles = {
  container: {
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.07)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: '#374151',
    maxWidth: '100%',
    marginTop: '10px',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  },
  heading: {
    color: '#111827',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '6px',
    marginTop: '16px',
    fontWeight: '700',
  },
};
function FitnessPlanDisplay({ text }) {
  if (!text) return null;

  return (
    <div style={markdownStyles.container}>
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => <h1 style={markdownStyles.heading} {...props} />,
          h2: ({ node, ...props }) => <h2 style={{ ...markdownStyles.heading, fontSize: '1.2em' }} {...props} />,
          strong: ({ node, ...props }) => <strong style={{ color: '#2563eb', fontWeight: 'bold' }} {...props} />,
          ul: ({ node, ...props }) => <ul style={{ paddingLeft: '20px', margin: '10px 0' }} {...props} />,
          li: ({ node, ...props }) => <li style={{ marginBottom: '5px' }} {...props} />,
          p: ({ node, ...props }) => <p style={{ marginBottom: '10px' }} {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

const DEFAULT_PLACEHOLDER = 'Ask your AI trainer...';

function AIAssistantWidget({ userToken }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI fitness assistant. How can I help you today?' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const chatEndRef = useRef(null);

  useEffect(() => {
    if (open && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { role: 'user', content: input }]);
    setLoading(true);
    setError('');
    const originalInput = input;
    setInput('');

    try {
      console.log('🤖 Sending to AI:', originalInput);
      const res = await fetch(`${API_BASE_URL}/ai/workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken ? { 'Authorization': `Bearer ${userToken}` } : {})
        },
        body: JSON.stringify({ prompt: originalInput })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Backend error response:', res.status, errorText);
        throw new Error(`Backend error (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      let aiText = '';
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        aiText = data.candidates[0].content.parts[0].text;
      } else if (data.assistant) {
        aiText = data.assistant;
      } else {
        aiText = "I couldn't generate a response. Please try again.";
      }
      setMessages(msgs => [...msgs, { role: 'assistant', content: aiText }]);

    } catch (err) {
      console.error(err);
      setMessages(msgs => [...msgs, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please check your connection.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`ai-assistant-fab${open ? ' ai-assistant-fab-hide' : ''}`} onClick={() => setOpen(true)}>
        <span role="img" aria-label="AI">🤖</span>
      </div>
      {open && (
        <div className="ai-assistant-chatbox">

          <div className="ai-assistant-header">
            <span>AI Assistant</span>
            <button className="ai-assistant-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="ai-assistant-messages">
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

                {msg.role === 'user' ? (
                  <div className="ai-msg ai-msg-user">
                    {msg.content}
                  </div>
                ) : (
                  <FitnessPlanDisplay text={msg.content} />
                )}

              </div>
            ))}

            {loading && (
              <div className="ai-msg ai-msg-assistant ai-msg-typing">
                <span className="ai-typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="ai-assistant-input-row" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={DEFAULT_PLACEHOLDER}
              disabled={loading}
              autoFocus
            />
            <button type="submit" disabled={loading || !input.trim()}>Send</button>
          </form>

        </div>
      )}
    </>
  );
}

export default AIAssistantWidget;