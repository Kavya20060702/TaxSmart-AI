from ibm_watsonx_ai import APIClient, Credentials
from dotenv import load_dotenv
import os
import chromadb

load_dotenv()

# ---- Tax Knowledge Documents ----
TAX_DOCUMENTS = [
    {
        "id": "doc1",
        "text": "Section 80C allows deductions up to Rs 1.5 lakh per year. Eligible investments include PPF, ELSS mutual funds, NSC, life insurance premiums, EPF, tuition fees for children, home loan principal repayment, and tax saving FDs with 5 year lock-in."
    },
    {
        "id": "doc2",
        "text": "Section 80D allows deduction for health insurance premiums. Up to Rs 25,000 for self, spouse and children. Additional Rs 25,000 for parents. If parents are senior citizens, limit increases to Rs 50,000."
    },
    {
        "id": "doc3",
        "text": "Old Tax Regime vs New Tax Regime: Old regime allows all deductions like 80C, 80D, HRA, LTA. New regime has lower tax rates but no deductions. New regime rates: 0% up to 3 lakh, 5% from 3-7 lakh, 10% from 7-10 lakh, 15% from 10-12 lakh, 20% from 12-15 lakh, 30% above 15 lakh."
    },
    {
        "id": "doc4",
        "text": "HRA (House Rent Allowance) exemption is calculated as minimum of: actual HRA received, 50% of salary for metro cities or 40% for non-metro, actual rent paid minus 10% of salary. Metro cities are Mumbai, Delhi, Chennai, Kolkata."
    },
    {
        "id": "doc5",
        "text": "Standard deduction of Rs 75,000 is available for salaried employees under new tax regime from FY 2024-25. Under old regime standard deduction is Rs 50,000."
    },
    {
        "id": "doc6",
        "text": "Section 80CCD(1B) allows additional deduction of Rs 50,000 for contribution to NPS (National Pension System) over and above 80C limit. This is available only in old tax regime."
    },
    {
        "id": "doc7",
        "text": "Capital gains tax: Short term capital gains (STCG) on equity funds held less than 1 year is taxed at 20%. Long term capital gains (LTCG) on equity above Rs 1.25 lakh is taxed at 12.5%. Debt fund gains are taxed as per income tax slab."
    },
    {
        "id": "doc8",
        "text": "TDS (Tax Deducted at Source): Employer deducts TDS from salary based on estimated annual income. Form 16 is issued by employer showing TDS deducted. Form 26AS shows all TDS credits. ITR must be filed by July 31 every year for individuals."
    },
    {
        "id": "doc9",
        "text": "Section 24B allows deduction on home loan interest up to Rs 2 lakh per year for self occupied property under old tax regime. For let out property entire interest is deductible. No deduction on home loan interest under new tax regime."
    },
    {
        "id": "doc10",
        "text": "Income tax slabs for new regime FY 2024-25: Income up to Rs 3 lakh nil tax. Rs 3-7 lakh taxed at 5%. Rs 7-10 lakh taxed at 10%. Rs 10-12 lakh taxed at 15%. Rs 12-15 lakh taxed at 20%. Above Rs 15 lakh taxed at 30%. Rebate under 87A makes income up to Rs 7 lakh tax free."
    },
    {
        "id": "doc11",
        "text": "UPI (Unified Payments Interface) is a real-time payment system developed by NPCI. To send money via UPI: open any UPI app (GPay, PhonePe, Paytm), enter recipient UPI ID or scan QR code, enter amount and MPIN to confirm. UPI transaction limit is Rs 1 lakh per transaction. UPI is free for personal transactions. Never share your MPIN or OTP with anyone."
    },
    {
        "id": "doc12",
        "text": "Online financial scams to avoid: (1) Never share OTP, PIN, or password with anyone claiming to be bank staff. (2) KYC fraud - scammers call asking to update KYC and steal credentials. (3) Lottery scams - no legitimate lottery asks for upfront payment. (4) Fake investment schemes promising very high returns are fraud. (5) Always verify UPI collect requests before approving. Report cyber fraud at 1930 or cybercrime.gov.in."
    },
    {
        "id": "doc13",
        "text": "Personal budgeting basics: Follow the 50-30-20 rule - 50% of income for needs (rent, food, bills), 30% for wants (entertainment, shopping), 20% for savings and investments. Emergency fund should cover 3-6 months of expenses. Track expenses using apps like Money Manager or Excel. Avoid lifestyle inflation when income increases."
    },
    {
        "id": "doc14",
        "text": "Interest rates in India: Savings account interest rate is typically 2.5-4% per year. Fixed deposit rates range from 5-7.5% per year depending on bank and tenure. Home loan interest rates range from 8.5-10.5%. Personal loan rates are 10-18%. Credit card interest rate is 24-36% annually - always pay full dues to avoid high interest. RBI repo rate affects all lending rates in India."
    },
    {
        "id": "doc15",
        "text": "Digital banking safety tips: Always use official bank apps downloaded from Play Store or App Store. Enable two-factor authentication on all financial accounts. Regularly check bank statements for unauthorized transactions. Use strong unique passwords for banking apps. Avoid using public WiFi for banking transactions. Set transaction limits on your accounts. Register for SMS and email alerts for all transactions."
    },
]

# ---- Setup ChromaDB ----
def setup_knowledge_base():
    chroma_client = chromadb.Client()
    
    # Delete collection if exists to avoid duplicates
    try:
        chroma_client.delete_collection("tax_knowledge")
    except:
        pass
    
    collection = chroma_client.create_collection("tax_knowledge")
    
    # Add documents
    collection.add(
        documents=[doc["text"] for doc in TAX_DOCUMENTS],
        ids=[doc["id"] for doc in TAX_DOCUMENTS]
    )
    
    print(f"Knowledge base ready with {len(TAX_DOCUMENTS)} tax documents!")
    return chroma_client, collection

# ---- Search Function ----
def search_knowledge(collection, query, n_results=3):
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    # Return top matching documents as single string
    docs = results['documents'][0]
    return "\n\n".join(docs)

# ---- Test it ----
if __name__ == "__main__":
    client, collection = setup_knowledge_base()
    
    test_query = "What can I invest in to save tax?"
    results = search_knowledge(collection, test_query)
    
    print("\nQuery:", test_query)
    print("\nRelevant docs found:")
    print(results)