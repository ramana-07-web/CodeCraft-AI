from typing import Optional, List, TypedDict
from pydantic import BaseModel, ConfigDict


class File(BaseModel):
    path: str
    purpose: str


class Plan(BaseModel):
    name: str
    description: str
    techstack: str
    features: List[str]
    files: List[File]


class ImplementationTask(BaseModel):
    filepath: str
    task_description: str


class TaskPlan(BaseModel):
    implementation_steps: List[ImplementationTask]
    plan: Optional[Plan] = None

    model_config = ConfigDict(extra="allow")


class CoderState(BaseModel):
    task_plan: TaskPlan
    current_step_idx: int = 0
    current_file_content: Optional[str] = None


# ✅ Added explicit TypedDict for LangGraph state to prevent data loss between nodes
class AgentState(TypedDict, total=False):
    user_prompt: str
    plan: Plan
    task_plan: TaskPlan
    coder_state: CoderState
    status: str