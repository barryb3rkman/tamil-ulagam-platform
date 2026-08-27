#!/bin/sh

set -eu

if ! command -v docker >/dev/null 2>&1 && [ -x /Applications/Docker.app/Contents/Resources/bin/docker ]; then
  PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
  export PATH
fi

supabase db reset --local
eval "$(supabase status -o env)"

SUPABASE_LOCAL_URL="$API_URL"
SUPABASE_LOCAL_ANON_KEY="$ANON_KEY"
SUPABASE_LOCAL_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
RUN_SUPABASE_INTEGRATION=true

export SUPABASE_LOCAL_URL
export SUPABASE_LOCAL_ANON_KEY
export SUPABASE_LOCAL_SERVICE_ROLE_KEY
export RUN_SUPABASE_INTEGRATION

exec pnpm --filter @tamil-ulagam/web exec vitest run src/lib/supabase/local-integration.test.ts src/lib/supabase/local-integration-membership.test.ts src/lib/supabase/local-integration-sangam.test.ts src/lib/supabase/local-integration-admin-operations.test.ts src/lib/supabase/local-integration-management.test.ts
