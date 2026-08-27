# Federation Admin Operations V3

Phase F1 turns the Federation Admin area into an operational console while preserving the existing registration and membership security model. It does not introduce Events, Jobs, finance, a CRM, co-manager administration or ownership transfer.

## Capability matrix

| Capability                                | Anonymous                        | Member                    | Organisation/Sangam manager                  | Reviewer                                         | Federation Admin                                 |
| ----------------------------------------- | -------------------------------- | ------------------------- | -------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Submit partnership enquiry                | Yes, through the create-only RPC | Yes, through the same RPC | Yes, through the same RPC                    | Yes, through the same RPC                        | Yes, through the same RPC                        |
| Review registrations                      | No                               | No                        | No, unless separately assigned reviewer role | Yes, except self/represented Organisation review | Yes, except self/represented Organisation review |
| Operational Organisation/Sangam directory | No                               | No                        | No                                           | No                                               | Yes                                              |
| Federation membership escalation          | No                               | No                        | Existing local manager actions only          | No                                               | Yes                                              |
| Read or progress partnership enquiries    | No                               | No                        | No                                           | No                                               | Yes                                              |

The UI uses this matrix only to compose navigation and authored states. Supabase RLS and narrow security-definer RPCs remain the authorization boundary. `get_federation_capabilities` reports the existing `reviewer`/`admin` distinction; it does not create a generic permission engine.

## Routes and static export

- `/admin` — attention-first overview
- `/admin/reviews` — review queue or `?application=<uuid>` detail
- `/admin/organisations` — directory or `?organization=<uuid>` detail
- `/admin/sangams` — directory or `?organization=<uuid>` detail
- `/admin/memberships` — queue or `?membership=<uuid>` detail
- `/admin/partnerships` — queue or `?enquiry=<uuid>` detail

Arbitrary database identifiers use query parameters, keeping every page statically exportable. F1 adds no middleware, route handler, Server Action or server-only runtime.

## Domain and service boundaries

Pure operational contracts live in `packages/shared/src/admin-operations.ts`. React components consume `AdminOperationsService`; the Supabase implementation owns projections, row mapping, safe error mapping and lifecycle RPC calls. The public partnership form uses the same create-only service boundary. No new Admin React component calls Supabase directly.

Membership and management remain separate:

- `organization_memberships` means affiliation.
- `organization_managers` means administrative authority.

The directory detail presents those concepts in separate panels. Phase F1 exposes manager data read-only and provides no manager mutation controls.

Tamil Sangams are classified only when `category = tamil_community` and the stored subtype is exactly `Tamil Sangam` after case/whitespace normalization. Names are never used to infer Sangam status.

## Partnership lifecycle

`partnership_enquiries` contains the small operational record. `partnership_enquiry_history` appends creation and status transition events. The lifecycle is deliberately narrow:

`new → in_discussion → active | declined`

Anonymous callers receive execute permission only on `submit_partnership_enquiry`. They cannot read, list, set status/timestamps, mutate a record or write history. Reviewer-only and ordinary authenticated accounts cannot access the Admin projections or transition RPC. Declining requires a reason.

CAPTCHA remains disabled. The public form/service contract reserves a future token point, but client-side cooldowns are not treated as security. Before public launch, the create RPC should be fronted by an approved server-side CAPTCHA verification and infrastructure rate limit keyed by appropriate abuse signals; secrets must never enter the static client.

## Query architecture and scaling

The operational projections use set-based joins and aggregate subqueries. No screen fetches one profile or Organisation per row.

| Surface                |           Initial F1 queries | Notes                                                                                                                          |
| ---------------------- | ---------------------------: | ------------------------------------------------------------------------------------------------------------------------------ |
| Admin shell capability |                            1 | One boolean capability projection                                                                                              |
| Overview F1 data       |                            2 | Attention summary and normalized recent activity; existing enrollment snapshot remains separately cached by `PlatformProvider` |
| Reviews                | Existing enrollment snapshot | Client filtering is acceptable below the current 1,000-row Data API response cap                                               |
| Organisations/Sangams  |                            1 | One shared directory projection; selected manager detail adds one bounded query                                                |
| Memberships            |                            1 | One set-based membership/profile/Organisation projection; selected history adds one query                                      |
| Partnerships           |                            1 | One queue projection; selected history adds one query                                                                          |

Client filtering should be replaced by parameterized, paginated projections before any queue approaches roughly 500–1,000 active rows or response payload/interaction measurements show degradation. That future change should preserve the service interface rather than move database queries into components.

## Data table decision

F1 creates the first repeated operational-table requirement. `packages/ui` therefore includes a deliberately small `DataTable`: semantic caption/header/body markup on desktop and labelled stacked records on mobile. It does not add sorting frameworks, virtualization, column resizing, pinning or spreadsheet behavior.

## Activity composition

Recent activity is a normalized read projection over immutable `application_review_history`, `organization_membership_history` and `partnership_enquiry_history`. F1 does not introduce a second event store.
