/**
 * Adapts an async event handler to the void-returning signature React
 * expects for onSubmit, onClick and friends.
 *
 * Handlers in this codebase catch their own failures and turn them into
 * form state, so nothing normally escapes. Passing one straight to a DOM
 * attribute still hands React a promise it will not await, which means a
 * bug that lets a rejection through would vanish silently. This keeps
 * the signature honest and makes that case loud instead.
 */
export function asEventHandler<Event>(
  handler: (event: Event) => Promise<void>,
): (event: Event) => void {
  return (event) => {
    void handler(event).catch((error: unknown) => {
      console.error("Unhandled error in an event handler", error);
    });
  };
}
