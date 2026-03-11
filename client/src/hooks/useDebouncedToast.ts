import { useRef } from "react";
import { useToastController } from "tamagui";

/**
 * Оптимизирует спам тостами
 * @returns showToast
 */
export function useDebouncedToast() {
  const toast = useToastController();
  const timerRef = useRef(0);

  return (title: string, message: string) => {
    toast.hide();
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () =>
        toast.show(title, {
          message,
        }),
      150,
    );
  };
}
