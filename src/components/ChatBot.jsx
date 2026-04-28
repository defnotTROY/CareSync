import { useState, useRef, useEffect, useCallback } from 'react';
import './ChatBot.css';

/* ─── FAQ Knowledge Base ─── */
const FAQ_DATA = [
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
    answer: "Hello!  Welcome to MJY 88 Medical Clinic. How can I help you today?",
  },
  {
    keywords: ['hour', 'hours', 'open', 'close', 'schedule', 'time', 'when'],
    answer: " Our clinic is open Monday–Saturday, 8:00 AM – 5:00 PM. We're closed on Sundays and public holidays.",
  },
  {
    keywords: ['book', 'appointment', 'reserve', 'schedule visit', 'slot'],
    answer: " You can book an appointment through your dashboard! Just log in, click \"Book Appointment\", choose your preferred date/time, and you're all set.",
  },
  {
    keywords: ['service', 'services', 'offer', 'specialization', 'treatment'],
    answer: " We offer a range of services including:\n• Annual Physical Exam (APE)\n• Pre-Employment Medical Exam\n• Drug Testing\n• Neuropsychiatric Testing\n• X-Ray & Laboratory\n• Medical Certificates",
  },
  {
    keywords: ['price', 'cost', 'fee', 'how much', 'payment', 'pay', 'pricing'],
    answer: " Pricing varies by service. For specific rates, please visit our clinic or call our front desk. We accept cash and major payment methods.",
  },
  {
    keywords: ['location', 'address', 'where', 'direction', 'map', 'find'],
    answer: " We're located at MJY 88 Medical Clinic. For exact directions, check the Contact section on our website or search for us on Google Maps!",
  },
  {
    keywords: ['contact', 'phone', 'email', 'call', 'reach'],
    answer: " You can reach us through the Contact page on our website, or visit us during clinic hours. Our staff will be happy to assist you!",
  },
  {
    keywords: ['login', 'sign in', 'account', 'register', 'sign up'],
    answer: " To log in, click the \"Login\" button at the top-right corner. If you don't have an account yet, click \"Sign Up\" to create one — it only takes a minute!",
  },
  {
    keywords: ['cancel', 'reschedule', 'change appointment'],
    answer: " To cancel or reschedule, go to \"My Appointments\" in your dashboard. You can manage all your bookings from there.",
  },
  {
    keywords: ['result', 'results', 'lab', 'laboratory', 'test result'],
    answer: " Lab results are typically available within 1–3 business days. You can check your results through your dashboard or pick them up at the clinic.",
  },
  {
    keywords: ['queue', 'wait', 'waiting', 'line', 'turn'],
    answer: " You can view the live queue from our \"Live Queue\" page! It shows real-time updates so you know when it's your turn.",
  },
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate'],
    answer: "You're welcome! Is there anything else I can help you with?",
  },
];

const FALLBACK = "I'm sorry, I don't have an answer for that yet.  You can try asking about our services, clinic hours, booking, or pricing. Or feel free to contact our front desk for further assistance!";

const WELCOME_MSG = {
  sender: 'bot',
  text: "Hi there!  I'm the CareSync Assistant. I can answer questions about our clinic. Try asking about:",
  time: new Date(),
};

const SUGGESTION_CHIPS = [
  'Clinic hours',
  'Services offered',
  'How to book',
  'Pricing',
  'Location',
];

/* ─── Helper: match user input to FAQ ─── */
function matchFAQ(input) {
  const lower = input.toLowerCase().trim();
  for (const faq of FAQ_DATA) {
    if (faq.keywords.some((kw) => lower.includes(kw))) {
      return faq.answer;
    }
  }
  return FALLBACK;
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ═══════════════════════════════════
   ChatBot Component
   ═══════════════════════════════════ */
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // controls DOM mount for animation
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(1);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll to newest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* Focus input when chat opens */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  /* ── Open / Close ── */
  const openChat = useCallback(() => {
    setIsVisible(true);
    setIsOpen(true);
    setUnread(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    // Wait for exit animation to finish before unmounting
    setTimeout(() => setIsVisible(false), 250);
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) closeChat();
    else openChat();
  }, [isOpen, openChat, closeChat]);

  /* ── Send message ── */
  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { sender: 'user', text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking
    setTimeout(() => {
      const botReply = { sender: 'bot', text: matchFAQ(text), time: new Date() };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, [input]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  /* ── Chip click ── */
  const handleChip = useCallback((label) => {
    const userMsg = { sender: 'user', text: label, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botReply = { sender: 'bot', text: matchFAQ(label), time: new Date() };
      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  }, []);

  /* ─────────────── Render ─────────────── */
  return (
    <>
      {/* ── Chat Window ── */}
      {isVisible && (
        <div
          className={`chatbot-window ${isOpen ? 'chatbot-enter' : 'chatbot-exit'}`}
          role="dialog"
          aria-label="Chat with CareSync Assistant"
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 8V4H8" />
                <rect x="2" y="8" width="20" height="12" rx="2" />
                <path d="M7 15h0" /><path d="M17 15h0" />
                <path d="M10 19v2" /><path d="M14 19v2" />
              </svg>
            </div>
            <div className="chatbot-header-info">
              <div className="chatbot-header-name">CareSync Assistant</div>
              <div className="chatbot-header-status">Online</div>
            </div>
            <button className="chatbot-close-btn" onClick={closeChat} aria-label="Close chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18" /><path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg ${msg.sender}`}>
                <div className="chatbot-bubble">
                  {msg.text.split('\n').map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                <span className="chatbot-time">{formatTime(msg.time)}</span>

                {/* Show suggestion chips after the first bot message */}
                {msg.sender === 'bot' && i === 0 && messages.length <= 1 && (
                  <div className="chatbot-chips">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button key={chip} className="chatbot-chip" onClick={() => handleChip(chip)}>
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="chatbot-typing">
                <span /><span /><span />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Type a question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chatbot-send-btn"
              onClick={sendMessage}
              disabled={!input.trim()}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        className={`chatbot-fab ${isOpen ? 'is-open' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {!isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18" /><path d="M6 6l12 12" />
          </svg>
        )}
        {!isOpen && unread > 0 && (
          <span className="chatbot-badge">{unread}</span>
        )}
      </button>
    </>
  );
}
