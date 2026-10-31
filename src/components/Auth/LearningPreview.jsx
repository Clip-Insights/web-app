import { FileText, ScanLine, ArrowDown } from 'lucide-react';

export default function LearningPreview() {
  return (
    <aside aria-label="From a video lesson to saved study notes" className="hidden overflow-hidden bg-auth-panel px-10 py-12 lg:flex lg:flex-col lg:justify-center xl:px-16">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-auth-muted">Watch. Capture. Understand.</p>
        <h2 className="mt-5 max-w-md text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Good ideas deserve<br />a place to stay.</h2>
        <p className="mt-5 max-w-sm text-sm leading-6 text-auth-muted">Keep the frame, the explanation, and your own thinking. Come back with a clearer picture.</p>
        <figure className="relative mt-10 pb-10">
          <div className="mr-10 overflow-hidden rounded-xl bg-auth-ink shadow-lg">
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-white"><ScanLine size={14} aria-hidden="true" /> A moment from your lesson</div>
            <img src="/brand/learning-frame.svg" width="720" height="405" alt="A gradient descent curve with steps toward its minimum" className="block w-full" />
          </div>
          <div className="relative ml-12 -mt-8 rounded-xl border border-auth-line bg-white p-5 shadow-sm xl:ml-20 xl:p-6">
            <div className="flex items-center justify-between text-xs text-auth-muted"><span className="font-semibold text-auth-accent">02:14</span><span>My study notes</span></div>
            <p className="mt-3 text-lg font-semibold tracking-tight">Small steps. Better direction.</p>
            <p className="mt-2 text-sm leading-6 text-auth-muted">The gradient tells us which way to move. The learning rate decides how far we go.</p>
            <div className="mt-5 flex items-center gap-2 border-t border-auth-line pt-4 text-xs text-auth-muted"><FileText size={15} aria-hidden="true" /> Keep it together in a PDF <ArrowDown size={14} className="ml-auto" aria-hidden="true" /></div>
          </div>
          <figcaption className="mt-4 text-right text-xs text-auth-muted">An example of what you can keep.</figcaption>
        </figure>
        <p className="border-t border-auth-line pt-5 text-xs leading-5 text-auth-muted">Capture in the extension. Upload your PDF. Find it here when you need it.</p>
      </div>
    </aside>
  );
}
