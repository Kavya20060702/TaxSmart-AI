import { useState } from "react";

const DOCUMENTS = [
  {
    key: "pan",
    label: "PAN Card",
    icon: "🪪",
    critical: true,
    howToGet: "Download from NSDL or UTIITSL portal",
    category: "Identity",
  },
  {
    key: "aadhaar",
    label: "Aadhaar Card",
    icon: "🪪",
    critical: true,
    howToGet: "Download from myaadhaar.uidai.gov.in",
    category: "Identity",
  },
  {
    key: "form16",
    label: "Form 16 (TDS Certificate)",
    icon: "🏢",
    critical: true,
    howToGet: "Request from your employer's HR/payroll department",
    category: "Salary",
  },
  {
    key: "form26as",
    label: "Form 26AS (Annual Tax Statement)",
    icon: "📄",
    critical: true,
    howToGet: "Download from incometax.gov.in → e-File → View Form 26AS",
    category: "Tax",
  },
  {
    key: "ais",
    label: "AIS / TIS Statement",
    icon: "📊",
    critical: true,
    howToGet: "Download from incometax.gov.in → Services → AIS",
    category: "Tax",
  },
  {
    key: "bank",
    label: "Bank Statements (All Accounts)",
    icon: "🏦",
    critical: true,
    howToGet: "Download from your bank's net banking portal",
    category: "Banking",
  },
  {
    key: "inv_80c",
    label: "80C Investment Proofs",
    icon: "📋",
    critical: false,
    howToGet: "PPF passbook, ELSS statement, LIC premium receipt, NSC certificate",
    category: "Deductions",
  },
  {
    key: "ins_80d",
    label: "Health Insurance Receipt (80D)",
    icon: "🏥",
    critical: false,
    howToGet: "Premium receipt from your health insurance company",
    category: "Deductions",
  },
  {
    key: "homeloan",
    label: "Home Loan Interest Certificate",
    icon: "🏠",
    critical: false,
    howToGet: "Request from your bank's home loan department",
    category: "Deductions",
  },
  {
    key: "hra",
    label: "Rent Receipts (HRA)",
    icon: "🧾",
    critical: false,
    howToGet: "Monthly rent receipts from landlord + rental agreement",
    category: "Deductions",
  },
  {
    key: "prev_itr",
    label: "Previous Year ITR Copy",
    icon: "📁",
    critical: false,
    howToGet: "Download from incometax.gov.in → e-File → View Filed Returns",
    category: "Reference",
  },
  {
    key: "cap_gains",
    label: "Capital Gains Statement",
    icon: "📈",
    critical: false,
    howToGet: "Download from your broker/demat account (Zerodha, Groww etc.)",
    category: "Investments",
  },
];

const CATEGORIES = ["Identity", "Salary", "Tax", "Banking", "Deductions", "Investments", "Reference"];

