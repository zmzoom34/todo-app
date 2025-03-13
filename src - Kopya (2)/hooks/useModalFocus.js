import { useEffect, useRef } from 'react';

export const useModalFocus = (isOpen) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (isOpen && elementRef.current) {
      elementRef.current.focus();
    }
  }, [isOpen]);

  return elementRef;
};