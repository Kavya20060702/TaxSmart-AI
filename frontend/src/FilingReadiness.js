import { useState } from "react";

export default function FilingReadiness({ language }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    employment_type: "Salaried",
    salary: "",
    other_income: "",
    regime: "New Regime",
    has_form16: false,
    has_26as: false,
    has_bank: false,
    has_80c: false,
    has_80d: false,
    has_homeloan: false,
    has_hra: false,
    invested_80c: "",
    paid_80d: "",
    hra_applicable: false,
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const checkReadiness = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/filing-readiness`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language }),
      });
      const data = await res.json();
      if (data.status === "success") setResult(data);
      else setResult({ error: data.error });
    } catch (e) {
      setResult({ error: "Could not connect to server." });
    }
    setLoading(false);
  };

  const scoreColor = (score) => {
    if (score >= 80) return { bg: "#defbe6", text: "#0e6027", bar: "#24a148" };
    if (score >= 50) return { bg: "#fff8e1", text: "#7c5800", bar: "#f1c21b" };
    return { bg: "#fff1f1", text: "#ba1a1a", bar: "#da1e28" };
  };

  const scoreLabel = (score) => {
    if (score >= 80) return "✅ Ready to File!";
    if (score >= 50) return "⚠️ Almost Ready";
    return "❌ Not Ready Yet";
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #c6c6cd", borderRadius: 8,
    fontSize: 14, outline: "none", boxSizing: "border-box",
    backgroundColor: "white", color: "#0b1c30",
  };

  const checkboxRow = (key, label, icon) => (
    <div onClick={() => update(key, !form[key])} style={{
      display: "flex", alignItems: "center", gap: 12,
      backgroundColor: form[key] ? "#defbe6" : "white",
      border: `1px solid ${form[key] ? "#24a148" : "#e0e0e0"}`,
      borderRadius: 10, padding: "12px 16px", cursor: "pointer",
      transition: "all 0.15s",
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        backgroundColor: form[key] ? "#24a148" : "white",
        border: `2px solid ${form[key] ? "#24a148" : "#c6c6cd"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {form[key] && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
      </div>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#0b1c30" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ padding: "32px", maxWidth: 680, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0b1c30", margin: "0 0 4px" }}>
        📊 Filing Readiness Meter
      </h2>
      <p style={{ color: "#45464d", fontSize: 14, marginBottom: 24 }}>
        Answer a few questions and IBM Granite AI will check if you're ready to file your ITR.
      </p>

      {/* IBM Badge */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["🤖 IBM Granite Analysis", "📋 ITR Readiness Check", "💡 Action Plan"].map((s) => (
          <span key={s} style={{
            backgroundColor: "#e8f1ff", color: "#0043ce",
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>{s}</span>
        ))}
      </div>

      {/* Progress Steps */}
      {!result && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: s < 3 ? 1 : "none" }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                backgroundColor: step >= s ? "#822222" : "#e0e0e0",
                color: step >= s ? "white" : "#76777d",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14,
              }}>{s}</div>
              {s < 3 && <div style={{ flex: 1, height: 3, backgroundColor: step > s ? "#822222" : "#e0e0e0", margin: "0 4px" }} />}
            </div>
          ))}
          <div style={{ marginLeft: 12, fontSize: 13, color: "#45464d", fontWeight: 600 }}>
            {step === 1 ? "Income Details" : step === 2 ? "Documents" : "Deductions"}
          </div>
        </div>
      )}

      {/* ── Step 1: Income ── */}
      {!result && step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Employment Type
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["Salaried", "Self Employed", "Business", "Freelancer"].map((t) => (
                <button key={t} onClick={() => update("employment_type", t)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "1px solid",
                  borderColor: form.employment_type === t ? "#822222" : "#c6c6cd",
                  backgroundColor: form.employment_type === t ? "#822222" : "white",
                  color: form.employment_type === t ? "white" : "#45464d",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Annual Gross Salary / Income (₹)
            </label>
            <input style={inputStyle} type="number" placeholder="e.g. 800000"
              value={form.salary} onChange={(e) => update("salary", e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Other Income (interest, rent, freelance) (₹)
            </label>
            <input style={inputStyle} type="number" placeholder="e.g. 50000"
              value={form.other_income} onChange={(e) => update("other_income", e.target.value)} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Preferred Tax Regime
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {["New Regime", "Old Regime", "Not Decided"].map((r) => (
                <button key={r} onClick={() => update("regime", r)} style={{
                  padding: "8px 16px", borderRadius: 20, border: "1px solid",
                  borderColor: form.regime === r ? "#2F4F4F" : "#c6c6cd",
                  backgroundColor: form.regime === r ? "#2F4F4F" : "white",
                  color: form.regime === r ? "white" : "#45464d",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{r}</button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep(2)} disabled={!form.salary} style={{
            backgroundColor: !form.salary ? "#c6c6cd" : "#822222",
            color: "white", border: "none", borderRadius: 10,
            padding: "12px", fontSize: 14, fontWeight: 700,
            cursor: form.salary ? "pointer" : "not-allowed", marginTop: 8,
          }}>Next → Documents</button>
        </div>
      )}

      {/* ── Step 2: Documents ── */}
      {!result && step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "#45464d" }}>
            Check all documents you currently have:
          </p>
          {checkboxRow("has_form16", "Form 16 (TDS Certificate from employer)", "🏢")}
          {checkboxRow("has_26as", "Form 26AS (Annual Tax Statement)", "📄")}
          {checkboxRow("has_bank", "Bank Statements (all accounts)", "🏦")}
          {checkboxRow("has_80c", "80C Investment Proofs (PPF, ELSS, LIC etc.)", "📋")}
          {checkboxRow("has_80d", "Health Insurance Premium Receipt (80D)", "🏥")}
          {checkboxRow("has_homeloan", "Home Loan Interest Certificate", "🏠")}
          {checkboxRow("has_hra", "Rent Receipts (if claiming HRA)", "🧾")}

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(1)} style={{
              flex: 1, backgroundColor: "white", color: "#45464d",
              border: "1px solid #c6c6cd", borderRadius: 10,
              padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>← Back</button>
            <button onClick={() => setStep(3)} style={{
              flex: 2, backgroundColor: "#822222", color: "white",
              border: "none", borderRadius: 10, padding: "12px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>Next → Deductions</button>
          </div>
        </div>
      )}

      {/* ── Step 3: Deductions ── */}
      {!result && step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Total 80C Investments Done This Year (₹)
            </label>
            <input style={inputStyle} type="number" placeholder="Max 1,50,000"
              value={form.invested_80c} onChange={(e) => update("invested_80c", e.target.value)} />
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "#76777d" }}>
              PPF, ELSS, LIC, NSC, tax saving FD etc.
            </p>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30", display: "block", marginBottom: 6 }}>
              Health Insurance Premium Paid (80D) (₹)
            </label>
            <input style={inputStyle} type="number" placeholder="Max 25,000"
              value={form.paid_80d} onChange={(e) => update("paid_80d", e.target.value)} />
          </div>

          <div onClick={() => update("hra_applicable", !form.hra_applicable)} style={{
            display: "flex", alignItems: "center", gap: 12,
            backgroundColor: form.hra_applicable ? "#defbe6" : "white",
            border: `1px solid ${form.hra_applicable ? "#24a148" : "#e0e0e0"}`,
            borderRadius: 10, padding: "12px 16px", cursor: "pointer",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0,
              backgroundColor: form.hra_applicable ? "#24a148" : "white",
              border: `2px solid ${form.hra_applicable ? "#24a148" : "#c6c6cd"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {form.hra_applicable && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: "#0b1c30" }}>
              🏠 I pay rent and want to claim HRA exemption
            </span>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button onClick={() => setStep(2)} style={{
              flex: 1, backgroundColor: "white", color: "#45464d",
              border: "1px solid #c6c6cd", borderRadius: 10,
              padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>← Back</button>
            <button onClick={checkReadiness} style={{
              flex: 2, backgroundColor: "#2F4F4F", color: "white",
              border: "none", borderRadius: 10, padding: "12px",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              {loading ? "⏳ Analyzing with IBM Granite..." : "🔍 Check My Readiness"}
            </button>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score Card */}
          {(() => {
            const colors = scoreColor(result.score);
            return (
              <div style={{
                backgroundColor: colors.bg, border: `2px solid ${colors.bar}`,
                borderRadius: 16, padding: "24px", textAlign: "center",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 600, color: colors.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Filing Readiness Score
                </p>
                <div style={{ fontSize: 64, fontWeight: 900, color: colors.text, lineHeight: 1 }}>
                  {result.score}
                </div>
                <p style={{ margin: "4px 0 16px", fontSize: 11, color: colors.text }}>out of 100</p>

                {/* Progress Bar */}
                <div style={{ backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 10, height: 10, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{
                    width: `${result.score}%`, height: "100%",
                    backgroundColor: colors.bar, borderRadius: 10,
                    transition: "width 1s ease",
                  }} />
                </div>

                <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: colors.text }}>
                  {scoreLabel(result.score)}
                </p>
              </div>
            );
          })()}

          {/* AI Analysis */}
          <div style={{
            backgroundColor: "white", border: "1px solid #e0e0e0",
            borderRadius: 12, padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                backgroundColor: "#6cf8bb", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🤖</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0b1c30" }}>IBM Granite Analysis</p>
                <p style={{ margin: 0, fontSize: 11, color: "#76777d" }}>Powered by watsonx.ai</p>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#0b1c30", whiteSpace: "pre-wrap" }}>
              {result.analysis}
            </p>
          </div>

          {/* Try Again */}
          <button onClick={() => { setResult(null); setStep(1); }} style={{
            backgroundColor: "#822222", color: "white", border: "none",
            borderRadius: 10, padding: "12px", fontSize: 14,
            fontWeight: 700, cursor: "pointer",
          }}>🔄 Check Again</button>
        </div>
      )}

      {result && result.error && (
        <div style={{
          backgroundColor: "#fff1f1", border: "1px solid #da1e28",
          borderRadius: 10, padding: "16px", color: "#ba1a1a", fontSize: 13,
        }}>
          Error: {result.error}. Please try again.
          <button onClick={() => { setResult(null); setStep(3); }} style={{
            marginLeft: 12, backgroundColor: "transparent", border: "none",
            color: "#ba1a1a", cursor: "pointer", fontWeight: 700,
          }}>Retry</button>
        </div>
      )}
    </div>
  );
}