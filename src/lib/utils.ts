import { toast } from "sonner"; // Assuming sonner is used for toasts, or adapt to useToast context

export async function safeFetch<T>(
  promise: Promise<T>,
  errorMessage: string = "Communication Error"
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err: any) {
    console.error(`[SafeFetch Error]: ${errorMessage}`, err);
    
    // Using window dispatch or a similar pattern if outside React context
    // For now, we'll assume the caller handles the toast if possible, 
    // or we can use a custom event.
    const event = new CustomEvent('velocity-toast', { 
      detail: { message: errorMessage, type: 'error' } 
    });
    window.dispatchEvent(event);
    
    return { data: null, error: err };
  }
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
