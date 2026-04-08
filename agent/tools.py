import pathlib
from langchain_core.tools import tool

PROJECT_ROOT = pathlib.Path.cwd() / "generated_project"


def safe_path(path: str) -> pathlib.Path:
    p = (PROJECT_ROOT / path).resolve()
    if PROJECT_ROOT.resolve() not in p.parents and PROJECT_ROOT.resolve() != p:
        raise ValueError("Invalid path: attempt to write outside project root")
    return p


@tool
def write_file(path: str, content: str) -> str:
    """Write full content to a file inside the project directory."""
    p = safe_path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    return f"SUCCESS: WROTE {path}"


@tool
def read_file(path: str) -> str:
    """Read and return content of a file inside the project directory."""
    p = safe_path(path)
    if not p.exists():
        return ""
    return p.read_text(encoding="utf-8")


@tool
def list_files(directory: str = ".") -> str:
    """List all files recursively inside a directory."""
    p = safe_path(directory)
    if not p.exists():
        return ""
    return "\n".join(
        str(f.relative_to(PROJECT_ROOT))
        for f in p.glob("**/*")
        if f.is_file()
    )


@tool
def get_current_directory() -> str:
    """Return the root directory where files are being generated."""
    return str(PROJECT_ROOT)


def init_project_root():
    """Initialize project root directory."""
    PROJECT_ROOT.mkdir(parents=True, exist_ok=True)
    return str(PROJECT_ROOT)