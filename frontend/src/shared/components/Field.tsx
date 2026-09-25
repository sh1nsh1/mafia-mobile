import { Field as FieldBase } from '@base-ui/react/field';
import { cn } from 'cn';

export namespace Field {
  export function Root({ className, ...props }: FieldBase.Root.Props) {
    return (
      <FieldBase.Root
        className={cn('flex flex-col items-start gap-1', className)}
        {...props}
      />
    );
  }

  export function Label({ className, ...props }: FieldBase.Label.Props) {
    return (
      <FieldBase.Label
        className={cn(
          'text-sm font-bold text-neutral-950 dark:text-white',
          className,
        )}
        {...props}
      />
    );
  }

  export function Control({ className, ...props }: FieldBase.Control.Props) {
    return (
      <FieldBase.Control
        className={cn(
          'h-8 w-full border px-2 font-mono text-sm any-pointer-coarse:text-base',
          'focus:outline-2 focus:-outline-offset-1',
          // Light
          'border-neutral-950 bg-white text-neutral-950 placeholder:text-neutral-500',
          'focus:outline-neutral-950',
          // Dark
          'dark:border-white dark:bg-neutral-950 dark:text-white dark:placeholder:text-neutral-400',
          'dark:focus:outline-white',
          className,
        )}
        {...props}
      />
    );
  }

  export function Error({ className, ...props }: FieldBase.Error.Props) {
    return (
      <FieldBase.Error
        className={cn('text-sm text-red-700 dark:text-red-400', className)}
        {...props}
      />
    );
  }
}
