import { Input, FormError, Column } from "@/components/ui";
import { InputProps } from "@/components/ui/Input";
import { useMemo } from "react";
import {
  useFormContext,
  Controller,
  ControllerProps,
  FieldValues,
} from "react-hook-form";

export type FormFieldProps<T extends FieldValues> = Omit<
  InputProps,
  "onChangeText" | "onBlur" | "value"
> &
  Pick<ControllerProps<T>, "name">;

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const { name, ...inputProps } = props;
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();
  const error = useMemo(() => errors[name]?.message?.toString(), [errors]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <Column gap={3}>
          <Input
            value={value?.toString() ?? ""}
            onBlur={onBlur}
            onChangeText={text => {
              // Для numeric полей парсим число
              if (inputProps.keyboardType === "numeric") {
                const num = parseFloat(text);
                onChange(isNaN(num) ? undefined : num);
              } else {
                onChange(text);
              }
            }}
            {...inputProps}
          />
          <FormError>{error}</FormError>
        </Column>
      )}
    />
  );
}
