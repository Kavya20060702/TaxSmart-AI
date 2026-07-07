import { useState, useRef, useEffect } from "react";

const TAX_FORMS = [
  {
    id: "itr1",
    name: "ITR-1 (Sahaj)",
    description: "For salaried individuals with income up to ₹50 lakh",
    eligibility: "Salaried, one house property, other sources",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns",
    fields: ["PAN", "Aadhaar", "Salary Income", "TDS Details", "Bank Account"],
    tag: "Most Common",
    tagColor: { bg: "#defbe6", text: "#0e6027" },
    icon: "📋",
  },
  {
    id: "itr2",
    name: "ITR-2",
    description: "For individuals with capital gains or foreign income",
    eligibility: "Capital gains, multiple properties, foreign assets",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns",
    fields: ["PAN", "Aadhaar", "Capital Gains", "Foreign Assets", "All Income Sources"],
    tag: "Capital Gains",
    tagColor: { bg: "#fff8e1", text: "#7c5800" },
    icon: "📊",
  },
  {
    id: "form16",
    name: "Form 16",
    description: "TDS certificate issued by employer — needed for ITR filing",
    eligibility: "All salaried employees",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/",
    fields: ["Employer TAN", "Employee PAN", "Salary Breakup", "TDS Deducted", "Deductions"],
    tag: "From Employer",
    tagColor: { bg: "#dce9ff", text: "#004494" },
    icon: "🏢",
  },
  {
    id: "form26as",
    name: "Form 26AS",
    description: "Annual tax statement showing all TDS credits against your PAN",
    eligibility: "All taxpayers",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/",
    fields: ["TDS by Employer", "TDS by Bank", "Advance Tax", "Self Assessment Tax"],
    tag: "Auto Generated",
    tagColor: { bg: "#f4f4f4", text: "#525252" },
    icon: "📄",
  },
  {
    id: "form15g",
    name: "Form 15G / 15H",
    description: "Declaration to avoid TDS on interest income",
    eligibility: "15G for below 60 years, 15H for senior citizens",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/downloads",
    fields: ["Name", "PAN", "Estimated Income", "Previous Year Details"],
    tag: "TDS Exemption",
    tagColor: { bg: "#defbe6", text: "#0e6027" },
    icon: "🏦",
  },
  {
    id: "form12bb",
    name: "Form 12BB",
    description: "Investment declaration form submitted to employer for TDS calculation",
    eligibility: "All salaried employees",
    downloadUrl: "https://www.incometax.gov.in/iec/foportal/downloads",
    fields: ["HRA Details", "LTA", "80C Investments", "Home Loan Interest", "Other Deductions"],
    tag: "Submit to Employer",
    tagColor: { bg: "#fff8e1", text: "#7c5800" },
    icon: "📝",
  },
];

