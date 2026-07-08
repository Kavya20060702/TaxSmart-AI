# TaxSmart AI 💰

> **IBM SkillsBuild AICTE 2026 — Problem Statement #7**
> AI Agent for Digital Financial Literacy

<div align="center">

![IBM Cloud](https://img.shields.io/badge/IBM%20Cloud-Powered-054ADA?style=for-the-badge&logo=ibm)
![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Granite-8A3FFC?style=for-the-badge)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python)

</div>

---

## 📌 Overview

**TaxSmart AI** is a full-stack, RAG-powered AI agent that helps Indian citizens navigate income tax, UPI payments, online scam awareness, and personal finance management — all in one platform, available in English and Hindi.

Built entirely on **IBM Cloud Lite (Free) services**, the project demonstrates how enterprise-grade AI can be made accessible for financial literacy at scale.

---

## 🎯 Problem Statement Alignment

| PS #7 Requirement | Implementation |
|---|---|
| RAG-based AI Agent | ChromaDB + sentence-transformers + watsonx.ai Granite |
| Tax practices | 80C, 80D, HRA, Old vs New regime, TDS, capital gains |
| UPI guidance | Knowledge base doc on UPI safety and transaction limits |
| Online scam awareness | Dedicated KB doc — KYC fraud, phishing, how to report |
| Personal finance | 50-30-20 budgeting, interest rates, emergency fund guidance |
| Multilingual support | Full Hindi/English toggle — Granite responds in selected language |
| IBM Cloud services | 5 IBM services actively integrated |

---

## ☁️ IBM Cloud Architecture

<img width="1211" height="864" alt="Image" src="https://github.com/user-attachments/assets/b94111b3-127a-4be5-8f24-a5b85c8bfd38" />


## ☁️ IBM Services Used (5 Active Services)

| # | Service | How Used |
|---|---------|----------|
| 1 | **watsonx.ai** | Foundation model inference — chat, document scanning, form guides, bilingual responses |
| 2 | **Watson Machine Learning** | Serves the foundation model endpoint via WML |
| 3 | **Watson Natural Language Understanding** | Keyword extraction from user queries to enhance RAG retrieval accuracy |
| 4 | **Watson Assistant** | Conversational AI service — integrated and active |
| 5 | **IBM Cloud Object Storage** | Secure cloud storage for all uploaded tax documents |

---

## ✨ Features

### 💬 AI Tax Chat with Citation-Based RAG
- Ask any question about Indian tax, UPI, scams, budgeting
- **Citation-Based RAG** — shows exactly which knowledge base document was used
- **Watson NLU** keyword extraction improves retrieval accuracy
- Powered by 15-document knowledge base covering all PS #7 topics

### 🎤 Voice Input
- Click mic → speak your question
- Works in **English (en-IN)** and **Hindi (hi-IN)**

### 🌐 Hindi / English Toggle
- Switch language from top nav
- All AI responses (chat, scan, form guides) respond in selected language

### 🧮 Tax Calculator
- Enter income + deductions (80C, 80D, home loan)
- Compares Old Regime vs New Regime instantly
- Highlights better option with exact savings amount
- Applies Section 87A rebate automatically

### 📅 Deadline Calendar
- Interactive calendar (navigate months)
- ITR deadlines highlighted on actual dates with days-left counter
- Side-by-side layout — deadline cards + calendar view
- Urgent deadline alerts

### 📊 Filing Readiness Meter
- 3-step wizard — income details, documents, deductions
- IBM Granite gives **readiness score out of 100**
- Action plan with specific steps to become filing-ready
- Recommends correct ITR form (ITR-1, ITR-2 etc.)

### 🗄️ Smart Form Vault
**Forms Library:**
- 6 tax forms (ITR-1, ITR-2, Form 16, 26AS, 15G/H, 12BB)
- Official download links to Income Tax Portal
- **IBM Granite AI Guide** — step-by-step fill instructions per form

**My Documents:**
- Drag & drop upload → stored on **IBM Cloud Object Storage**
- **Auto-scan on upload** — Granite extracts tax info from PDFs instantly
- **Manual Scan** — detailed AI analysis on demand
- **Completeness Check** — AI verifies required fields are present
- **Auto-links to Doc Checker** — uploading Form16.pdf auto-ticks Form 16 in Doc Checker

### ✅ AI Document Completeness Checker
- 12-document checklist across 6 categories (Identity, Salary, Tax, Banking, Deductions, Investments)
- CRITICAL document badges
- IBM Granite gives **completeness score out of 100**
- Missing documents listed with exact instructions on where to obtain them
- **Smart integration** — Form Vault uploads auto-check relevant items

