# 🚀 AI Opportunity Agent

An intelligent, full-stack platform designed to autonomously match students and professionals with highly relevant scholarships, internships, and fellowships using Natural Language Processing (NLP) and a custom matching algorithm.

## ✨ Features
* **AI-Powered Matching Engine:** A custom Python algorithm that calculates match percentages based on a weighted 40/30/20/10 scale (Skills, Resume Keywords, Interests, and Location).
* **Smart Resume Parsing:** Integrates `spaCy` NLP to extract key technical competencies and nouns directly from uploaded PDF/DOCX resumes.
* **Dynamic Onboarding Wizard:** A seamless, multi-step React onboarding flow to capture user demographics, academic details, and technical skills.
* **Glassmorphism UI/UX:** A modern, fully responsive interface featuring light/dark mode and smooth Framer Motion page transitions.
* **Real-time Database:** Powered by Firebase Firestore for instantaneous UI updates and secure data storage.

## 🛠️ Tech Stack
* **Frontend:** React.js, Vite, Framer Motion, Tailwind/Custom CSS
* **Backend:** Node.js, Express.js
* **AI & Agent Layer:** Python, `spaCy` (NLP), `PyPDF2`
* **Database & Auth:** Firebase Authentication, Firestore, Firebase Storage
* **Process Management:** Node `child_process` for bridging JavaScript APIs with Python executable scripts.

## 🚀 Getting Started

### Prerequisites
* Node.js (v16+)
* Python 3.9+
* Firebase Service Account Key

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/opportunity-agent.git](https://github.com/yourusername/opportunity-agent.git)