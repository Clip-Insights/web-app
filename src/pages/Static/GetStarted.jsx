import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ScanLine, FileText, Folder, Play } from 'lucide-react';

const storeUrl = 'https://chromewebstore.google.com/detail/clip-insights/ccgechmifoecebnimnccgahnoklklilj';
const steps = [
  { icon: ScanLine, title: 'Keep the useful moments', text: 'Open a YouTube video with Clip Insights. Capture a frame and add a timestamped note beside it.' },
  { icon: FileText, title: 'Make something to return to', text: 'Export your screenshots, notes, and generated insights as a PDF when you’re ready to review.' },
  { icon: Folder, title: 'Give your learning a home', text: 'Upload the PDF to Files. Move it into a folder for your course, project, or next study session.' },
];

export default function GetStarted() {
  return (
    <div className="mx-auto max-w-7xl">

      <h1 className="text-3xl font-semibold tracking-tight text-auth-ink">Make your next video worth keeping.</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-auth-muted">Capture with the extension. Keep your exported study material here. A few small steps connect the two.</p>

      <section aria-labelledby="extension-heading" className="mt-6 grid items-center gap-8 rounded-xl border border-auth-line bg-white p-6 lg:grid-cols-2 lg:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-auth-muted">Start beside the video</p>
          <h2 id="extension-heading" className="mt-4 text-2xl font-semibold leading-tight tracking-tight">Your learning workspace,<br />right where you watch.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-auth-muted">Take notes, capture screenshots, and use AI to explore the available transcript without losing your place.</p>
          <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-lg bg-auth-accent px-4 text-sm font-semibold text-white hover:bg-auth-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-auth-accent">Get the Chrome extension<ArrowUpRight size={16} aria-hidden="true" /></a>
          <p className="mt-3 text-xs leading-5 text-auth-muted">Already installed? Open a YouTube video to begin.</p>
        </div>
        <div className="overflow-hidden rounded-lg bg-auth-ink">
          <img src="/brand/learning-frame.svg" width="720" height="405" alt="Example lesson frame showing gradient descent" className="w-full" />
          <div className="flex items-start gap-3 border-t border-white/10 px-5 py-4 text-sm text-white"><span className="text-xs tabular-nums text-white/70">02:14</span><p className="leading-6">The gradient gives the direction.<br /><span className="text-white/70">My note: revisit how the learning rate changes each step.</span></p></div>
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="mt-10">
        <h2 id="workflow-heading" className="text-lg font-semibold text-auth-ink">From watching to keeping</h2>
        <ol className="mt-5 divide-y divide-auth-line">
          {steps.map(({ icon: Icon, title, text }, index) => <li key={title} className="flex gap-4 py-5 sm:gap-6"><span className="pt-1 text-xs tabular-nums text-auth-muted">0{index + 1}</span><Icon size={20} className="mt-0.5 hidden shrink-0 text-auth-muted sm:block" aria-hidden="true" /><div><h3 className="text-sm font-semibold text-auth-ink">{title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-auth-muted">{text}</p></div></li>)}
        </ol>
      </section>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-auth-line pt-6">
        <Link to="/files" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-auth-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent">Open your files<ArrowRight size={16} aria-hidden="true" /></Link>
        <a href="https://youtu.be/qP1heQSfVUA" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded text-sm text-auth-muted hover:text-auth-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-accent"><Play size={15} aria-hidden="true" />Watch the walkthrough<ArrowUpRight size={14} aria-hidden="true" /></a>
      </div>
      <p className="mt-4 max-w-2xl text-xs leading-5 text-auth-muted">AI features require sign-in, internet access, and an available transcript. Local notes stay in your browser; upload an exported PDF to save it to your account.</p>
    </div>
  );
}
