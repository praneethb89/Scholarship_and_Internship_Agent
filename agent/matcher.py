# agent/matcher.py
import sys
import os
import firebase_admin
from firebase_admin import credentials, firestore

cred_path = os.path.join(os.path.dirname(__file__), '../backend/config/firebaseServiceAccount.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

def calculate_match_score(user_data, opp):
    score = 0
    opp_keywords = set([k.lower() for k in opp.get('keywords', [])])
    if not opp_keywords:
        return 0

    # Check if a resume was uploaded
    resume_data = user_data.get('resume_data', {})
    resume_keywords = set([k.lower() for k in resume_data.get('extracted_keywords', [])])
    has_resume = len(resume_keywords) > 0

    # DYNAMIC WEIGHTING
    if has_resume:
        # With Resume: 40% Skills, 30% Resume, 20% Interests, 10% Country
        user_skills = set([k.lower() for k in user_data.get('skills', {}).keys()])
        score += min((len(user_skills.intersection(opp_keywords)) / len(opp_keywords)) * 40, 40)
        score += min((len(resume_keywords.intersection(opp_keywords)) / len(opp_keywords)) * 30, 30)
        
        user_interests = set([k.lower() for k in user_data.get('interests', [])])
        score += min((len(user_interests.intersection(opp_keywords)) / len(opp_keywords)) * 20, 20)
        
        if user_data.get('country', '').lower() in [opp.get('country', '').lower(), 'international']:
            score += 10
    else:
        # NO Resume: 50% Skills, 30% Interests, 20% Country
        user_skills = set([k.lower() for k in user_data.get('skills', {}).keys()])
        score += min((len(user_skills.intersection(opp_keywords)) / len(opp_keywords)) * 50, 50)
        
        user_interests = set([k.lower() for k in user_data.get('interests', [])])
        score += min((len(user_interests.intersection(opp_keywords)) / len(opp_keywords)) * 30, 30)
        
        if user_data.get('country', '').lower() in [opp.get('country', '').lower(), 'international']:
            score += 20
            
    return round(score)

def match_opportunities(uid):
    try:
        user_ref = db.collection('users').document(uid)
        user_doc = user_ref.get()
        if not user_doc.exists: sys.exit(1)
            
        user_data = user_doc.to_dict()
        opps_ref = db.collection('opportunities')
        opps_docs = opps_ref.stream()
        
        matches = []
        for doc in opps_docs:
            opp_data = doc.to_dict()
            opp_data['id'] = doc.id
            match_percentage = calculate_match_score(user_data, opp_data)
            if match_percentage > 0:
                opp_data.pop('keywords', None) 
                opp_data['match'] = match_percentage
                matches.append(opp_data)
        
        matches.sort(key=lambda x: x['match'], reverse=True)
        user_ref.update({'matches': matches[:10]})
        print(f"Success: Ranked {len(matches)} opportunities.")
    except Exception as e:
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    match_opportunities(sys.argv[1])