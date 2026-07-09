from ibm_watsonx_ai import APIClient, Credentials
from dotenv import load_dotenv
import os
import chromadb

load_dotenv()

# ---- Tax Knowledge Documents ----
TAX_DOCUMENTS = [
    {
        "id": "doc1",
        "title": "Section 80C — Tax Saving Investments",
        "text": "Section 80C allows deductions up to Rs 1.5 lakh per year..."
    },
    {
        "id": "doc2",
        "title": "Section 80D — Health Insurance",
        "text": "Section 80D allows deduction for health insurance premiums..."
    },
    {
        "id": "doc3",
        "title": "Old vs New Tax Regime Comparison",
        "text": "Old Tax Regime vs New Tax Regime: Old regime allows all deductions..."
    },
    {
        "id": "doc4",
        "title": "HRA Exemption Rules",
        "text": "HRA (House Rent Allowance) exemption is calculated as minimum of..."
    },
    {
        "id": "doc5",
        "title": "Standard Deduction FY 2024-25",
        "text": "Standard deduction of Rs 75,000 is available for salaried employees..."
    },
    {
        "id": "doc6",
        "title": "Section 80CCD — NPS Deduction",
        "text": "Section 80CCD(1B) allows additional deduction of Rs 50,000 for NPS..."
    },
    {
        "id": "doc7",
        "title": "Capital Gains Tax",
        "text": "Capital gains tax: Short term capital gains (STCG) on equity funds..."
    },
    {
        "id": "doc8",
        "title": "TDS and Form 16 Guide",
        "text": "TDS (Tax Deducted at Source): Employer deducts TDS from salary..."
    },
    {
        "id": "doc9",
        "title": "Section 24B — Home Loan Interest",
        "text": "Section 24B allows deduction on home loan interest up to Rs 2 lakh..."
    },
    {
        "id": "doc10",
        "title": "Income Tax Slabs FY 2024-25",
        "text": "Income tax slabs for new regime FY 2024-25: Income up to Rs 3 lakh nil tax..."
    },
    {
        "id": "doc11",
        "title": "UPI Payments Guide",
        "text": "UPI (Unified Payments Interface) is a real-time payment system..."
    },
    {
        "id": "doc12",
        "title": "Online Financial Scam Awareness",
        "text": "Online financial scams to avoid: (1) Never share OTP, PIN..."
    },
    {
        "id": "doc13",
        "title": "Personal Budgeting — 50-30-20 Rule",
        "text": "Personal budgeting basics: Follow the 50-30-20 rule..."
    },
    {
        "id": "doc14",
        "title": "Interest Rates in India",
        "text": "Interest rates in India: Savings account interest rate is typically 2.5-4%..."
    },
    {
        "id": "doc15",
        "title": "Digital Banking Safety Tips",
        "text": "Digital banking safety tips: Always use official bank apps..."
    },
]

# ---- Setup ChromaDB ----
def setup_knowledge_base():
    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    
    # Delete collection if exists to avoid duplicates
    try:
        chroma_client.delete_collection("tax_knowledge")
    except:
        pass
    
    collection = chroma_client.create_collection("tax_knowledge")
    
    # Add documents
    collection.add(
    documents=[doc["text"] for doc in TAX_DOCUMENTS],
    ids=[doc["id"] for doc in TAX_DOCUMENTS],
    metadatas=[{"title": doc["title"]} for doc in TAX_DOCUMENTS]
)
    
    print(f"Knowledge base ready with {len(TAX_DOCUMENTS)} tax documents!")
    return chroma_client, collection

# ---- Search Function ----
def search_knowledge(collection, query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    docs = results['documents'][0]
    ids = results['ids'][0]
    metadatas = results['metadatas'][0]
    
    # Build source citations
    sources = []
    for i, (doc_id, meta) in enumerate(zip(ids, metadatas)):
        sources.append({
            "id": doc_id,
            "title": meta.get("title", doc_id),
            "rank": i + 1
        })
    
    combined = "\n\n".join(docs)
    return combined, sources

# ---- Test it ----
if __name__ == "__main__":
    client, collection = setup_knowledge_base()
    
    test_query = "What can I invest in to save tax?"
    results = search_knowledge(collection, test_query)
    
    print("\nQuery:", test_query)
    print("\nRelevant docs found:")
    print(results)