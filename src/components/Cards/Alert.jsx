import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';

export default function Alert({ message, type = 'success', onClose, autoClose = true, duration = 5000 }) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    let active = true;
    const id = toast(message, { type, autoClose: autoClose ? duration : false, onClose: () => { if (active) close.current?.(); } });
    return () => { active = false; toast.dismiss(id); };
  }, [message, type, autoClose, duration]);
  return null;
}
Alert.propTypes = { message: PropTypes.string.isRequired, type: PropTypes.string, onClose: PropTypes.func, autoClose: PropTypes.bool, duration: PropTypes.number };
