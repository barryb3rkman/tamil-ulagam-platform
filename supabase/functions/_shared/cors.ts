// Shared across every Edge Function in this project. Matches the CORS
// posture the pre-existing organization-email-verification function
// already used — permissive origin (these functions are called from the
// browser with the caller's own JWT, authorization happens inside each
// function via can_manage_organization/is_application_reviewer, never via
// CORS), but only the headers a Supabase-JS function invocation sends.
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
