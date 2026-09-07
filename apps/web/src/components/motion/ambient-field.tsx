/**
 * The wash of colour that sits behind every page.
 *
 * The body was a single flat cream, which left long stretches of the site —
 * a sign-in card in a wide window, the quieter half of a long page — with
 * nothing behind them. These are compositor-only transforms on blurred
 * shapes rather than an animated gradient, so the motion costs a transform
 * per frame instead of a full-viewport repaint, and content that brings its
 * own background simply covers it.
 */
export function AmbientField() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <span
        data-motion-ambient
        className="bg-heritage-gold/[0.13] motion-drift-a absolute -top-[18vh] -right-[12vw] size-[52vw] min-w-[26rem] rounded-full blur-[7rem]"
      />
      <span
        data-motion-ambient
        className="bg-royal-indigo/[0.10] motion-drift-b absolute -bottom-[22vh] -left-[16vw] size-[56vw] min-w-[28rem] rounded-full blur-[8rem]"
      />
      <span
        data-motion-ambient
        className="bg-vivid-maroon/[0.07] motion-drift-c absolute top-[38vh] left-[42vw] size-[38vw] min-w-[20rem] rounded-full blur-[7rem]"
      />
    </div>
  );
}
