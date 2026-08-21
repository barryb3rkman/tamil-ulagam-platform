#!/bin/sh

set -eu

if ! command -v docker >/dev/null 2>&1 && [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
  PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
  export PATH
fi

supabase db reset --local
eval "$(supabase status -o env)"

NEXT_PUBLIC_SUPABASE_URL="$API_URL"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$PUBLISHABLE_KEY"
NEXT_PUBLIC_ENROLLMENT_BACKEND=supabase
SUPABASE_LOCAL_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
RUN_SUPABASE_E2E=true

export NEXT_PUBLIC_SUPABASE_URL
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
export NEXT_PUBLIC_ENROLLMENT_BACKEND
export SUPABASE_LOCAL_SERVICE_ROLE_KEY
export RUN_SUPABASE_E2E

exec pnpm --filter @tamil-ulagam/web exec playwright test tests/e2e/supabase-local.spec.ts