export default function DocChecker({ language }) {
  const [checked, setChecked] = useState({});
  const [employment_type, setEmploymentType] = useState("Salaried");
  const [regime, setRegime] = useState("New Regime");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggle = (key) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const criticalCount = DOCUMENTS.filter(d => d.critical).length;
  const criticalChecked = DOCUMENTS.filter(d => d.critical && checked[d.key]).length;

  const checkDocs = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/doc-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checked,
          employment_type,
          regime,
          language,
        }),
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

  return (
    <div style={{ padding: "32px", maxWidth: 820, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0b1c30", margin: "0 0 4px" }}>
        ✅ AI Document Completeness Checker
      </h2>
      <p style={{ color: "#45464d", fontSize: 14, marginBottom: 24 }}>
        Check which documents you have and IBM Granite AI will tell you what's missing for ITR filing.
      </p>

      {/* IBM Badge */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["🤖 IBM Granite Checker", "📋 ITR Document Audit", "💡 Get Missing Docs"].map((s) => (
          <span key={s} style={{
            backgroundColor: "#e8f1ff", color: "#0043ce",
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>{s}</span>
        ))}
      </div>

      {/* Quick Settings */}
      <div style={{
        backgroundColor: "white", border: "1px solid #e0e0e0",
        borderRadius: 12, padding: "16px 20px", marginBottom: 24,
        display: "flex", gap: 24, flexWrap: "wrap",
      }}>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#45464d" }}>EMPLOYMENT TYPE</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["Salaried", "Self Employed", "Business"].map((t) => (
              <button key={t} onClick={() => setEmploymentType(t)} style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid",
                borderColor: employment_type === t ? "#822222" : "#c6c6cd",
                backgroundColor: employment_type === t ? "#822222" : "white",
                color: employment_type === t ? "white" : "#45464d",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#45464d" }}>TAX REGIME</p>
          <div style={{ display: "flex", gap: 6 }}>
            {["New Regime", "Old Regime"].map((r) => (
              <button key={r} onClick={() => setRegime(r)} style={{
                padding: "5px 12px", borderRadius: 20, border: "1px solid",
                borderColor: regime === r ? "#2F4F4F" : "#c6c6cd",
                backgroundColor: regime === r ? "#2F4F4F" : "white",
                color: regime === r ? "white" : "#45464d",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}>{r}</button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "#45464d" }}>
            {checkedCount} / {DOCUMENTS.length} documents
          </p>
          <p style={{ margin: 0, fontSize: 11, color: criticalChecked === criticalCount ? "#0e6027" : "#ba1a1a" }}>
            {criticalChecked}/{criticalCount} critical docs ✓
          </p>
        </div>
      </div>

      {/* Document Checklist by Category */}
      {!result && (
        <>
          {CATEGORIES.map((cat) => {
            const catDocs = DOCUMENTS.filter(d => d.category === cat);
            if (catDocs.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <p style={{
                  margin: "0 0 10px", fontSize: 11, fontWeight: 700,
                  color: "#76777d", textTransform: "uppercase", letterSpacing: "0.06em",
                }}>{cat}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {catDocs.map((doc) => (
                    <div key={doc.key} onClick={() => toggle(doc.key)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      backgroundColor: checked[doc.key] ? "#defbe6" : "white",
                      border: `1px solid ${checked[doc.key] ? "#24a148" : doc.critical ? "#ffb3b8" : "#e0e0e0"}`,
                      borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                      transition: "all 0.15s",
                    }}>
                      {/* Checkbox */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        backgroundColor: checked[doc.key] ? "#24a148" : "white",
                        border: `2px solid ${checked[doc.key] ? "#24a148" : "#c6c6cd"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {checked[doc.key] && <span style={{ color: "white", fontSize: 13, fontWeight: 700 }}>✓</span>}
                      </div>

                      <span style={{ fontSize: 18, flexShrink: 0 }}>{doc.icon}</span>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0b1c30" }}>{doc.label}</span>
                          {doc.critical && (
                            <span style={{
                              backgroundColor: "#fff1f1", color: "#ba1a1a",
                              padding: "1px 6px", borderRadius: 10,
                              fontSize: 9, fontWeight: 700,
                            }}>CRITICAL</span>
                          )}
                        </div>
                        {!checked[doc.key] && (
                          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#76777d" }}>
                            📍 {doc.howToGet}
                          </p>
                        )}
                      </div>

                      {checked[doc.key] && (
                        <span style={{ color: "#24a148", fontSize: 18, flexShrink: 0 }}>✅</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Check Button */}
          <button onClick={checkDocs} disabled={loading || checkedCount === 0} style={{
            width: "100%", backgroundColor: checkedCount === 0 ? "#c6c6cd" : "#2F4F4F",
            color: "white", border: "none", borderRadius: 10,
            padding: "14px", fontSize: 15, fontWeight: 700,
            cursor: checkedCount === 0 ? "not-allowed" : "pointer",
            marginTop: 8,
          }}>
            {loading ? "⏳ IBM Granite is analyzing..." : "🔍 Check Document Completeness"}
          </button>
        </>
      )}

      {/* Result */}
      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Score */}
          {(() => {
            const colors = scoreColor(result.score);
            return (
              <div style={{
                backgroundColor: colors.bg, border: `2px solid ${colors.bar}`,
                borderRadius: 16, padding: "24px", textAlign: "center",
              }}>
                <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: colors.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Document Completeness Score
                </p>
                <div style={{ fontSize: 64, fontWeight: 900, color: colors.text, lineHeight: 1 }}>
                  {result.score}
                </div>
                <p style={{ margin: "4px 0 16px", fontSize: 11, color: colors.text }}>out of 100</p>
                <div style={{ backgroundColor: "rgba(0,0,0,0.1)", borderRadius: 10, height: 10, overflow: "hidden", marginBottom: 12 }}>
                  <div style={{
                    width: `${result.score}%`, height: "100%",
                    backgroundColor: colors.bar, borderRadius: 10,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>
            );
          })()}

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Docs", value: DOCUMENTS.length, color: "#0043ce", bg: "#e8f1ff" },
              { label: "You Have", value: checkedCount, color: "#0e6027", bg: "#defbe6" },
              { label: "Missing", value: DOCUMENTS.length - checkedCount, color: "#ba1a1a", bg: "#fff1f1" },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: stat.bg, borderRadius: 10,
                padding: "14px", textAlign: "center",
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: stat.color }}>{stat.label}</div>
              </div>
            ))}
          </div>

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

          {/* Check Again */}
          <button onClick={() => { setResult(null); setChecked({}); }} style={{
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
          Error: {result.error}
          <button onClick={() => setResult(null)} style={{
            marginLeft: 12, backgroundColor: "transparent",
            border: "none", color: "#ba1a1a", cursor: "pointer", fontWeight: 700,
          }}>Retry</button>
        </div>
      )}
    </div>
  );
}