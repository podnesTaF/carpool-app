import { cn } from "@/lib/utils";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface FormFieldProps {
  name: string;
  label?: string;
  type?: "input" | "switch" | "textarea" | "custom";
  children?: React.ReactNode;
  placeholder?: string;
  disclaimer?: string;
  inputType?: "number" | "text" | "date" | "datetime-local";
  min?: number;
  value?: any;
  isNotEdit?: boolean;
  valueClassName?: string;
  hideErrorMessage?: boolean;
  isValueLoading?: boolean;
  muted?: boolean;
}

const FormField = ({
  name,
  label,
  type = "input",
  placeholder,
  children,
  disclaimer,
  min,
  inputType,
  value,
  isNotEdit,
  valueClassName,
  hideErrorMessage,
  isValueLoading,
  muted,
}: FormFieldProps) => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  const errorMessage = errors[name]?.message as string;

  if (isValueLoading) {
    return (
      <div className="space-y-2 w-full">
        {label && <Label htmlFor={name}>{label}</Label>}
        <Skeleton className="w-full h-6" />
      </div>
    );
  }

  return (
    <div className="space-y-2 max-w-full">
      {label && <Label htmlFor={name}>{label}</Label>}
      {!isNotEdit ? (
        <>
          {type === "input" && (
            <Input
              id={name}
              min={min}
              disabled={muted}
              placeholder={placeholder}
              {...register(name)}
              type={inputType}
              className={`border ${
                errorMessage
                  ? "border-red-500 outline-none focus-visible:ring-red-500"
                  : ""
              }`}
            />
          )}
          {type === "textarea" && (
            <Textarea
              id={name}
              disabled={muted}
              placeholder={placeholder}
              {...register(name)}
              className={`border ${errorMessage ? "border-red-500" : ""}`}
            />
          )}
          {type === "switch" && (
            <div className="flex items-center space-x-2">
              <Controller
                name={name}
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    id={name}
                    checked={value}
                    onCheckedChange={(checked) => onChange(checked)}
                    disabled={muted}
                  />
                )}
              />
              <Label htmlFor={name}>{placeholder}</Label>
            </div>
          )}
          {type === "custom" && children}
          {!hideErrorMessage && errorMessage && (
            <p className="text-red-500 text-sm">{errorMessage}</p>
          )}
          {disclaimer && (
            <p className="text-secondary-light text-sm">{disclaimer}</p>
          )}
        </>
      ) : (
        <p className={cn("text-secondary text-sm", valueClassName)}>{value}</p>
      )}
    </div>
  );
};

export default FormField;
