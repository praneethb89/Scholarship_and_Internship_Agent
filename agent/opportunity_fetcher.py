# agent/opportunity_fetcher.py
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Connect to Firebase
cred_path = os.path.join(os.path.dirname(__file__), '../backend/config/firebaseServiceAccount.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

def populate_opportunities():
    opportunities = [
        {
            "title": "Software Engineering Intern",
            "org": "TechCorp",
            "type": "Internship",
            "deadline": "Nov 30, 2026",
            "country": "USA",
            "keywords": ["python", "java", "software", "backend", "api"]
        },
        {
            "title": "Data Science Fellowship",
            "org": "DataX",
            "type": "Fellowship",
            "deadline": "Dec 15, 2026",
            "country": "UK",
            "keywords": ["machine learning", "data science", "python", "ai", "pandas"]
        },
        {
            "title": "Women in Cybersecurity Scholarship",
            "org": "SecureNet",
            "type": "Scholarship",
            "deadline": "Oct 30, 2026",
            "country": "International",
            "keywords": ["cybersecurity", "security", "network", "encryption"]
        },
        {
            "title": "Frontend React Developer Intern",
            "org": "WebWorks",
            "type": "Internship",
            "deadline": "Jan 10, 2027",
            "country": "Canada",
            "keywords": ["react", "javascript", "frontend", "ui", "ux", "web development"]
        }
    ]

    collection_ref = db.collection('opportunities')
    
    for opp in opportunities:
        collection_ref.add(opp)
        
    print("Successfully populated Firestore with opportunities!")

if __name__ == "__main__":
    populate_opportunities()