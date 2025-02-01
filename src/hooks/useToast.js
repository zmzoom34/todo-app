import { toast } from 'react-toastify';

export const useToast = () => {
  const showToastMessage = (msg, type) => {
    const options = {
      position: type === 'info' ? 'bottom-right' : 'top-right'
    };

    switch (type) {
      case 'warning':
        toast.warning(msg, options);
        break;
      case 'success':
        toast.success(msg, options);
        break;
      case 'info':
        toast.info(msg, options);
        break;
      default:
        toast(msg, options);
    }
  };

  return {
    showToastMessage
  };
};