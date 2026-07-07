from flask import Flask, request, jsonify
import ibm_boto3
from ibm_botocore.client import Config
import uuid
from flask_cors import CORS
from ibm_watsonx_ai import APIClient, Credentials
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watson import NaturalLanguageUnderstandingV1
from ibm_watson.natural_language_understanding_v1 import Features, KeywordsOptions
from ibm_cloud_sdk_core.authenticators import IAMAuthenticator
from knowledge_base import setup_knowledge_base, search_knowledge
from dotenv import load_dotenv
import os
import io
import fitz
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)

# ---- Initialize Knowledge Base ----
print("Setting up knowledge base...")
chroma_client, collection = setup_knowledge_base()

# ---- Initialize Granite ----
print("Connecting to IBM Granite...")
credentials = Credentials(
    url=os.getenv("IBM_URL"),
    api_key=os.getenv("IBM_API_KEY")
)
client = APIClient(credentials)
model = ModelInference(
    model_id="mistralai/mistral-small-3-1-24b-instruct-2503",
    api_client=client,
    project_id=os.getenv("IBM_PROJECT_ID"),
    params={
        "max_tokens": 300,
        "temperature": 0.7
    }
)

# ---- Initialize NLU ----
print("Connecting to Watson NLU...")
nlu_authenticator = IAMAuthenticator(os.getenv("NLU_API_KEY"))
nlu = NaturalLanguageUnderstandingV1(
    version='2022-04-07',
    authenticator=nlu_authenticator
)
nlu.set_service_url(os.getenv("NLU_URL"))

# ---- Initialize COS ----
print("Connecting to IBM Cloud Object Storage...")
cos_client = ibm_boto3.client(
    "s3",
    ibm_api_key_id=os.getenv("COS_API_KEY"),
    ibm_service_instance_id=os.getenv("COS_INSTANCE_ID"),
    config=Config(signature_version="oauth"),
    endpoint_url=os.getenv("COS_ENDPOINT")
)
COS_BUCKET = os.getenv("COS_BUCKET")
print("All systems ready!")


# ---- Extract Keywords using NLU ----
def extract_keywords(text):
    try:
        response = nlu.analyze(
            text=text,
            features=Features(keywords=KeywordsOptions(limit=5))
        ).get_result()
        keywords = [kw['text'] for kw in response['keywords']]
        print(f"NLU Keywords extracted: {keywords}")
        return keywords
    except Exception as e:
        print(f"NLU error: {e}")
        return []


# ---- Chat Endpoint ----
@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        user_question = data.get('message', '')
        language = data.get('language', 'en')

        if not user_question:
            return jsonify({'error': 'No message provided'}), 400

        # Step 1: Extract keywords using NLU
        keywords = extract_keywords(user_question)

        # Step 2: Enhanced search query
        search_query = user_question + " " + " ".join(keywords) if keywords else user_question

        # Step 3: Search knowledge base (RAG)
        relevant_docs = search_knowledge(collection, search_query)

        # Step 4: Language instruction
        lang_instruction = "Always respond in Hindi language only." if language == 'hi' else "Always respond in English."

        # Step 5: Build prompt
        messages = [
            {
                "role": "system",
                "content": f"""You are IBM Tax Guide AI, an Indian tax assistant powered by IBM Granite.
Use the following tax information to answer accurately.
Keep answers clear, helpful and under 150 words.
Always mention relevant section numbers (like 80C, 80D) when applicable.
{lang_instruction}

TAX KNOWLEDGE:
{relevant_docs}

KEYWORDS IDENTIFIED IN QUESTION: {', '.join(keywords) if keywords else 'none'}"""
            },
            {
                "role": "user",
                "content": user_question
            }
        ]

        # Step 6: Get AI response
        response = model.chat(messages=messages)
        answer = response['choices'][0]['message']['content']

        return jsonify({
            'response': answer,
            'keywords': keywords,
            'status': 'success'
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ---- Health Check ----
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'IBM Tax Guide AI is running!',
        'services': {
            'watsonx_granite': 'active',
            'watson_nlu': 'active',
            'knowledge_base': 'active',
            'cloud_object_storage': 'active'
        }
    })


