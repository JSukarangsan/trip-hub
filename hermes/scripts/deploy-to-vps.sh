#!/bin/bash
# Deploy Hermes config, skills, and context to Hostinger VPS
# Separate from OpenClaw deploy — different directory on VPS

set -e

VPS_HOST="root@2.24.198.82"
HERMES_VPS_DIR="/root/.hermes"  # Adjust if using Docker: /docker/hermes-xxxx/data/.hermes
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Deploying Hermes to $VPS_HOST:$HERMES_VPS_DIR"
echo "Local source: $LOCAL_DIR"
echo ""

# Create remote directories
ssh "$VPS_HOST" "mkdir -p $HERMES_VPS_DIR/{workspace,skills,context,instrumentation}"

# Deploy workspace files (SOUL.md, TOOLS.md)
echo "Deploying workspace files..."
rsync -avz --delete "$LOCAL_DIR/workspace/" "$VPS_HOST:$HERMES_VPS_DIR/workspace/"

# Deploy skills
echo "Deploying skills..."
rsync -avz --delete "$LOCAL_DIR/skills/" "$VPS_HOST:$HERMES_VPS_DIR/skills/"

# Deploy context files
echo "Deploying context files..."
rsync -avz --delete "$LOCAL_DIR/context/" "$VPS_HOST:$HERMES_VPS_DIR/context/"

# Deploy instrumentation scripts
echo "Deploying instrumentation..."
rsync -avz "$LOCAL_DIR/instrumentation/" "$VPS_HOST:$HERMES_VPS_DIR/instrumentation/"
ssh "$VPS_HOST" "chmod +x $HERMES_VPS_DIR/instrumentation/*.sh"

# Deploy config (don't overwrite .env — that has secrets)
echo "Deploying hermes.toml..."
scp "$LOCAL_DIR/hermes.toml" "$VPS_HOST:$HERMES_VPS_DIR/hermes.toml"

echo ""
echo "Deploy complete."
echo ""
echo "Next steps:"
echo "  1. SSH in: ssh $VPS_HOST"
echo "  2. Edit .env: nano $HERMES_VPS_DIR/.env"
echo "  3. Restart: hermes gateway restart (or docker restart hermes)"
