#!/bin/bash
BODY="$(cat)"
RESPONSE=$(curl -s -X POST "https://electric-agent.fly.dev/api/sessions/5cc375d6-cd86-447b-89f0-c6303bc93c69/hook-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer c40c30f6a9c845586f38f7b543eed1ac09a5745526449f20bbff0489485ed8bf" \
  -d "${BODY}" \
  --max-time 360 \
  --connect-timeout 5 \
  2>/dev/null)
if echo "${RESPONSE}" | grep -q '"hookSpecificOutput"'; then
  echo "${RESPONSE}"
fi
exit 0