export default function FormVault({ language = "en" }) {
  const [selectedForm, setSelectedForm] = useState(null);
  const [guideLoading, setGuideLoading] = useState(false);
  const [guide, setGuide] = useState(null);
  const [activeSection, setActiveSection] = useState("library");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Scan states
  const [scanning, setScanning] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanningFile, setScanningFile] = useState("");

  // Check states
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkingFile, setCheckingFile] = useState("");

  const fileRef = useRef();

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/documents");
      const data = await res.json();
      if (data.status === "success") setUploadedDocs(data.files);
    } catch (e) { console.log("Could not fetch docs"); }
  };

  const getAIGuide = async (form) => {
    setSelectedForm(form);
    setGuide(null);
    setGuideLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Give me a step by step guide to fill ${form.name}. Include: who should file it, what documents are needed (${form.fields.join(", ")}), common mistakes to avoid, and deadline. Keep it practical and clear.`,
          language: "en",
        }),
      });
      const data = await res.json();
      if (data.status === "success") setGuide(data.response);
      else setGuide("Could not load guide. Please try again.");
    } catch (e) { setGuide("Could not connect to server."); }
    setGuideLoading(false);
  };

  // Upload with auto-scan
  const uploadFiles = async (files) => {
    setUploading(true);
    setScanResult(null);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("http://127.0.0.1:5000/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.status === "success") {
          // Show auto scan result if available
          if (data.scan_summary) {
            setScanningFile(data.original_name);
            setScanResult(data.scan_summary);
          }
        } else {
          alert(`Failed to upload ${file.name}`);
        }
      } catch (e) { alert(`Error uploading ${file.name}`); }
    }
    setUploading(false);
    fetchDocs();
  };

  // Manual scan
  const scanDoc = async (doc) => {
    setScanning(doc.key);
    setScanningFile(doc.name);
    setScanResult(null);
    setCheckResult(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  filename: doc.name,
  text: `Document: ${doc.name}\nSize: ${doc.size}\nUploaded: ${doc.date}\nThis appears to be a tax document. Please analyze based on filename and provide key tax information.`,
  language: language,
}),
      });
      const data = await res.json();
      if (data.status === "success") setScanResult(data.summary);
    } catch (e) { setScanResult("Scan failed. Please try again."); }
    setScanning(null);
  };

  // Completeness check
  const checkCompleteness = async (doc) => {
    setChecking(true);
    setCheckingFile(doc.name);
    setCheckResult(null);
    setScanResult(null);
    try {
      const res = await fetch("http://127.0.0.1:5000/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  filename: doc.name,
  text: `Check this tax document...`,
  language: language,
}),
      });
      const data = await res.json();
      if (data.status === "success") setCheckResult(data.summary);
    } catch (e) { setCheckResult("Check failed. Please try again."); }
    setChecking(false);
  };

  const deleteDoc = async (key, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    try {
      await fetch(`http://127.0.0.1:5000/documents/${key}`, { method: "DELETE" });
      fetchDocs();
      if (scanningFile === name) { setScanResult(null); }
      if (checkingFile === name) { setCheckResult(null); }
    } catch (e) { alert("Delete failed"); }
  };

  const tagFromName = (name) => {
    const n = name.toLowerCase();
    if (n.includes('form16') || n.includes('form_16')) return { label: 'Form 16', bg: '#dce9ff', text: '#004494' };
    if (n.includes('itr')) return { label: 'ITR', bg: '#defbe6', text: '#0e6027' };
    if (n.includes('26as')) return { label: '26AS', bg: '#f4f4f4', text: '#525252' };
    if (n.includes('80c')) return { label: '80C', bg: '#defbe6', text: '#0e6027' };
    if (n.includes('hra')) return { label: 'HRA', bg: '#fff8e1', text: '#7c5800' };
    if (n.includes('salary')) return { label: 'Salary', bg: '#dce9ff', text: '#004494' };
    return { label: 'Tax Doc', bg: '#f4f4f4', text: '#525252' };
  };

  return (
    <div style={{ padding: "32px", maxWidth: 820, margin: "0 auto" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0b1c30", margin: "0 0 4px" }}>
        Smart Form Vault
      </h2>
      <p style={{ color: "#45464d", fontSize: 14, marginBottom: 24 }}>
        Download tax forms, get AI-powered fill guides, and store your completed documents on IBM Cloud.
      </p>

      {/* IBM Badges */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {["🤖 IBM Granite Guide", "🔍 Watson NLU Scanner", "☁️ IBM Cloud Storage"].map((s) => (
          <span key={s} style={{
            backgroundColor: "#e8f1ff", color: "#0043ce",
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
          }}>{s}</span>
        ))}
      </div>

      {/* Section Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #e0e0e0", marginBottom: 28 }}>
        {[
          { id: "library", label: "📚 Forms Library" },
          { id: "vault", label: `🗄️ My Documents${uploadedDocs.length > 0 ? ` (${uploadedDocs.length})` : ""}` },
        ].map((s) => (
          <button key={s.id} onClick={() => { setActiveSection(s.id); setSelectedForm(null); setGuide(null); }} style={{
            padding: "10px 24px", border: "none", cursor: "pointer",
            backgroundColor: "transparent", fontSize: 14, fontWeight: 600,
            color: activeSection === s.id ? "#822222" : "#76777d",
            borderBottom: activeSection === s.id ? "2px solid #822222" : "2px solid transparent",
            marginBottom: -2, transition: "all 0.2s",
          }}>{s.label}</button>
        ))}
      </div>

      {/* ── Forms Library ── */}
      {activeSection === "library" && !selectedForm && (
        <div>
          <p style={{ fontSize: 13, color: "#45464d", marginBottom: 20 }}>
            Select any form to get an AI-powered step-by-step fill guide powered by IBM Granite.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TAX_FORMS.map((form) => (
              <div key={form.id} style={{
                backgroundColor: "white", border: "1px solid #e0e0e0",
                borderRadius: 12, padding: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{form.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0b1c30" }}>{form.name}</p>
                    <span style={{
                      backgroundColor: form.tagColor.bg, color: form.tagColor.text,
                      padding: "1px 8px", borderRadius: 20, fontSize: 10, fontWeight: 600,
                    }}>{form.tag}</span>
                  </div>
                </div>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: "#45464d", lineHeight: 1.5 }}>{form.description}</p>
                <p style={{ margin: "0 0 12px", fontSize: 11, color: "#76777d" }}><strong>For:</strong> {form.eligibility}</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => getAIGuide(form)} style={{
                    flex: 1, backgroundColor: "#822222", color: "white",
                    border: "none", borderRadius: 8, padding: "8px",
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                  }}>🤖 AI Guide</button>
                  <a href={form.downloadUrl} target="_blank" rel="noreferrer" style={{
                    flex: 1, backgroundColor: "#defbe6", color: "#0e6027",
                    border: "1px solid #24a148", borderRadius: 8, padding: "8px",
                    fontSize: 11, fontWeight: 700, textDecoration: "none", textAlign: "center",
                  }}>⬇️ Download</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AI Guide View ── */}
      {activeSection === "library" && selectedForm && (
        <div>
          <button onClick={() => { setSelectedForm(null); setGuide(null); }} style={{
            backgroundColor: "transparent", border: "1px solid #c6c6cd",
            borderRadius: 8, padding: "6px 16px", cursor: "pointer",
            fontSize: 13, color: "#45464d", marginBottom: 20,
            display: "flex", alignItems: "center", gap: 6,
          }}>← Back to Forms</button>

          <div style={{ backgroundColor: "#822222", borderRadius: 12, padding: "20px 24px", marginBottom: 20, color: "white" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>{selectedForm.icon}</span>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selectedForm.name}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#a6c8ff" }}>{selectedForm.description}</p>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#f8f9ff", border: "1px solid #d0e2ff", borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <p style={{ margin: "0 0 8px", fontWeight: 700, fontSize: 13, color: "#0043ce" }}>📋 Required Information</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {selectedForm.fields.map((f, i) => (
                <span key={i} style={{
                  backgroundColor: "white", border: "1px solid #d0e2ff",
                  color: "#0043ce", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                }}>{f}</span>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: "white", border: "1px solid #e0e0e0", borderRadius: 12, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#6cf8bb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0b1c30" }}>IBM Granite AI Guide</p>
                <p style={{ margin: 0, fontSize: 11, color: "#76777d" }}>Powered by watsonx.ai</p>
              </div>
            </div>
            {guideLoading ? (
              <div style={{ textAlign: "center", padding: "30px", color: "#76777d" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <p style={{ margin: 0, fontSize: 13 }}>IBM Granite is generating your guide...</p>
              </div>
            ) : guide ? (
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.8, color: "#0b1c30", whiteSpace: "pre-wrap" }}>{guide}</p>
            ) : null}
          </div>

          <a href={selectedForm.downloadUrl} target="_blank" rel="noreferrer" style={{
            display: "block", marginTop: 16, backgroundColor: "#2F4F4F", color: "white",
            border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>⬇️ Download {selectedForm.name} from Income Tax Portal</a>
        </div>
      )}

      {/* ── My Documents (Vault) ── */}
      {activeSection === "vault" && (
        <div>
          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); uploadFiles(Array.from(e.dataTransfer.files)); }}
            onClick={() => fileRef.current.click()}
            style={{
              border: `2px dashed ${dragging ? "#2F4F4F" : "#c6c6cd"}`,
              borderRadius: 12, padding: "32px 24px", textAlign: "center",
              backgroundColor: dragging ? "#defbe6" : uploading ? "#eff4ff" : "#f8f9ff",
              cursor: "pointer", marginBottom: 20, transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>{uploading ? "⏳" : "📁"}</div>
            <p style={{ fontWeight: 600, color: "#0b1c30", margin: "0 0 4px" }}>
              {uploading ? "Uploading to IBM Cloud..." : "Drop files here or click to upload"}
            </p>
            <p style={{ color: "#76777d", fontSize: 12, margin: "0 0 4px" }}>PDF, JPG, PNG — stored on IBM Cloud Object Storage</p>
            <p style={{ color: "#0043ce", fontSize: 11, margin: 0, fontWeight: 600 }}>
              ✨ Auto-scanned by IBM Granite AI on upload
            </p>
            <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: "none" }}
              onChange={(e) => uploadFiles(Array.from(e.target.files))} />
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div style={{
              backgroundColor: "#defbe6", border: "1px solid #24a148",
              borderRadius: 10, padding: "16px 20px", marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#0e6027", fontSize: 14 }}>
                  🔍 AI Scan Result — {scanningFile}
                </p>
                <button onClick={() => setScanResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0e6027", fontSize: 18 }}>✕</button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#0b1c30", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{scanResult}</p>
            </div>
          )}

          {/* Completeness Check Result */}
          {checkResult && (
            <div style={{
              backgroundColor: "#e8f1ff", border: "1px solid #0043ce",
              borderRadius: 10, padding: "16px 20px", marginBottom: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ margin: 0, fontWeight: 700, color: "#0043ce", fontSize: 14 }}>
                  ✅ Completeness Check — {checkingFile}
                </p>
                <button onClick={() => setCheckResult(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0043ce", fontSize: 18 }}>✕</button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#0b1c30", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{checkResult}</p>
            </div>
          )}

          {/* Documents List */}
          {uploadedDocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#76777d" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗄️</div>
              <p style={{ fontWeight: 600, margin: "0 0 4px" }}>No documents yet</p>
              <p style={{ fontSize: 13, margin: 0 }}>Upload your filled tax forms above to store them securely on IBM Cloud</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {uploadedDocs.map((doc, i) => {
                const tag = tagFromName(doc.name);
                return (
                  <div key={i} style={{
                    backgroundColor: "white", border: "1px solid #e0e0e0",
                    borderRadius: 10, padding: "14px 18px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          backgroundColor: "#eff4ff", display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: 20,
                        }}>📄</div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#0b1c30" }}>{doc.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#76777d" }}>{doc.size} · {doc.date}</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {/* Tag */}
                        <span style={{
                          backgroundColor: tag.bg, color: tag.text,
                          padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                        }}>{tag.label}</span>

                        {/* Scan Button */}
                        <button onClick={() => scanDoc(doc)} disabled={scanning === doc.key} style={{
                          backgroundColor: "#eff4ff", color: "#0043ce",
                          border: "1px solid #c6c6cd", borderRadius: 8,
                          padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                        }}>
                          {scanning === doc.key ? "⏳ Scanning..." : "🔍 Scan"}
                        </button>

                        {/* Check Button */}
                        <button onClick={() => checkCompleteness(doc)} disabled={checking} style={{
                          backgroundColor: "#defbe6", color: "#0e6027",
                          border: "1px solid #24a148", borderRadius: 8,
                          padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                        }}>
                          {checking && checkingFile === doc.name ? "⏳ Checking..." : "✅ Check"}
                        </button>

                        {/* Delete */}
                        <button onClick={() => deleteDoc(doc.key, doc.name)} style={{
                          backgroundColor: "transparent", border: "none",
                          color: "#ba1a1a", cursor: "pointer", fontSize: 18,
                        }}>🗑</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}