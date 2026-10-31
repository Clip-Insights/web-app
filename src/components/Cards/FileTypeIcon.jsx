import PropTypes from 'prop-types';
import { File, FileText, FileSpreadsheet, FileImage, FileVideo, FileAudio, FileArchive, FileCode, Presentation } from 'lucide-react';

const types = [
  { extensions: ['pdf'], icon: FileText, label: 'PDF', color: 'text-red-700 bg-red-50' },
  { extensions: ['doc', 'docx', 'odt', 'rtf'], icon: FileText, label: 'DOC', color: 'text-blue-700 bg-blue-50' },
  { extensions: ['xls', 'xlsx', 'csv', 'ods'], icon: FileSpreadsheet, label: 'XLS', color: 'text-emerald-700 bg-emerald-50' },
  { extensions: ['txt', 'md'], icon: FileText, label: 'TXT', color: 'text-auth-muted bg-auth-panel' },
  { extensions: ['ppt', 'pptx', 'odp'], icon: Presentation, label: 'PPT', color: 'text-orange-700 bg-orange-50' },
  { extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'], icon: FileImage, label: 'IMG', color: 'text-auth-muted bg-auth-panel' },
  { extensions: ['mp4', 'mov', 'webm'], icon: FileVideo, label: 'VID', color: 'text-auth-muted bg-auth-panel' },
  { extensions: ['mp3', 'wav', 'm4a'], icon: FileAudio, label: 'AUD', color: 'text-auth-muted bg-auth-panel' },
  { extensions: ['zip', 'rar', '7z', 'tar', 'gz'], icon: FileArchive, label: 'ZIP', color: 'text-auth-muted bg-auth-panel' },
  { extensions: ['js', 'jsx', 'ts', 'tsx', 'py', 'json', 'html', 'css'], icon: FileCode, label: 'CODE', color: 'text-auth-muted bg-auth-panel' },
];

export default function FileTypeIcon({ name }) {
  const extension = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  const { icon: Icon, label, color } = types.find(type => type.extensions.includes(extension)) || { icon: File, label: 'FILE', color: 'text-auth-muted bg-auth-panel' };
  return <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg ${color}`}><Icon size={18} strokeWidth={1.5} /><span className="text-[8px] font-semibold leading-none tracking-wide">{label}</span></span>;
}
FileTypeIcon.propTypes = { name: PropTypes.string.isRequired };
