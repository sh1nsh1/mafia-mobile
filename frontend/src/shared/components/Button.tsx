import { Button as ButtonBase } from '@base-ui/react/button';
import { cn } from 'cn';

export default function Button({ className, ...props }: ButtonBase.Props) {
  return (
    <ButtonBase
      className={cn(
        'flex h-8 items-center justify-center gap-2 rounded-none border',
        'px-3 text-sm leading-none font-medium whitespace-nowrap select-none',
        'focus-visible:outline-2 focus-visible:-outline-offset-1', // fv
        // Light
        'border-neutral-950 bg-white text-neutral-950',
        'hover:not-disabled:bg-neutral-100', // hover
        'focus-visible:outline-neutral-950', // focus
        'active:not-disabled:bg-neutral-200', // active
        'disabled:border-neutral-500 disabled:text-neutral-500', // Disable
        // Dark
        'dark:border-white dark:bg-neutral-950 dark:text-white',
        'dark:hover:not-disabled:bg-neutral-800',
        'dark:focus-visible:outline-white',
        'dark:active:not-disabled:bg-neutral-700',
        'dark:disabled:border-neutral-400 dark:disabled:text-neutral-400',
        className,
      )}
      {...props}
    />
  );
}
