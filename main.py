import argparse
import sys
import traceback

from agent.graph import agent
from agent.tools import init_project_root


def main():
    parser = argparse.ArgumentParser(description="Coder Buddy - AI Coding Assistant")
    parser.add_argument("--recursion-limit", "-r", type=int, default=100)
    args = parser.parse_args()

    init_project_root()
    print("🚀 Coder Buddy Initialized. Generating code into ./generated_project/\n")

    try:
        user_prompt = input("Enter project idea: ")
        print("\n⚙️  Processing (This may take a minute)...")

        result = agent.invoke(
            {"user_prompt": user_prompt},
            {"recursion_limit": args.recursion_limit}
        )

        print("\n✅ Task Complete!")
        if "plan" in result:
            print(f"Plan Executed: {result['plan'].name}")

    except KeyboardInterrupt:
        print("\n🛑 Cancelled by user.")
        sys.exit(0)

    except Exception as e:
        traceback.print_exc()
        print(f"\n❌ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()