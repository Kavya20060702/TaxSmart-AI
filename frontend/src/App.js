import { useState, useRef, useEffect } from "react";
import TaxCalculator from "./TaxCalculator";
import FormVault from "./FormVault";

const TABS = {
  CHAT: "chat",
  TOOLKIT: "toolkit",
  VAULT: "vault",
  FORMS: "forms",
};


// ── Calendar View ────────────────────────────────────────────────────────────
function CalendarView({ deadlines }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const getDeadlineForDay = (day) => {
    return deadlines.find(d => {
      const parts = d.date.split(" ");
      const dDay = parseInt(parts[0]);
      const dMonth = new Date(`${parts[1]} 1`).getMonth();
      const dYear = parseInt(parts[2]);
      return dDay === day && dMonth === currentMonth && dYear === currentYear;
    });
  };

  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
  const todayDate = today.getDate();

  const thisMonthDeadlines = deadlines.filter(d => {
    const parts = d.date.split(" ");
    return new Date(`${parts[1]} 1`).getMonth() === currentMonth && parseInt(parts[2]) === currentYear;
  });

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      {/* Calendar Card */}
      <div style={{ backgroundColor: "white", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e0e0e0" }}>

        {/* Today label */}
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#76777d", fontWeight: 500 }}>
          {today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>

        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0b1c30" }}>
            {monthNames[currentMonth]}, {currentYear}
          </h3>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={prevMonth} style={{
              width: 32, height: 32, borderRadius: "50%", border: "1px solid #e0e0e0",
              backgroundColor: "white", cursor: "pointer", fontSize: 13, color: "#45464d",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>▲</button>
            <button onClick={nextMonth} style={{
              width: 32, height: 32, borderRadius: "50%", border: "1px solid #e0e0e0",
              backgroundColor: "white", cursor: "pointer", fontSize: 13, color: "#45464d",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>▼</button>
          </div>
        </div>

        {/* Day Headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: "#76777d", padding: "4px 0" }}>{d}</div>
          ))}
        </div>

        {/* Day Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} style={{ height: 44 }} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const deadline = getDeadlineForDay(day);
            const isToday = isCurrentMonth && day === todayDate;

            return (
              <div key={day} title={deadline ? deadline.event : ""} style={{
                height: 44, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                borderRadius: 10, cursor: deadline ? "pointer" : "default",
                backgroundColor: isToday ? "#0f62fe" : deadline ? (deadline.urgent ? "#fff8e1" : "#defbe6") : "transparent",
                transition: "background 0.15s",
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: isToday || deadline ? 700 : 400,
                  color: isToday ? "white" : deadline ? (deadline.urgent ? "#7c5800" : "#0e6027") : "#0b1c30",
                }}>{day}</span>
                {deadline && !isToday && (
                  <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: deadline.urgent ? "#f1c21b" : "#24a148", marginTop: 1 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginTop: 16, paddingTop: 16, borderTop: "1px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#0f62fe" }} />
            <span style={{ fontSize: 12, color: "#45464d" }}>Today</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#f1c21b" }} />
            <span style={{ fontSize: 12, color: "#45464d" }}>Urgent</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#24a148" }} />
            <span style={{ fontSize: 12, color: "#45464d" }}>Deadline</span>
          </div>
        </div>
      </div>

      {/* This month's deadlines */}
      <div style={{ marginTop: 24 }}>
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: "#76777d", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Deadlines this month
        </p>
        {thisMonthDeadlines.length === 0 ? (
          <p style={{ color: "#76777d", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No deadlines this month 🎉</p>
        ) : (
          thisMonthDeadlines.map((d, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              backgroundColor: "white", border: `1px solid ${d.urgent ? "#f1c21b" : "#e0e0e0"}`,
              borderRadius: 10, padding: "12px 16px", marginBottom: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 8, flexShrink: 0,
                backgroundColor: d.urgent ? "#fff8e1" : "#defbe6",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>{d.urgent ? "⚠️" : "📅"}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0b1c30" }}>{d.event}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#76777d" }}>{d.date}</p>
              </div>
              {d.urgent && (
                <span style={{ backgroundColor: "#f1c21b", color: "#7c5800", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 }}>URGENT</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Toolkit ──────────────────────────────────────────────────────────────────
function Toolkit() {
  const [tool, setTool] = useState("calculator");

  const deadlines = [
    { date: "31 Jul 2025", event: "ITR Filing Deadline (Individuals)", urgent: true },
    { date: "15 Jun 2025", event: "Advance Tax — 1st Instalment (15%)", urgent: false },
    { date: "15 Sep 2025", event: "Advance Tax — 2nd Instalment (45%)", urgent: false },
    { date: "15 Dec 2025", event: "Advance Tax — 3rd Instalment (75%)", urgent: false },
    { date: "15 Mar 2026", event: "Advance Tax — 4th Instalment (100%)", urgent: false },
    { date: "31 Oct 2025", event: "ITR Filing Deadline (Audit Cases)", urgent: false },
    { date: "31 Dec 2025", event: "Belated / Revised ITR Deadline", urgent: false },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: 760, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0b1c30", margin: "0 0 4px" }}>Tax Toolkit</h2>
      <p style={{ color: "#45464d", fontSize: 14, marginBottom: 24 }}>Calculate your tax liability and track important deadlines.</p>

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #e0e0e0" }}>
        {["calculator", "calendar"].map((t) => (
          <button key={t} onClick={() => setTool(t)} style={{
            padding: "10px 24px", border: "none", cursor: "pointer",
            backgroundColor: "transparent", fontSize: 14, fontWeight: 600,
            color: tool === t ? "#006c49" : "#76777d",
            borderBottom: tool === t ? "2px solid #006c49" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>
            {t === "calculator" ? "🧮 Tax Calculator" : "📅 Deadline Calendar"}
          </button>
        ))}
      </div>

      {tool === "calculator" ? <TaxCalculator /> : <CalendarView deadlines={deadlines} />}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm IBM Tax Guide AI, powered by IBM Granite & Watson NLU.\n\nI can help you understand Indian tax laws, calculate deductions, and manage your tax documents.\n\nWhat can I help you with today?",
      suggestions: ["What is 80C deduction limit?", "Old vs New tax regime?", "How to calculate HRA?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.CHAT);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Voice input not supported. Try Chrome."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    setKeywords([]);
    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, language }),
      });
      const data = await response.json();
      if (data.status === "success") {
        setMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
        setKeywords(data.keywords || []);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Cannot connect to server. Make sure the backend is running." }]);
    }
    setLoading(false);
  };

  const navItems = [
  { tab: TABS.CHAT, icon: "💬", label: "AI Chat" },
  { tab: TABS.TOOLKIT, icon: "🔧", label: "Toolkit" },
  { tab: TABS.FORMS, icon: "🗄️", label: "Form Vault" },
];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', 'IBM Plex Sans', Arial, sans-serif", backgroundColor: "#f8f9ff", overflow: "hidden" }}>

      {/* Sidebar */}
      <nav style={{ width: 260, backgroundColor: "white", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", flexShrink: 0, boxShadow: "2px 0 8px rgba(0,0,0,0.04)" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #e0e0e0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: "#0f62fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>💰</div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: "#0b1c30" }}>IBM Tax Guide AI</p>
              <p style={{ margin: 0, fontSize: 11, color: "#76777d" }}>IBM Cloud Powered</p>
            </div>
          </div>
        </div>

        <div style={{ padding: "16px 12px", flex: 1 }}>
          {navItems.map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 24, border: "none", cursor: "pointer",
              marginBottom: 4, textAlign: "left",
              backgroundColor: activeTab === tab ? "#6cf8bb" : "transparent",
              color: activeTab === tab ? "#00714d" : "#45464d",
              fontWeight: activeTab === tab ? 700 : 500, fontSize: 15, transition: "all 0.15s",
              borderLeft: activeTab === tab ? "4px solid #006c49" : "4px solid transparent",
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>{label}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #e0e0e0" }}>
          <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: "#76777d", letterSpacing: "0.05em", textTransform: "uppercase" }}>IBM Services Active</p>
          {["watsonx.ai Granite", "Watson NLU", "Cloud Object Storage", "Watson Assistant"].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#24a148" }} />
              <span style={{ fontSize: 12, color: "#45464d" }}>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px", borderTop: "1px solid #e0e0e0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#dce9ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, color: "#0043ce" }}>KS</div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0b1c30" }}>Kavya Sai</p>
            <p style={{ margin: 0, fontSize: 11, color: "#76777d" }}>Tax Year 2024-25</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top Bar */}
        <div style={{ padding: "16px 32px", backgroundColor: "white", borderBottom: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0b1c30" }}>
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#45464d", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#24a148", display: "inline-block" }} />
              Always online to help with your taxes
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 0, border: "1px solid #c6c6cd", borderRadius: 8, overflow: "hidden" }}>
              {[{ val: "en", label: "EN" }, { val: "hi", label: "हि" }].map(({ val, label }) => (
                <button key={val} onClick={() => setLanguage(val)} style={{
                  padding: "6px 14px", border: "none", cursor: "pointer",
                  backgroundColor: language === val ? "#0f62fe" : "white",
                  color: language === val ? "white" : "#45464d",
                  fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                }}>{label}</button>
              ))}
            </div>
            {activeTab === TABS.CHAT && (
              <button onClick={() => setMessages([{ role: "assistant", text: "Chat cleared! How can I help you with your taxes?" }])} style={{
                padding: "7px 16px", backgroundColor: "#0b1c30", color: "white",
                border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>CLEAR CHAT</button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === TABS.CHAT ? (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
              {messages.map((msg, i) => (
                <div key={i}>
                  <div style={{
                    display: "flex", gap: 12,
                    flexDirection: msg.role === "user" ? "row-reverse" : "row",
                    maxWidth: "72%", marginLeft: msg.role === "user" ? "auto" : 0,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: msg.role === "user" ? "#dce9ff" : "#6cf8bb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, border: "1px solid rgba(0,0,0,0.08)",
                    }}>{msg.role === "user" ? "👤" : "🤖"}</div>
                    <div style={{
                      padding: "14px 18px",
                      backgroundColor: msg.role === "user" ? "#0f62fe" : "white",
                      color: msg.role === "user" ? "white" : "#0b1c30",
                      borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                      fontSize: 14, lineHeight: 1.6,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      border: msg.role === "assistant" ? "1px solid #e0e0e0" : "none",
                      whiteSpace: "pre-wrap",
                    }}>{msg.text}</div>
                  </div>
                  {msg.suggestions && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, marginLeft: 50 }}>
                      {msg.suggestions.map((s, j) => (
                        <button key={j} onClick={() => sendMessage(s)} style={{
                          padding: "6px 14px", backgroundColor: "#eff4ff",
                          color: "#00714d", border: "1px solid #c6c6cd",
                          borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}>{s}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 12, maxWidth: "72%" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", backgroundColor: "#6cf8bb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                  <div style={{ padding: "14px 18px", backgroundColor: "white", borderRadius: "4px 20px 20px 20px", border: "1px solid #e0e0e0", fontSize: 14, color: "#76777d" }}>
                    Analyzing with IBM Watson NLU + Granite...
                  </div>
                </div>
              )}

              {keywords.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginLeft: 50 }}>
                  <span style={{ fontSize: 12, color: "#45464d", fontWeight: 600 }}>🔍 NLU detected:</span>
                  {keywords.map((kw, i) => (
                    <span key={i} style={{ backgroundColor: "#defbe6", color: "#0e6027", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{kw}</span>
                  ))}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: "16px 32px", backgroundColor: "white", borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
              <div style={{ maxWidth: 720, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", backgroundColor: "#f8f9ff", border: "1px solid #c6c6cd", borderRadius: 16, padding: "8px 8px 8px 16px" }}>
                  <input
                    style={{ flex: 1, border: "none", backgroundColor: "transparent", fontSize: 14, outline: "none", color: "#0b1c30" }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={language === "hi" ? "अपना कर प्रश्न पूछें..." : "Ask anything about your taxes..."}
                    disabled={loading}
                  />
                  <button onClick={startListening} disabled={listening} style={{
                    width: 36, height: 36, borderRadius: "50%", border: "none",
                    backgroundColor: listening ? "#ff832b" : "#eff4ff",
                    color: listening ? "white" : "#0043ce", cursor: "pointer", fontSize: 16,
                  }}>{listening ? "🔴" : "🎤"}</button>
                  <button onClick={() => sendMessage()} disabled={loading} style={{
                    backgroundColor: "#006c49", color: "white", border: "none",
                    borderRadius: 10, padding: "8px 20px", fontSize: 13,
                    fontWeight: 700, cursor: "pointer", opacity: loading ? 0.6 : 1,
                  }}>SEND ➤</button>
                </div>
                <p style={{ textAlign: "center", fontSize: 10, color: "#76777d", marginTop: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  AI can make mistakes. Verify important tax decisions with a professional.
                </p>
              </div>
            </div>
          </>
        ) : activeTab === TABS.TOOLKIT ? (
          <div style={{ flex: 1, overflowY: "auto" }}><Toolkit /></div>
        ) : activeTab === TABS.VAULT ? (
          <div style={{ flex: 1, overflowY: "auto" }}><FormVault /></div>
        ) : (
          <div style={{ flex: 1, overflowY: "auto" }}><FormVault /></div>
        )}
      </div>
    </div>
  );
}