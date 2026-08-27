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


# --workers=1: both spec files exercise real, shared local Supabase state
# (not isolated per test/worker) — running them concurrently risks the
# exact kind of cross-test interference stateful browser e2e specs are
# prone to, so this run is deliberately serial.
exec pnpm --filter @tamil-ulagam/web exec playwright test --workers=1 tests/e2e/supabase-local.spec.ts tests/e2e/member-affiliation-lifecycle.spec.ts tests/e2e/sangam-registration-lifecycle.spec.ts tests/e2e/organisation-registration-lifecycle.spec.ts tests/e2e/workspace-navigation-lifecycle.spec.ts tests/e2e/workspace-accessibility.spec.ts tests/e2e/federation-admin-operations.spec.ts tests/e2e/admin-keyboard-decision-flows.spec.ts
