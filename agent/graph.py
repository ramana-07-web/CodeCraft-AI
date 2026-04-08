import os
from dotenv import load_dotenv

from langchain_core.globals import set_verbose, set_debug
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

from langgraph.constants import END
from langgraph.graph import StateGraph
from langgraph.prebuilt import create_react_agent

from agent.prompts import planner_prompt, architect_prompt, coder_system_prompt
from agent.states import Plan, TaskPlan, CoderState, AgentState
from agent.tools import write_file, read_file, get_current_directory, list_files

# Load environment
load_dotenv()

set_debug(False)
set_verbose(False)

# Make sure you have your GOOGLE_API_KEY exported in your .env
# ... existing imports ...

# Make sure you have your GOOGLE_API_KEY exported in your .env
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",  # 👈 Update this line from gemini-1.5-flash
    temperature=0
)

# ... rest of the code remains the same ...


def safe_invoke(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {str(e)}") from e


# ---------- AGENTS ----------

def planner_agent(state: AgentState) -> dict:
    user_prompt = state["user_prompt"]

    resp = safe_invoke(
        llm.with_structured_output(Plan).invoke,
        planner_prompt(user_prompt)
    )

    if not resp:
        raise ValueError("Planner failed to generate a plan.")

    return {"plan": resp}


def architect_agent(state: AgentState) -> dict:
    plan: Plan = state["plan"]

    resp = safe_invoke(
        llm.with_structured_output(TaskPlan).invoke,
        architect_prompt(plan=plan.model_dump_json())
    )

    if not resp:
        raise ValueError("Architect failed to generate task steps.")

    resp.plan = plan
    return {"task_plan": resp}


def coder_agent(state: AgentState) -> dict:
    coder_state = state.get("coder_state")

    if coder_state is None:
        coder_state = CoderState(
            task_plan=state["task_plan"],
            current_step_idx=0
        )

    steps = coder_state.task_plan.implementation_steps

    # ✅ Stop condition successfully met
    if coder_state.current_step_idx >= len(steps):
        return {"coder_state": coder_state, "status": "DONE"}

    # 🚫 Infinite loop guard
    if coder_state.current_step_idx > 50:
        raise RuntimeError("Too many steps → possible infinite loop aborted.")

    current_task = steps[coder_state.current_step_idx]

    try:
        existing_content = read_file.invoke({"path": current_task.filepath})
    except Exception:
        existing_content = ""

    user_prompt = f"""
Task: {current_task.task_description}
File: {current_task.filepath}

Existing content:
{existing_content if existing_content else '(File is currently empty)'}

Write FULL file using the write_file tool.
"""

    tools = [read_file, write_file, list_files, get_current_directory]

    # ✅ Correct way to attach the system prompt to a LangGraph ReAct agent
    agent = create_react_agent(
        llm,
        tools,
        prompt=coder_system_prompt()  # 👈 Changed state_modifier to prompt
    )

    safe_invoke(
        agent.invoke,
        {
            "messages": [HumanMessage(content=user_prompt)]
        }
    )

    # Increment and push updated state
    coder_state.current_step_idx += 1
    return {"coder_state": coder_state}


# ---------- GRAPH ----------

graph = StateGraph(AgentState)

graph.add_node("planner", planner_agent)
graph.add_node("architect", architect_agent)
graph.add_node("coder", coder_agent)

graph.add_edge("planner", "architect")
graph.add_edge("architect", "coder")

graph.add_conditional_edges(
    "coder",
    lambda s: "END" if s.get("status") == "DONE" else "coder",
    {"END": END, "coder": "coder"}
)

graph.set_entry_point("planner")

agent = graph.compile()