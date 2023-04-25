import { useToast as useToastPrimevue } from 'primevue/usetoast';
import type { ToastMessageOptions } from 'primevue/toast';


export const useToast = () => {
  if (import.meta.env.NODE_ENV === 'test') {
    // eslint-disable-next-line
    const add = (options: any = {}) => { };

    return { add };
  }
  else {
    const toast = useToastPrimevue();

    const add = (options: ToastMessageOptions = {}) => {
      const { severity = 'error', summary = 'Unable to load data.', detail = '', life = 5000 } = options;
      toast.add({ severity: severity, summary: summary, detail: detail, life: life });
    };

    return { add };
  }
};
