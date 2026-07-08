import { useState, useRef, useEffect } from "react";
import TaxCalculator from "./TaxCalculator";
import FormVault from "./FormVault";
import FilingReadiness from "./FilingReadiness";
import DocChecker from "./DocChecker";

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#822222",
  primaryDark: "#5c1a1a",
  primaryLight: "#fdf0f0",
  secondary: "#2F4F4F",
  secondaryLight: "#e8f0f0",
  teal: "#3a7d7d",
  gold: "#C4AF37",
  success: "#1a7a3c",
  successLight: "#e8f7ee",
  warning: "#b45309",
  warningLight: "#fef3c7",
  error: "#b91c1c",
  errorLight: "#fee2e2",
  neutral: "#6A6A6A",
  text: "#1a1a1a",
  textMuted: "#6A6A6A",
  border: "#e2e2e2",
  bg: "#f5f5f5",
  white: "#ffffff",
};

const TABS = {
  CHAT: "chat",
  TOOLKIT: "toolkit",
  FORMS: "forms",
  DOCCHECK: "doccheck",
};

// ── Calendar View ─────────────────────────────────────────────────────────────
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

  // Days left calculator
  const daysLeft = (dateStr) => {
    const parts = dateStr.split(" ");
    const target = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Important Deadlines</h2>
      <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Stay on top of your tax obligations with real-time tracking.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left — Deadline Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {deadlines.map((d, i) => {
            const dl = daysLeft(d.date);
            const isUrgent = dl <= 7 && dl >= 0;
            const isPast = dl < 0;
            return (
              <div key={i} style={{
                backgroundColor: C.white, border: `1px solid ${isUrgent ? C.error : C.border}`,
                borderLeft: `4px solid ${isUrgent ? C.error : isPast ? C.neutral : C.secondary}`,
                borderRadius: 8, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}>
                <div style={{ flex: 1 }}>
                  {isUrgent && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: C.error }} />
                      <span style={{ fontSize: 10, fontWeight: 700, color: C.error, textTransform: "uppercase", letterSpacing: "0.08em" }}>Urgent</span>
                    </div>
                  )}
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: C.text }}>{d.event}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
                    📅 {d.date}
                  </p>
                </div>
                <div style={{
                  minWidth: 52, height: 52, borderRadius: 8,
                  backgroundColor: isUrgent ? C.error : isPast ? "#9ca3af" : C.secondary,
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", color: "white",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                    {isPast ? "—" : dl}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase" }}>
                    {isPast ? "Past" : "Days"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Calendar */}
        <div style={{ backgroundColor: C.white, borderRadius: 12, padding: "20px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", height: "fit-content" }}>
          {/* Month Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <button onClick={prevMonth} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.border}`, backgroundColor: C.white, cursor: "pointer", fontSize: 12, color: C.textMuted }}>‹</button>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text }}>{monthNames[currentMonth]} {currentYear}</h3>
            <button onClick={nextMonth} style={{ width: 28, height: 28, borderRadius: "50%", border: `1px solid ${C.border}`, backgroundColor: C.white, cursor: "pointer", fontSize: 12, color: C.textMuted }}>›</button>
          </div>

          {/* Day Headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C.textMuted, padding: "3px 0" }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
            {Array.from({ length: (firstDay === 0 ? 6 : firstDay - 1) }).map((_, i) => (
              <div key={`e-${i}`} style={{ height: 36 }} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const deadline = getDeadlineForDay(day);
              const isToday = isCurrentMonth && day === todayDate;
              const dl = deadline ? daysLeft(deadline.date) : null;
              const isUrgent = dl !== null && dl <= 7 && dl >= 0;

              return (
                <div key={day} title={deadline ? deadline.event : ""} style={{
                  height: 36, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", borderRadius: 6,
                  backgroundColor: isToday ? C.primary : deadline ? (isUrgent ? C.errorLight : C.secondaryLight) : "transparent",
                  cursor: deadline ? "pointer" : "default",
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: isToday || deadline ? 700 : 400,
                    color: isToday ? "white" : deadline ? (isUrgent ? C.error : C.secondary) : C.text,
                  }}>{day}</span>
                  {deadline && !isToday && (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: isUrgent ? C.error : C.secondary, marginTop: 1 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { color: C.error, label: "Payment Due Today" },
              { color: C.primary, label: "Current Date" },
              { color: C.secondary, label: "Future Tax Events" },
            ].map((l) => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: l.color }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Pro Tip */}
          <div style={{ marginTop: 16, backgroundColor: C.primaryLight, borderRadius: 8, padding: "10px 12px" }}>
            <p style={{ margin: 0, fontSize: 11, color: C.primary, fontWeight: 600 }}>💡 Pro Tip</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.primary }}>e-Filing your returns early avoids last-minute server rush.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toolkit ───────────────────────────────────────────────────────────────────
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Sub-tabs */}
      <div style={{ backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", gap: 0 }}>
        {["calculator", "calendar", "filing-readiness"].map((t) => (
          <button key={t} onClick={() => setTool(t)} style={{
            padding: "14px 20px", border: "none", cursor: "pointer",
            backgroundColor: "transparent", fontSize: 13, fontWeight: 600,
            color: tool === t ? C.primary : C.textMuted,
            borderBottom: tool === t ? `2px solid ${C.primary}` : "2px solid transparent",
            marginBottom: -1, transition: "all 0.2s",
          }}>
            {t === "calculator" ? "🧮 Tax Calculator" : t === "calendar" ? "📅 Deadline Calendar" : "📊 Filing Readiness"}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tool === "calculator" ? (
          <div style={{ padding: "24px 32px", maxWidth: 760, margin: "0 auto" }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: "0 0 4px" }}>Tax Calculator</h2>
            <p style={{ color: C.textMuted, fontSize: 14, marginBottom: 24 }}>Compare Old vs New regime and find your best option.</p>
            <TaxCalculator />
          </div>
        ) : tool === "calendar" ? (
          <CalendarView deadlines={deadlines} />
        ) : (
          <FilingReadiness language="en" />
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm IBM Tax Guide AI, powered by IBM Granite & Watson NLU.\n\nI can help you understand Indian tax laws, calculate deductions, and manage your tax documents.\n\nWhat can I help you with today?",
      suggestions: ["What is 80C deduction limit?", "How does UPI work safely?", "How to identify online scams?", "50-30-20 budgeting rule?"],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState([]);
  const [activeTab, setActiveTab] = useState(TABS.CHAT);
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState("en");
  const [checkedDocs, setCheckedDocs] = useState({});
  const bottomRef = useRef(null);

  const autoCheckDoc = (filename) => {
    const n = filename.toLowerCase();
    const updates = {};
    if (n.includes('form16') || n.includes('form_16') || n.includes('f16')) updates.form16 = true;
    if (n.includes('26as') || n.includes('form26')) updates.form26as = true;
    if (n.includes('pan')) updates.pan = true;
    if (n.includes('aadhaar') || n.includes('aadhar')) updates.aadhaar = true;
    if (n.includes('80c') || n.includes('investment') || n.includes('elss') || n.includes('ppf')) updates.inv_80c = true;
    if (n.includes('80d') || n.includes('health') || n.includes('insurance')) updates.ins_80d = true;
    if (n.includes('homeloan') || n.includes('home_loan') || n.includes('mortgage')) updates.homeloan = true;
    if (n.includes('hra') || n.includes('rent')) updates.hra = true;
    if (n.includes('bank') || n.includes('statement')) updates.bank = true;
    if (n.includes('26as') || n.includes('ais') || n.includes('tis')) updates.ais = true;
    if (n.includes('itr') || n.includes('return')) updates.prev_itr = true;
    if (n.includes('capital') || n.includes('gains') || n.includes('demat')) updates.cap_gains = true;
    if (Object.keys(updates).length > 0) {
      setCheckedDocs(prev => ({ ...prev, ...updates }));
      return Object.keys(updates);
    }
    return [];
  };

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
  setMessages((prev) => [...prev, { 
    role: "assistant", 
    text: data.response,
    sources: data.sources || []
  }]);
  setKeywords(data.keywords || []);
} else {
        setMessages((prev) => [...prev, { role: "assistant", text: "Something went wrong. Please try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Cannot connect to server. Make sure the backend is running." }]);
    }
    setLoading(false);
  };

  const pageTitles = {
    [TABS.CHAT]: "AI Tax Assistant",
    [TABS.TOOLKIT]: "Tax Toolkit",
    [TABS.FORMS]: "Smart Form Vault",
    [TABS.DOCCHECK]: "Document Checker",
  };

  const navItems = [
    { tab: TABS.CHAT, icon: "🤖", label: "AI Assistant" },
    { tab: TABS.TOOLKIT, icon: "🔧", label: "Toolkit" },
    { tab: TABS.FORMS, icon: "🗄️", label: "Form Vault" },
    { tab: TABS.DOCCHECK, icon: "✅", label: "Doc Checker" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', Arial, sans-serif", backgroundColor: C.bg }}>

      {/* ── Top Nav Bar ── */}
      <header style={{
        backgroundColor: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 24px", height: 52, display: "flex",
        alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)", flexShrink: 0, zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            backgroundColor: C.primary, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>💰</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: C.primary }}>TaxSmart</span>
            <span style={{ fontWeight: 400, fontSize: 15, color: C.text }}> AI Portal</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav style={{ display: "flex", gap: 4 }}>
          {navItems.map(({ tab, icon, label }) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "6px 14px", border: "none", cursor: "pointer",
              backgroundColor: activeTab === tab ? C.primaryLight : "transparent",
              color: activeTab === tab ? C.primary : C.textMuted,
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: 13, borderRadius: 6, transition: "all 0.15s",
              borderBottom: activeTab === tab ? `2px solid ${C.primary}` : "2px solid transparent",
            }}>
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search bar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            backgroundColor: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 20, padding: "5px 12px", width: 180,
          }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>🔍</span>
            <input placeholder="Search for tax forms..." style={{
              border: "none", backgroundColor: "transparent",
              fontSize: 12, outline: "none", color: C.text, width: "100%",
            }} />
          </div>

          {/* Language */}
          <div style={{ display: "flex", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden" }}>
            {[{ val: "en", label: "EN" }, { val: "hi", label: "हि" }].map(({ val, label }) => (
              <button key={val} onClick={() => setLanguage(val)} style={{
                padding: "4px 10px", border: "none", cursor: "pointer",
                backgroundColor: language === val ? C.primary : C.white,
                color: language === val ? "white" : C.textMuted,
                fontSize: 12, fontWeight: 600,
              }}>{label}</button>
            ))}
          </div>

          {/* User avatar */}
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            backgroundColor: C.secondary, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12, color: "white", cursor: "pointer",
          }}>KS</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Left Sidebar ── */}
        <aside style={{ width: 220, backgroundColor: C.white, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

          {/* IBM Services */}
          <div style={{ padding: "16px", borderTop: `1px solid ${C.border}` }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>IBM Services</p>
            {["watsonx.ai", "Watson NLU", "Cloud Storage", "WA"].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e" }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{s}</span>
              </div>
            ))}
          </div>

          {/* User */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: C.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", flexShrink: 0 }}>KS</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.text }}>Kavya Sai</p>
              <p style={{ margin: 0, fontSize: 10, color: C.textMuted }}>FY 2024-25</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Page Header Bar */}
          <div style={{
            backgroundColor: C.white, borderBottom: `1px solid ${C.border}`,
            padding: "12px 32px", display: "flex",
            justifyContent: "space-between", alignItems: "center", flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                backgroundColor: C.primaryLight, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>
                {navItems.find(n => n.tab === activeTab)?.icon}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.text }}>{pageTitles[activeTab]}</h2>
                <p style={{ margin: 0, fontSize: 11, color: "#22c55e", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
                  Active Specialist
                </p>
              </div>
            </div>
            {activeTab === TABS.CHAT && (
              <button onClick={() => setMessages([{ role: "assistant", text: "Chat cleared! How can I help you with your taxes?" }])} style={{
                padding: "6px 14px", backgroundColor: C.secondary, color: "white",
                border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>+ File New Return</button>
            )}
          </div>

          {/* ── Tab Content ── */}
          {activeTab === TABS.CHAT ? (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px", display: "flex", flexDirection: "column", gap: 20, backgroundColor: C.bg }}>
                {messages.map((msg, i) => (
                  <div key={i}>
                    <div style={{
                      display: "flex", gap: 12,
                      flexDirection: msg.role === "user" ? "row-reverse" : "row",
                      maxWidth: "75%", marginLeft: msg.role === "user" ? "auto" : 0,
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: msg.role === "user" ? C.secondary : C.primary,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: 700, fontSize: 13,
                      }}>
                        {msg.role === "user" ? "KS" : "AI"}
                      </div>
                      {/* Bubble */}
                      <div style={{
                        padding: "12px 16px",
                        backgroundColor: msg.role === "user" ? C.secondary : C.white,
                        color: msg.role === "user" ? "white" : C.text,
                        borderRadius: msg.role === "user" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
                        fontSize: 13, lineHeight: 1.6,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                        border: msg.role === "assistant" ? `1px solid ${C.border}` : "none",
                        whiteSpace: "pre-wrap", maxWidth: "100%",
                      }}>{msg.text}</div>
                    </div>

                    {/* Suggestions */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 8, marginLeft: msg.role === "user" ? 0 : 48 }}>
                      <p style={{ margin: "0 0 6px", fontSize: 11, color: "#6A6A6A", fontWeight: 600 }}>
                        📚 Sources used:
                      </p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {msg.sources.map((src, si) => (
                          <div key={si} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            backgroundColor: "#fdf0f0",
                            border: "1px solid #e8d0d0",
                            borderRadius: 20, padding: "3px 10px",
                          }}>
                            <span style={{
                              width: 16, height: 16, borderRadius: "50%",
                              backgroundColor: "#822222", color: "white",
                              fontSize: 9, fontWeight: 700,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              flexShrink: 0,
                            }}>{src.rank}</span>
                            <span style={{ fontSize: 11, color: "#822222", fontWeight: 600 }}>
                              {src.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                    {/* NLU Keywords */}
                    {msg.role === "assistant" && i === messages.length - 1 && keywords.length > 0 && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 8, marginLeft: 48 }}>
                        <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}>🔍 NLU detected:</span>
                        {keywords.map((kw, ki) => (
                          <span key={ki} style={{
                            backgroundColor: C.secondaryLight, color: C.secondary,
                            padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                          }}>{kw}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div style={{ display: "flex", gap: 12, maxWidth: "75%" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>AI</div>
                    <div style={{ padding: "12px 16px", backgroundColor: C.white, borderRadius: "2px 12px 12px 12px", border: `1px solid ${C.border}`, fontSize: 13, color: C.textMuted }}>
                      Analyzing with IBM Watson NLU + Granite...
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input Area */}
              <div style={{ backgroundColor: C.white, borderTop: `1px solid ${C.border}`, padding: "16px 32px", flexShrink: 0 }}>
                <div style={{ maxWidth: 760, margin: "0 auto" }}>
                  <div style={{
                    display: "flex", gap: 8, alignItems: "center",
                    backgroundColor: C.bg, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "8px 8px 8px 16px",
                  }}>
                    <input
                      style={{ flex: 1, border: "none", backgroundColor: "transparent", fontSize: 13, outline: "none", color: C.text }}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={language === "hi" ? "अपना कर प्रश्न पूछें..." : "Ask TaxSmart AI about your 2024 returns..."}
                      disabled={loading}
                    />
                    {/* Mic */}
                    <button onClick={startListening} disabled={listening} style={{
                      width: 32, height: 32, borderRadius: 6, border: `1px solid ${C.border}`,
                      backgroundColor: listening ? C.error : C.white,
                      color: listening ? "white" : C.textMuted, cursor: "pointer", fontSize: 14,
                    }}>🎤</button>
                    {/* Send */}
                    <button onClick={() => sendMessage()} disabled={loading} style={{
                      width: 36, height: 36, borderRadius: 6,
                      backgroundColor: C.primary, color: "white",
                      border: "none", cursor: "pointer", fontSize: 16,
                      opacity: loading ? 0.6 : 1,
                    }}>➤</button>
                  </div>
                  <p style={{ textAlign: "center", fontSize: 10, color: C.textMuted, marginTop: 6 }}>
                    TaxSmart AI is for guidance only. Please consult a professional for complex legal tax advice.
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === TABS.TOOLKIT ? (
            <Toolkit />
          ) : activeTab === TABS.FORMS ? (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <FormVault language={language} onDocumentUploaded={autoCheckDoc} />
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: "auto" }}>
              <DocChecker language={language} checkedDocs={checkedDocs} setCheckedDocs={setCheckedDocs} />
            </div>
          )}
        </main>
      </div>  

      {/* ── Footer ── */}
      <footer style={{
        backgroundColor: C.white, borderTop: `1px solid ${C.border}`,
        padding: "8px 24px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: C.textMuted }}>© 2026 TaxSmart AI. Powered by IBM Cloud.</span>
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy Policy", "Terms of Service", "Accessibility", "Contact Us"].map(l => (
            <span key={l} style={{ fontSize: 11, color: C.textMuted, cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}