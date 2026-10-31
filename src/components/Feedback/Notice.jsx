import PropTypes from 'prop-types';
import { CircleAlert, CheckCircle2, Info } from 'lucide-react';

export default function Notice({ children, tone = 'info', action }) {
  const Icon = tone === 'error' ? CircleAlert : tone === 'success' ? CheckCircle2 : Info;
  return <div role={tone === 'error' ? 'alert' : 'status'} className="flex items-start gap-3 rounded-lg border border-auth-line bg-auth-panel p-4 text-sm text-auth-ink">
    <Icon size={18} aria-hidden="true" className={`mt-0.5 shrink-0 ${tone === 'error' ? 'text-red-700' : 'text-auth-muted'}`} />
    <div className="min-w-0 flex-1 leading-6">{children}{action && <div className="mt-3">{action}</div>}</div>
  </div>;
}
Notice.propTypes = { children: PropTypes.node.isRequired, tone: PropTypes.oneOf(['info', 'error', 'success']), action: PropTypes.node };