# ---- Upload Document ----
@app.route('/upload', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400

        ext = file.filename.rsplit('.', 1)[-1].lower()
        unique_name = f"{uuid.uuid4().hex}.{ext}"
        original_name = file.filename
        file_bytes = file.read()

        # Extract text if PDF
        extracted_text = ""
        if ext == 'pdf':
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
                    tmp.write(file_bytes)
                    tmp_path = tmp.name
                pdf_doc = fitz.open(tmp_path)
                for page in pdf_doc:
                    extracted_text += page.get_text()
                pdf_doc.close()
                os.unlink(tmp_path)
                extracted_text = extracted_text[:3000]
            except Exception as e:
                extracted_text = f"Could not extract text: {e}"

        # Upload to IBM COS
        def clean_ascii(text):
            # Remove non-ascii and newlines/special chars
            cleaned = text.encode('ascii', 'ignore').decode('ascii')
            cleaned = cleaned.replace('\n', ' ').replace('\r', ' ').replace('\t', ' ')
            # Collapse multiple spaces
            while '  ' in cleaned:
                cleaned = cleaned.replace('  ', ' ')
            return cleaned.strip()

        cos_client.upload_fileobj(
            io.BytesIO(file_bytes),
            COS_BUCKET,
            unique_name,
            ExtraArgs={
                'Metadata': {
                    'original_name': clean_ascii(original_name),
                    'extracted_text': clean_ascii(extracted_text[:512]) if extracted_text else ''
                }
            }
        )

        # Auto-scan with Granite if text found
        scan_summary = None
        if extracted_text and len(extracted_text) > 50:
            try:
                scan_messages = [
                    {
                        "role": "system",
                        "content": """You are IBM Tax Guide AI. Extract key tax information from this document.
Return a structured summary with:
- Document Type (Form 16, 80C, HRA Receipt etc.)
- Key amounts found (salary, TDS, deductions)
- Tax year
- Employee/Employer details if present
- Important sections
Keep it concise and clear."""
                    },
                    {
                        "role": "user",
                        "content": f"Extract tax information:\n\nFilename: {original_name}\n\nContent:\n{extracted_text}"
                    }
                ]
                scan_response = model.chat(messages=scan_messages)
                scan_summary = scan_response['choices'][0]['message']['content']
            except Exception as e:
                scan_summary = f"Auto-scan failed: {e}"
        else:
            scan_summary = "Document uploaded successfully. No readable text found (image-based PDF). Use the Scan button to analyze by filename."

        return jsonify({
            'status': 'success',
            'message': f'{original_name} uploaded to IBM Cloud!',
            'file_key': unique_name,
            'original_name': original_name,
            'extracted_text': extracted_text[:500] if extracted_text else '',
            'scan_summary': scan_summary
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# ---- Scan Document ----
@app.route('/scan', methods=['POST'])
def scan_document():
    try:
        data = request.get_json()
        filename = data.get('filename', '')
        extracted_text = data.get('text', '')
        language = data.get('language', 'en')

        if not extracted_text:
            return jsonify({'error': 'No text provided'}), 400

        lang_instruction = "Always respond in Hindi language only." if language == 'hi' else "Always respond in English."

        scan_messages = [
            {
                "role": "system",
                "content": f"""You are IBM Tax Guide AI. Extract key tax information from this document.
Return a structured summary with:
- Document Type
- Key amounts found
- Tax year
- Important details
Keep it concise and clear.
{lang_instruction}"""
            },
            {
                "role": "user",
                "content": f"Analyze this tax document:\n\nFilename: {filename}\n\nContent:\n{extracted_text}"
            }
        ]

        response = model.chat(messages=scan_messages)
        summary = response['choices'][0]['message']['content']

        return jsonify({
            'status': 'success',
            'summary': summary
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
# ---- Filing Readiness Check ----
@app.route('/filing-readiness', methods=['POST'])
def filing_readiness():
    try:
        data = request.get_json()
        language = data.get('language', 'en')
        lang_instruction = "Always respond in Hindi language only." if language == 'hi' else "Always respond in English."

        user_data = f"""
Income Details:
- Employment Type: {data.get('employment_type', 'Not provided')}
- Annual Salary: Rs {data.get('salary', 0)}
- Other Income: Rs {data.get('other_income', 0)}
- Tax Regime: {data.get('regime', 'Not decided')}

Documents Available:
- Form 16: {data.get('has_form16', False)}
- Form 26AS: {data.get('has_26as', False)}
- Bank Statements: {data.get('has_bank', False)}
- Investment Proofs (80C): {data.get('has_80c', False)}
- Health Insurance (80D): {data.get('has_80d', False)}
- Home Loan Certificate: {data.get('has_homeloan', False)}
- Rent Receipts (HRA): {data.get('has_hra', False)}

Deductions Status:
- 80C Invested Amount: Rs {data.get('invested_80c', 0)}
- 80D Premium Paid: Rs {data.get('paid_80d', 0)}
- HRA Applicable: {data.get('hra_applicable', False)}
"""

        messages = [
            {
                "role": "system",
                "content": f"""You are TaxSmart AI, an Indian tax filing expert.
Analyze the user's filing readiness and provide:
1. A readiness SCORE out of 100 (just the number, on first line like "SCORE: 85")
2. A STATUS: Ready / Almost Ready / Not Ready
3. What documents are MISSING
4. What actions they must take BEFORE filing
5. Estimated time to be ready
6. Which ITR form they should file (ITR-1, ITR-2 etc.)
Be specific and actionable. Keep it under 200 words.
{lang_instruction}"""
            },
            {
                "role": "user",
                "content": f"Check my ITR filing readiness:\n{user_data}"
            }
        ]

        response = model.chat(messages=messages)
        answer = response['choices'][0]['message']['content']

        # Extract score from response
        score = 50
        for line in answer.split('\n'):
            if 'SCORE:' in line.upper():
                try:
                    score = int(''.join(filter(str.isdigit, line.split(':')[1][:4])))
                    score = min(100, max(0, score))
                except:
                    pass

        return jsonify({
            'status': 'success',
            'analysis': answer,
            'score': score
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    
# ---- Document Completeness Checker ----
@app.route('/doc-checker', methods=['POST'])
def doc_checker():
    try:
        data = request.get_json()
        language = data.get('language', 'en')
        lang_instruction = "Always respond in Hindi language only." if language == 'hi' else "Always respond in English."

        checklist = f"""
ITR Filing Document Checklist Status:
- Form 16 (TDS Certificate): {data.get('form16', False)}
- Form 26AS (Tax Statement): {data.get('form26as', False)}
- AIS/TIS Statement: {data.get('ais', False)}
- Bank Statements: {data.get('bank', False)}
- 80C Investment Proofs: {data.get('inv_80c', False)}
- 80D Health Insurance Receipt: {data.get('ins_80d', False)}
- Home Loan Certificate: {data.get('homeloan', False)}
- Rent Receipts (HRA): {data.get('hra', False)}
- PAN Card: {data.get('pan', False)}
- Aadhaar Card: {data.get('aadhaar', False)}
- Previous Year ITR: {data.get('prev_itr', False)}
- Capital Gains Statement: {data.get('cap_gains', False)}

Employment Type: {data.get('employment_type', 'Salaried')}
Tax Regime: {data.get('regime', 'New Regime')}
"""

        messages = [
            {
                "role": "system",
                "content": f"""You are TaxSmart AI, an Indian tax expert.
Analyze the document checklist and provide:
1. COMPLETENESS SCORE out of 100 (first line: "SCORE: 85")
2. List of CRITICAL missing documents (must have)
3. List of OPTIONAL missing documents (good to have)
4. Specific steps to obtain each missing document
5. Overall filing status: Ready / Almost Ready / Incomplete
Be specific, practical and helpful.
Keep under 200 words.
{lang_instruction}"""
            },
            {
                "role": "user",
                "content": f"Check my document completeness for ITR filing:\n{checklist}"
            }
        ]

        response = model.chat(messages=messages)
        answer = response['choices'][0]['message']['content']

        score = 50
        for line in answer.split('\n'):
            if 'SCORE:' in line.upper():
                try:
                    score = int(''.join(filter(str.isdigit, line.split(':')[1][:4])))
                    score = min(100, max(0, score))
                except:
                    pass

        return jsonify({
            'status': 'success',
            'analysis': answer,
            'score': score
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ---- List Documents ----
@app.route('/documents', methods=['GET'])
def list_documents():
    try:
        response = cos_client.list_objects_v2(Bucket=COS_BUCKET)
        files = []
        for obj in response.get('Contents', []):
            try:
                meta = cos_client.head_object(Bucket=COS_BUCKET, Key=obj['Key'])
                original_name = meta['Metadata'].get('original_name', obj['Key'])
            except:
                original_name = obj['Key']
            files.append({
                'key': obj['Key'],
                'name': original_name,
                'size': f"{round(obj['Size'] / 1024, 1)} KB",
                'date': obj['LastModified'].strftime('%d %b %Y'),
            })
        return jsonify({'status': 'success', 'files': files})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---- Delete Document ----
@app.route('/documents/<key>', methods=['DELETE'])
def delete_document(key):
    try:
        cos_client.delete_object(Bucket=COS_BUCKET, Key=key)
        return jsonify({'status': 'success', 'message': 'File deleted'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)