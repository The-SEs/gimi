# GIMI
AI Chatbot app with Django backend and React frontend
## Prerequisites
Ensure you have the following installed on your system:

* Python 3.x

* Node.js and npm (or yarn/pnpm)
## Project Structure

```text
├── backend/     # Django REST API and Python virtual environment
└── frontend/    # React application
```

## Setup Instructions
Currently, the backend and frontend run independently. You will need two separate terminal sessions to run both simultaneously.

### 1. Backend Setup (Django)
Open your terminal and execute the following commands to set up the Python environment and run the Django server.

1. **Navigate to the backend directory:**
```bash
cd backend
```

2. **Create a virtual environment:**
```bash
python -m venv venv
```
*(Note: On some macOS and Linux systems, you may need to use `python3` instead of `python`)*

3. **Activate the virtual environment:**

* **macOS and Linux:**
```bash
source venv/bin/activate
```

* **Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```
* **Windows (PowerShell):**
```powershell
venv\Scripts\Activate.ps1
```

4. **Install the required dependencies:**
```bash
pip install -r requirements.txt
```
*(Note: Ensure your virtual environment is activated before running this command. Your terminal prompt should show `(venv)` at the beginning.)*

5. **Apply database migrations:**
```bash
python manage.py migrate
```

6. **Start the Django development server:**
```bash
python manage.py runserver
```
The backend API will be available at `http://127.0.0.1:8000/`.

### 2. Frontend Setup (React)
Open a **new** terminal session to set up and run the React application.
1. **Navigate to the frontend directory:**
```bash
cd frontend
```

2. **Install the node dependencies:**
```bash
npm install
```

3. **Start the React development server:**
```bash
npm run dev
```

The frontend application will typically be available at `http://localhost:3000/` or `http://localhost:5173/`.
