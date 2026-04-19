# agent/resume_parser.py
import sys
import os
import io
import urllib.request
import spacy
import PyPDF2
import firebase_admin
from firebase_admin import credentials, firestore

# 1. Connect to Firebase using the existing backend key
cred_path = os.path.join(os.path.dirname(__file__), '../backend/config/firebaseServiceAccount.json')
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

# 2. Load the NLP model
nlp = spacy.load("en_core_web_sm")

def extract_text_from_pdf(pdf_bytes):
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text() + " "
    return text

def extract_keywords(text):
    doc = nlp(text)
    keywords = set()
    # Extract meaningful nouns and proper nouns
    for token in doc:
        if token.pos_ in ["NOUN", "PROPN"] and not token.is_stop and len(token.text) > 2:
            keywords.add(token.text.lower())
    return list(keywords)

def process_resume(uid):
    try:
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            print(f"Error: User {uid} not found.")
            sys.exit(1)
            
        user_data = user_doc.to_dict()
        resume_info = user_data.get('resume_data', {})
        file_url = resume_info.get('file_url')
        
        if not file_url:
            print(f"Error: No resume URL found for user {uid}.")
            sys.exit(1)
            
        # Download PDF from Firebase Storage URL
        req = urllib.request.Request(file_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            pdf_bytes = response.read()
            
        # Parse Text & Extract Keywords
        text = extract_text_from_pdf(pdf_bytes)
        keywords = extract_keywords(text)
        
        # Save back to Firestore
        user_ref.update({
            'resume_data.parsed': True,
            'resume_data.extracted_keywords': keywords
        })
        
        print(f"Success: Parsed resume. Extracted {len(keywords)} skills/keywords.")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing UID argument.")
        sys.exit(1)
        
    user_uid = sys.argv[1]
    process_resume(user_uid)