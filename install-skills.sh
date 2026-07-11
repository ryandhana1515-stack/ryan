#!/bin/bash
# Run this once on your PC after cloning the repo:
#   bash install-skills.sh

SKILLS_DIR="$(dirname "$0")/.agents/skills"
TARGET_DIR="$HOME/.claude/skills"

mkdir -p "$TARGET_DIR"

for skill_dir in "$SKILLS_DIR"/*/; do
  skill_name=$(basename "$skill_dir")
  mkdir -p "$TARGET_DIR/$skill_name"
  cp "$skill_dir/SKILL.md" "$TARGET_DIR/$skill_name/SKILL.md"
  echo "✓ Installed: $skill_name"
done

echo ""
echo "Done! Open Claude Code from this folder and all agents will be available."
