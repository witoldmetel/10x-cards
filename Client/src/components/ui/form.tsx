import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { Controller, ControllerProps, FieldPath, FieldValues, FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '@/lib/tailwind';
import { Label } from '@/components/ui/label';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const formContext = useFormContext();

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  // Add a check if formContext is null and return a default state
  const fieldState = formContext
    ? formContext.getFieldState(fieldContext.name, formContext.formState)
    : { invalid: false, isDirty: false, isTouched: false, error: undefined };

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>({} as FormItemContextValue);

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props} />
      </FormItemContext.Provider>
    );
  },
);
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  // Try-catch to handle the case where FormLabel is used outside FormField
  try {
    const { error, formItemId } = useFormField();
    return <Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props} />;
  } catch (e) {
    // Fallback when used outside of a form context
    return <Label ref={ref} className={className} {...props} />;
  }
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef<React.ComponentRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    // Try-catch to handle the case where FormControl is used outside FormField
    try {
      const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

      return (
        <Slot
          ref={ref}
          id={formItemId}
          aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
          aria-invalid={!!error}
          {...props}
        />
      );
    } catch (e) {
      // Fallback when used outside of a form context
      return <Slot ref={ref} {...props} />;
    }
  },
);
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    // Try-catch to handle the case where FormDescription is used outside FormField
    try {
      const { formDescriptionId } = useFormField();

      return (
        <p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props} />
      );
    } catch (e) {
      // Fallback when used outside of a form context
      return <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />;
    }
  },
);
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    // Try-catch to handle the case where FormMessage is used outside FormField
    try {
      const { error, formMessageId } = useFormField();
      const body = error ? String(error?.message) : children;

      if (!body) {
        return null;
      }

      return (
        <p ref={ref} id={formMessageId} className={cn('text-sm font-medium text-destructive', className)} {...props}>
          {body}
        </p>
      );
    } catch (e) {
      // No body, return null
      if (!children) {
        return null;
      }
      // Fallback when used outside of a form context
      return (
        <p ref={ref} className={cn('text-sm font-medium text-destructive', className)} {...props}>
          {children}
        </p>
      );
    }
  },
);
FormMessage.displayName = 'FormMessage';

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField };
