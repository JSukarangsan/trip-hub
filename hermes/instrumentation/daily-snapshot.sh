#!/bin/bash
# Daily Hermes instrumentation snapshot
# Captures memory utilization, session stats, and skill counts
# Run via cron: 0 23 * * * /path/to/daily-snapshot.sh

HERMES_DIR="${HERMES_HOME:-$HOME/.hermes}"
SNAPSHOT_DIR="$HERMES_DIR/instrumentation"
SNAPSHOT_FILE="$SNAPSHOT_DIR/metrics.csv"

mkdir -p "$SNAPSHOT_DIR"

# Initialize CSV header if file doesn't exist
if [ ! -f "$SNAPSHOT_FILE" ]; then
  echo "date,memory_md_bytes,memory_md_pct,user_md_bytes,user_md_pct,total_sessions,total_messages,skills_count,skills_auto_generated" > "$SNAPSHOT_FILE"
fi

DATE=$(date +%Y-%m-%d)

# Memory file sizes (MEMORY.md cap: 2200 chars, USER.md cap: 1375 chars)
MEMORY_BYTES=$(wc -c < "$HERMES_DIR/memories/MEMORY.md" 2>/dev/null || echo 0)
MEMORY_PCT=$(echo "scale=1; $MEMORY_BYTES * 100 / 2200" | bc 2>/dev/null || echo 0)

USER_BYTES=$(wc -c < "$HERMES_DIR/memories/USER.md" 2>/dev/null || echo 0)
USER_PCT=$(echo "scale=1; $USER_BYTES * 100 / 1375" | bc 2>/dev/null || echo 0)

# Session and message counts from SQLite
SESSIONS=$(sqlite3 "$HERMES_DIR/state.db" "SELECT COUNT(DISTINCT session_id) FROM messages;" 2>/dev/null || echo 0)
MESSAGES=$(sqlite3 "$HERMES_DIR/state.db" "SELECT COUNT(*) FROM messages;" 2>/dev/null || echo 0)

# Skill counts
SKILLS_TOTAL=$(find "$HERMES_DIR/skills" -name "SKILL.md" -type f 2>/dev/null | wc -l | tr -d ' ')
# Auto-generated skills won't be in our custom skills dir — they're created by the learning loop
SKILLS_AUTO=$(find "$HERMES_DIR/skills" -name "*.md" -newer "$HERMES_DIR/skills/.baseline" -type f 2>/dev/null | wc -l | tr -d ' ')

echo "$DATE,$MEMORY_BYTES,$MEMORY_PCT,$USER_BYTES,$USER_PCT,$SESSIONS,$MESSAGES,$SKILLS_TOTAL,$SKILLS_AUTO" >> "$SNAPSHOT_FILE"

echo "Snapshot captured: $DATE"
echo "  MEMORY.md: ${MEMORY_BYTES}b (${MEMORY_PCT}%)"
echo "  USER.md:   ${USER_BYTES}b (${USER_PCT}%)"
echo "  Sessions:  $SESSIONS"
echo "  Messages:  $MESSAGES"
echo "  Skills:    $SKILLS_TOTAL (${SKILLS_AUTO} auto-generated)"
