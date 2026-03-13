# GIMI
AI Chatbot app with a Django REST API backend and a React frontend.

## Prerequisites
Ensure you have the following installed on your system:

* **Python 3.12**
* **Node.js and npm**
* **Docker** (PostgreSQL and pgvector extension)

## Project Structure

```text
├── backend/     # Django REST API and Python virtual environment
    ├── docker-compose.yml # Docker configuration for the database
└── frontend/    # React application
```

## Setup Instructions

### 1. Backend Setup (Django)
Open your terminal and execute the following commands to set up the database, Python environment, and Django server.
**Start the Database Container**
From the root directory, navigate to 'backend/' with: 
```bash
cd backend/
```
Then, start the PostgreSQL database
```bash
docker compose up -d
```

**Set up the Python Environment**
1. Create a virtual environment:
```bash
python -m venv venv
```
2. Activate the virtual environment
* **macOS and Linux:**
```bash
source venv/bin/activate
```
* **Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```
* **Windows (Powershell):**
```powershell
venv\Scripts\Activate.ps1
```

4. Install the required dependencies within venv:
```bash
pip install -r requirements.txt
```

**Configure Environment Variables**
Create a '.env' file inside the 'backend/' directory:
```env
SECRET_KEY=
DATABASE_URL=
```

**Initialize and Run**
1. Apply database migrations to set up tables and vector extension:
```bash
python manage.py migrate
```

2. Start the Django development server:
```bash
python manage.py runserver
```

The backend API will be available at 'http://127.0.0.1:8000/'.

---

### 2. Frontend Setup (React)

Open a **new** terminal session to set up and run the React application.

1. Navigate to the frontend directory from root:
```bash
cd frontend
```

2. Install the node dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm run dev
```

The frontend application will be available at 'http://localhost:5173'
