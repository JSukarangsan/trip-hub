#!/bin/bash
# Initialize git tracking on Hermes memories directory
# This lets you diff MEMORY.md and USER.md over time to see what the agent learns
# Run once after Hermes is installed

HERMES_DIR="${HERMES_HOME:-$HOME/.hermes}"
MEMORIES_DIR="$HERMES_DIR/memories"

if [ ! -d "$MEMORIES_DIR" ]; then
  echo "Error: $MEMORIES_DIR does not exist. Is Hermes installed?"
  exit 1
fi

cd "$MEMORIES_DIR"

if [ -d ".git" ]; then
  echo "Git already initialized in $MEMORIES_DIR"
  exit 0
fi

git init
git add -A
git commit -m "Initial memory state"

echo "Git initialized in $MEMORIES_DIR"
echo ""
echo "To track changes, add this to your daily cron (after the snapshot script):"
echo "  cd $MEMORIES_DIR && git add -A && git commit -m \"Memory snapshot \$(date +%Y-%m-%d)\" --allow-empty"
echo ""
echo "To see what Hermes learned on a specific day:"
echo "  cd $MEMORIES_DIR && git log --oneline"
echo "  cd $MEMORIES_DIR && git diff HEAD~1"
