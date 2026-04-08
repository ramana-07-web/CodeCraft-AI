# 🤖 CodeCraft AI

**CodeCraft AI** is an autonomous, multi-agent coding assistant built with [LangGraph](https://github.com/langchain-ai/langgraph) and **Google Gemini 2.5 Flash**.  
It works like a virtual development team that can take a natural language request and transform it into a complete, working project — file by file — using real developer workflows.

---

## 🏗️ Architecture

- **Planner Agent** – Analyzes your request and generates a detailed project plan.
- **Architect Agent** – Breaks down the plan into specific engineering tasks with explicit context for each file.
- **Coder Agent** – Implements each task, writes directly into files, and uses available tools like a real developer.

<div style="text-align: center;">
    <img src="resources/codecraft_ai_diagram.png" alt="CodeCraft AI Architecture" width="90%"/>
</div>

---

## 🚀 Getting Started

### Prerequisites
- Make sure you have **Python 3.9+** installed on your system.
- Ensure that you have a Google Gemini API key ready. You can get a free API key from [Google AI Studio](https://aistudio.google.com/).

### ⚙️ **Installation and Startup**
1. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   ````
   # On Windows:
  ```bash
   venv\Scripts\activate
```
   # On macOS/Linux:
```bash 
 source venv/bin/activate
```
   
### Install the dependencies   
    ```bash
    pip install langchain-core langchain-google-genai langgraph pydantic python-dotenv
     ```

### Set up your environment variables:
Create a .env file in the root directory and add your Google API key:
```bash
GOOGLE_API_KEY=your_api_key_here
```

Now that we are done with all the set-up & installation steps we can start the application using the following command:
  ```bash
    python main.py
  ```
(Note: You can also increase the agent's memory for larger projects by running python main.py --recursion-limit 150)

### 🧪 Example Prompts
- Create a to-do list application using html, css, and javascript.
- Create a simple calculator web application.
- Create a simple blog API in FastAPI with a SQLite database.

---
Built with LangGraph & Google Gemini.