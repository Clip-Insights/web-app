import { useRef, useState } from 'react';

export default function useFileSelection(files) {
  const [ids, setIds] = useState([]);
  const anchor = useRef(null);
  const selected = files.filter(file => ids.includes(file.id)).map(file => file.id);
  const select = (id, event) => {
    const index = files.findIndex(file => file.id === id);
    const start = files.findIndex(file => file.id === anchor.current);
    if (event.shiftKey && start !== -1) {
      const range = files.slice(Math.min(start, index), Math.max(start, index) + 1).map(file => file.id);
      setIds(previous => event.ctrlKey || event.metaKey ? [...new Set([...previous, ...range])] : range);
    } else {
      setIds(previous => previous.includes(id) ? previous.filter(value => value !== id) : [...previous, id]);
      anchor.current = id;
    }
  };
  return { selected, select, setIds, clear: () => { setIds([]); anchor.current = null; } };
}
