# Hermes Travel Agent — Setup Guide

## Prerequisites
- Hostinger VPS (same one running OpenClaw): `root@2.24.198.82`
- Anthropic API key
- Telegram account

---

## Step 1: Create Telegram Bot

1. Open Telegram, search for `@BotFather`
2. Send `/newbot`
3. Name it (e.g., "Hermes Travel")
4. Choose a username (e.g., `hermes_france_bot`)
5. Save the **bot token** (format: `123456789:ABCdef...`)

### Disable Privacy Mode (required for group chats)
1. In BotFather, send `/setprivacy`
2. Select your bot
3. Choose **Disable** — this lets the bot see all group messages, not just /commands

## Step 2: Create Telegram Group

1. Create a new Telegram group
2. Add your wife (Jess)
3. Add the bot (search by username)
4. Name it something like "France Trip"

### Get IDs
To get your user IDs and group chat ID:

1. Message the bot directly (any message)
2. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Find `"from": {"id": XXXXXXX}` — that's your user ID
4. Have Jess message the bot or the group
5. Find her user ID the same way
6. The group chat ID is negative, starting with `-100`

## Step 3: Install Hermes on VPS

```bash
ssh root@2.24.198.82

# Install Python 3.11+ if not present
python3 --version  # Need 3.11+

# Install Hermes
pip install hermes-agent

# Verify
hermes --version

# IMPORTANT: When setup wizard detects ~/.openclaw, say NO to migration
# You want them independent
hermes setup
```

### Docker Alternative
If you prefer Docker (keeps it fully isolated from OpenClaw):
```bash
docker pull nousresearch/hermes-agent:latest
# TBD: exact docker run command depends on Hermes Docker docs
```

## Step 4: Deploy Config & Skills

From your local machine:
```bash
cd ~/Documents/apps/Evissa
./hermes/scripts/deploy-to-vps.sh
```

`## Step 5: Configure Environment

SSH into VPS and create `.env`:
```bash
ssh root@2.24.198.82
nano ~/.hermes/.env
```

Paste (fill in real values):
```
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=123456789:ABCdef...
TELEGRAM_ALLOWED_USERS=YOUR_ID,JESS_ID
TELEGRAM_GROUP_CHAT_ID=-100XXXXXXXXXX
HERMES_LANGFUSE_PUBLIC_KEY=pk-lf-...
HERMES_LANGFUSE_SECRET_KEY=sk-lf-...
HERMES_LANGFUSE_BASE_URL=https://cloud.langfuse.com
GOOGLE_SHEETS_ID=1eu_Zo9u5xEPuEs-4sxbaOY45SR49Bq51vnwopNv-UM4
GOOGLE_TOKEN_PATH=~/hermes-google-token.json
```

## Step 6: Update hermes.toml with Real IDs

Edit `~/.hermes/hermes.toml` on the VPS:
- Replace `allowFrom = []` with your numeric Telegram user IDs
- Replace the group chat placeholder with your real group ID
- Replace cron job `to` field with your group ID

## Step 7: Google Sheets Auth

You already have Google auth set up for OpenClaw finance. For Hermes, either:

**Option A: Reuse existing token**
```bash
cp ~/finance-token.json ~/hermes-google-token.json
```
(Works if the token has Sheets read+write scope)

**Option B: New token**
```bash
# On local machine
python3 scripts/google-auth.py  # Authorize with Sheets read+write
scp token.json root@2.24.198.82:~/hermes-google-token.json
```

## Step 8: Enable Langfuse

1. Go to https://cloud.langfuse.com — sign up (free tier)
2. Create a new project called "Hermes France"
3. Go to Settings > API Keys > Create
4. Copy public key and secret key into your `.env`

On VPS:
```bash
pip install langfuse
hermes plugins enable observability/langfuse
```

## Step 9: Set Up Instrumentation

```bash
ssh root@2.24.198.82

# Initialize memory git tracking
bash ~/.hermes/instrumentation/memory-git-init.sh

# Create baseline marker for auto-generated skills detection
touch ~/.hermes/skills/.baseline

# Add daily crons
# Metrics snapshot at 11pm Paris time
(crontab -l 2>/dev/null; echo "0 23 * * * bash ~/.hermes/instrumentation/daily-snapshot.sh") | crontab -

# Memory git commit at 11:05pm Paris time
(crontab -l 2>/dev/null; echo "5 23 * * * cd ~/.hermes/memories && git add -A && git commit -m 'Memory snapshot \$(date +\%Y-\%m-\%d)' --allow-empty 2>/dev/null") | crontab -
```

## Step 10: Start & Test

```bash
# Start the gateway
hermes gateway

# Or in background
hermes gateway &
# Or with systemd (see Hermes docs for service file)
```

### Test Checklist

1. **DM test**: Message the bot directly — "hello" — should respond
2. **Group test**: @mention the bot in the group — "@hermes what's the weather in Paris?"
3. **Both users**: Have Jess @mention the bot too — verify she's authorized
4. **Context test**: "What's our apartment address?" — should pull from trip.md
5. **Fitness test**: "Where should Jess do pilates?" — should reference fitness.md venues
6. **Sheet test**: "What tasks are still open?" — should read from sheet/tasks.md
7. **Daily digest**: Trigger manually — `hermes cron run morning-digest` — should post to group
8. **Langfuse**: Check https://cloud.langfuse.com — traces should appear
9. **Memory**: After a few conversations, check `~/.hermes/memories/MEMORY.md` — should have entries

---

## Daily Operations

### Automatic
- 9am Paris: Morning digest in group chat
- 7pm Paris: Evening check-in
- 11pm Paris: Metrics snapshot + memory git commit

### Manual (from group chat)
- @hermes + any question
- Reply to any Hermes message to continue that thread
- "Mark [place] as visited" — updates sheet
- "What have we done so far?" — checks memory + sheet

---

## Troubleshooting

- **Bot not responding in group**: Check privacy mode is disabled (BotFather > /setprivacy > Disable)
- **Jess can't trigger bot**: Verify her user ID is in `TELEGRAM_ALLOWED_USERS` and `allowFrom`
- **Sheet errors**: Check Google token isn't expired. Re-run auth if needed.
- **Langfuse empty**: Verify plugin is enabled (`hermes plugins list`) and keys are correct
