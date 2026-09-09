import { Fragment, useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';
import { X } from 'lucide-react';

type ToastProps = {
  /** Message text */
  message: string;
  /** "success", "error", or "info" */
  type?: 'success' | 'error' | 'info';
  /** Auto‑close after ms (0 = never) */
  duration?: number;
  /** Callback when toast is dismissed */
  onClose?: () => void;
};

export default function Toast({
  message,
  type = 'info',
  duration = 4000,
  onClose,
}: ToastProps) {
  const [show, setShow] = useState(true);
  const bgColor =
    type === 'success'
      ? 'bg-green-500/90'
      : type === 'error'
      ? 'bg-red-500/90'
      : 'bg-blue-500/90';

  // Auto‑close timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => setShow(false), duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Notify parent when hidden
  useEffect(() => {
    if (!show && onClose) onClose();
  }, [show, onClose]);

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform transition ease-out duration-200"
      enterFrom="opacity-0 translate-y-2"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition ease-in duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 translate-y-2"
    >
      <div
        className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-md text-white ${bgColor} min-w-[260px]`}
      >
        <span className="flex-1">{message}</span>
        <button
          onClick={() => setShow(false)}
          className="p-1 rounded-full hover:bg-white/20 transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Transition>
  );
}
