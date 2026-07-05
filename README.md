# TaxSmart AI 💰🇮🇳

> An AI-powered Indian Tax & Financial Literacy Assistant built on IBM Cloud

[![IBM Cloud](https://img.shields.io/badge/IBM%20Cloud-Powered-blue?logo=ibm)](https://cloud.ibm.com)
[![watsonx.ai](https://img.shields.io/badge/watsonx.ai-Granite-purple)](https://www.ibm.com/watsonx)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Backend-Flask-black?logo=flask)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📌 Problem Statement

**PS #7 — AI Agent for Digital Financial Literacy**
IBM SkillsBuild University Engagements — AICTE 2026

> Build a RAG-based AI agent that helps users understand and navigate essential financial tools, tax practices, UPI, online scam awareness, and personal finance management — with multilingual support.

---

## 🎯 What is TaxSmart AI?

TaxSmart AI is a full-stack AI-powered tax and financial literacy assistant that helps Indian citizens:

- 💬 Ask any income tax or personal finance question in **English or Hindi**
- 🧮 Calculate their **Old vs New tax regime** and find out which saves more
- 📅 Track **ITR filing deadlines** on a visual calendar
- 📁 Upload and **AI-scan tax documents** stored securely on IBM Cloud
- 📚 Download official **tax forms** with **IBM Granite AI fill guides**
- 🎤 Ask questions using **voice input** (mic)
- 🔍 Get **keyword-aware answers** powered by Watson NLU + RAG

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  AI Chat │ Tax Calculator │ Calendar │ Form Vault    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────┐
│                 Flask Backend (Python)               │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Watson NLU  │  │  ChromaDB    │  │  PyMuPDF   │  │
│  │  Keywords   │  │  RAG Search  │  │ PDF Parser │  │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘  │
│         └────────────────▼────────────────┘          │
│                  ┌──────────────┐                     │
│                  │ watsonx.ai   │                     │
│                  │   Granite    │                     │
│                  └──────────────┘                     │
│                  ┌──────────────┐                     │
│                  │  IBM Cloud   │                     │
│                  │Object Storage│                     │
│                  └──────────────┘                     │
└─────────────────────────────────────────────────────┘
```

---

## ☁️ IBM Cloud Services Used

| # | Service | Purpose |
|---|---------|---------|
| 1 | **watsonx.ai (Foundation Models)** | Core LLM for chat, document scanning, form guides, Hindi responses |
| 2 | **Watson Machine Learning** | Serves the foundation model inference endpoint |
| 3 | **Watson Natural Language Understanding** | Extracts keywords from user queries to enhance RAG retrieval |
| 4 | **Watson Assistant** | Conversational AI service integration |
| 5 | **IBM Cloud Object Storage** | Secure storage for all uploaded tax documents |

---

## ✨ Features

### 💬 AI Tax Chat
- Ask any question about Indian income tax, UPI, scams, budgeting
- Powered by **RAG pipeline** — answers grounded in 15-document knowledge base
- **Watson NLU** extracts keywords to improve search accuracy
- Shows NLU-detected keywords with every response
- Suggested questions for quick start

### 🎤 Voice Input
- Click mic button and speak your question
- Works in **English (en-IN)** and **Hindi (hi-IN)**
- Uses browser Web Speech API

### 🌐 Bilingual Support
- Toggle between **English** and **Hindi** (हि)
- Granite LLM responds in the selected language

### 🧮 Tax Calculator
- Enter gross income + deductions (80C, 80D, home loan interest)
- Instantly compares **Old Regime vs New Regime**
- Shows taxable income, income tax, 4% cess, total tax
- Highlights the better regime with savings amount
- Applies rebate under Section 87A automatically

### 📅 Deadline Calendar
- Full interactive calendar (navigate months)
- ITR filing deadlines highlighted on actual dates
- Today highlighted in blue
- Urgent deadlines in yellow with URGENT badge
- Deadline list below calendar for current month

### 🗄️ Smart Form Vault
**Forms Library:**
- 6 common tax forms (ITR-1, ITR-2, Form 16, 26AS, 15G/H, 12BB)
- Official download links to Income Tax Portal
- **IBM Granite AI Guide** — step-by-step instructions to fill each form

**My Documents:**
- Drag & drop or click to upload PDFs/images
- Files stored on **IBM Cloud Object Storage**
- **Auto-scan on upload** — Granite AI extracts key tax info from PDFs
- **Manual Scan** button — AI analysis of any document
- **Completeness Check** — AI verifies if required fields are present
- Smart auto-tagging (Form 16, ITR, HRA, 80C etc.)
- Delete documents

### 📚 Knowledge Base (RAG)
15 documents covering:
- Section 80C, 80D, 80CCD(1B), Section 24B
- Old vs New tax regime comparison (FY 2024-25)
- HRA calculation rules
- Capital gains tax (STCG, LTCG)
- TDS and Form 16 guidance
- Income tax slabs FY 2024-25 + 87A rebate
- Standard deduction (old vs new regime)
- UPI payments guide
- Online scam awareness + how to report
- Personal budgeting (50-30-20 rule)
- Interest rates (savings, FD, home loan, personal loan)
- Digital banking safety tips

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (functional components, hooks, inline styles) |
| Backend | Python 3.13, Flask, Flask-CORS |
| LLM | IBM watsonx.ai — `mistralai/mistral-small-3-1-24b-instruct-2503` |
| NLP | IBM Watson Natural Language Understanding |
| RAG | ChromaDB (local vector store) + sentence-transformers |
| PDF | PyMuPDF (fitz) |
| Storage | IBM Cloud Object Storage (`ibm-cos-sdk`) |
| Voice | Browser Web Speech API |
| Auth | IBM IAM API Key |

---

## 📁 Project Structure

```
taxsmart-ai/
├── backend/
│   ├── app.py              # Flask API (5 endpoints)
│   ├── knowledge_base.py   # ChromaDB RAG (15 documents)
│   ├── .env                # IBM credentials (not committed)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app (chat, toolkit, form vault)
│   │   ├── TaxCalculator.js
│   │   └── FormVault.js
│   └── package.json
└── README.md
```

---

## 🚀 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- IBM Cloud account (Lite/Free tier)

### IBM Services Required
Create these on [cloud.ibm.com](https://cloud.ibm.com) (all free Lite tier):
1. watsonx.ai Studio + Watson Machine Learning
2. Watson Natural Language Understanding
3. Watson Assistant
4. Cloud Object Storage (create a bucket named `taxsmart-documents`)

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

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
NLU_URL=https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/YOUR_INSTANCE_ID
COS_API_KEY=your_cos_api_key
COS_INSTANCE_ID=crn:v1:bluemix:public:cloud-object-storage:...
COS_ENDPOINT=https://s3.us-south.cloud-object-storage.appdomain.cloud
COS_BUCKET=taxsmart-documents
```

Run backend:
```bash
python app.py
# → Running on http://127.0.0.1:5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
# → Running on http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | AI chat with RAG + NLU |
| GET | `/health` | Health check + service status |
| POST | `/upload` | Upload document to IBM COS + auto-scan |
| GET | `/documents` | List all documents from IBM COS |
| DELETE | `/documents/<key>` | Delete document from IBM COS |
| POST | `/scan` | AI scan/completeness check on document |

---

## 📸 Screenshots

| AI Chat | Tax Calculator | Form Vault |
|---------|---------------|------------|
| RAG-powered Q&A with NLU keywords | Old vs New regime comparison | Forms library + My Documents |

---

## 🙋 Author

**Kavya Sai**
B.Tech CSE (NLP Specialization) — KL University, Hyderabad
IBM SkillsBuild Virtual Internship — AICTE 2026

---

## ⚠️ Disclaimer

TaxSmart AI provides general tax and financial information for educational purposes only. It is not a substitute for professional tax or financial advice. Always verify important financial decisions with a qualified professional.

---

## 📄 License

This project is licensed under the MIT License.