### 📚 Knowledge Base (15 Documents)
| # | Document | Topic |
|---|----------|-------|
| 1 | Section 80C | PPF, ELSS, LIC, NSC, EPF deductions |
| 2 | Section 80D | Health insurance deductions |
| 3 | Old vs New Regime | Complete comparison |
| 4 | HRA Calculation | Exemption rules |
| 5 | Standard Deduction | FY 2024-25 rates |
| 6 | Section 80CCD | NPS additional deduction |
| 7 | Capital Gains Tax | STCG, LTCG rates |
| 8 | TDS & Form 16 | Salary TDS guide |
| 9 | Section 24B | Home loan interest |
| 10 | Income Tax Slabs | FY 2024-25 new regime |
| 11 | UPI Payments | Safety guide, limits |
| 12 | Online Scams | KYC fraud, phishing, reporting |
| 13 | 50-30-20 Budgeting | Personal finance |
| 14 | Interest Rates | FD, home loan, credit card |
| 15 | Digital Banking | Safety tips |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (hooks, inline styles) |
| Backend | Python 3.13, Flask, Flask-CORS |
| LLM | IBM watsonx.ai — `mistralai/mistral-small-3-1-24b-instruct-2503` |
| NLP | IBM Watson Natural Language Understanding |
| RAG | ChromaDB + sentence-transformers (all-MiniLM-L6-v2) |
| PDF Parsing | PyMuPDF (fitz) |
| Cloud Storage | IBM Cloud Object Storage (ibm-cos-sdk) |
| Voice | Browser Web Speech API |

---
## 🎥 Demo

https://github.com/user-attachments/assets/f63c2a2f-60c5-4469-b753-9652f879395b

**Features to demonstrate:**
1. Ask a tax question → see Citation-Based RAG sources
2. Switch to Hindi → ask in Hindi → get Hindi response
3. Use voice input
4. Tax Calculator → Old vs New regime comparison
5. Filing Readiness → 3-step wizard → score + action plan
6. Upload Form 16 PDF → auto-scan + auto-check in Doc Checker
7. Doc Checker → see Form 16 already ticked → check remaining → get completeness score

---

## 📁 Project Structure

```
taxsmart-ai/
├── backend/
│   ├── app.py                  # Flask API — 7 endpoints
│   ├── knowledge_base.py       # ChromaDB RAG — 15 documents
│   └── .env                    # IBM credentials (not committed)
├── frontend/
│   └── src/
│       ├── App.js              # Main app — navigation, chat, language
│       ├── TaxCalculator.js    # Old vs New regime calculator
│       ├── FormVault.js        # Forms library + document vault
│       ├── FilingReadiness.js  # 3-step ITR readiness wizard
│       └── DocChecker.js       # Document completeness checker
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | IBM Service | Description |
|--------|----------|------------|-------------|
| POST | `/chat` | watsonx.ai + NLU | RAG-powered chat with citations |
| GET | `/health` | — | Service status check |
| POST | `/upload` | COS + watsonx.ai | Upload + auto-scan document |
| GET | `/documents` | COS | List all stored documents |
| DELETE | `/documents/<key>` | COS | Delete document |
| POST | `/scan` | watsonx.ai | AI scan / completeness check |
| POST | `/filing-readiness` | watsonx.ai | ITR readiness analysis |
| POST | `/doc-checker` | watsonx.ai | Document completeness audit |

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- IBM Cloud account (Lite/Free tier)

### IBM Services to Create
All free on IBM Cloud Lite:
1. **watsonx.ai Studio** → create project → associate Watson Machine Learning
2. **Watson Natural Language Understanding** → Lite plan
3. **Watson Assistant** → Lite plan
4. **Cloud Object Storage** → Lite plan → create bucket `taxsmart-documents`

### Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install flask flask-cors ibm-watsonx-ai chromadb \
    sentence-transformers python-dotenv ibm-watson \
    ibm-cos-sdk pymupdf
```

Create `backend/.env`:
```env
IBM_API_KEY=your_watsonx_api_key
IBM_PROJECT_ID=your_project_id
IBM_URL=https://us-south.ml.cloud.ibm.com
NLU_API_KEY=your_nlu_api_key
NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/YOUR_ID
COS_API_KEY=your_cos_api_key
COS_INSTANCE_ID=crn:v1:bluemix:public:cloud-object-storage:...
COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
COS_BUCKET=taxsmart-documents
```

```bash
python app.py
# → All systems ready! Running on http://127.0.0.1:5000
```

### Frontend

```bash
cd frontend
npm install
npm start
# → Running on http://localhost:3000
```

---

## 👩‍💻 Author

**P. Kavya Sai**
B.Tech CSE (NLP Specialization) — KL University, Hyderabad
LeetCode: 1759 | CodeChef: 1132
IBM SkillsBuild Virtual Internship — AICTE 2026

---

## ⚠️ Disclaimer

TaxSmart AI provides general tax and financial information for educational purposes only. Always consult a qualified tax professional for important financial decisions.

---

## 📄 License

MIT License — feel free to use and build upon this project.
ENDOFFILE
