# 🧠 Personal AI System

> A full-stack AI-powered productivity platform that lets you manage your life using natural language.  
> Think of it as your **personal operating system** — track tasks, manage expenses, and get intelligent insights all in one place.

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🤖 AI Assistant | Interact using plain English commands |
| ✅ Task Management | Create, update, complete, and delete tasks with priorities and deadlines |
| 💰 Expense Tracker | Log and categorize expenses with analytics |
| 📊 Smart Insights | AI-generated weekly productivity reports |
| 🔐 Secure Auth | JWT-based login and registration |

**Natural Language Commands:**
```
"Add grocery expense 450 BDT"
"What tasks are due tomorrow?"
"Summarize my week"
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| AI Layer | Claude API (Anthropic) |
| Authentication | JWT + bcrypt |

---

## 📁 Project Structure
```
personal-ai-system/
├── frontend/                  # React app (Vite)
│   └── src/
│       ├── pages/             # Login, Register, Tasks, Expenses
│       └── styles/            # CSS files per page
│
└── backend/
    └── app/
        ├── routers/           # API route handlers
        ├── schemas/           # Pydantic request/response models
        ├── utils/             # Auth helpers & dependencies
        ├── models.py          # SQLAlchemy database models
        ├── database.py        # Database connection
        └── main.py            # FastAPI entry point
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

---

### ⚙️ Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

### 💻 Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

### 🔑 Environment Variables

Create a `.env` file inside `/backend`:
```env
DATABASE_URL=postgresql://user:password@localhost/personal_ai_db
SECRET_KEY=your_secret_key_here
```

---

## 📌 Project Status

> 🔧 Actively in Development

| Module | Status |
|---|---|
| Authentication | ✅ Complete |
| Tasks Module | ✅ Complete |
| Expenses Module | 🔧 In Progress |
| Notes Module | 🟣 Planned |
| Dashboard & Analytics | 🟣 Planned |
| AI Assistant | 🟣 Planned |
| AI Agent Actions | 🟣 Planned |
| Deployment | 🟣 Planned |

---

## 👨‍💻 Author

Built by **Julkar** as a portfolio project to demonstrate full-stack development and AI integration skills.

---

> ⭐ Star this repo if you find it interesting!
