import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// Mobile-optimized form container
interface MobileFormProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    description?: string;
    onSubmit?: (e: React.FormEvent) => void;
}

export function MobileForm({ 
    children, 
    className, 
    title, 
    description, 
    onSubmit 
}: MobileFormProps) {
    return (
        <form 
            onSubmit={onSubmit}
            className={cn(
                "w-full max-w-full mx-auto space-y-4 sm:space-y-6",
                className
            )}
        >
            {(title || description) && (
                <div className="space-y-2 px-1">
                    {title && (
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="text-sm sm:text-base text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </form>
    );
}

// Mobile-optimized form section
interface MobileFormSectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
    variant?: 'default' | 'card';
}

export function MobileFormSection({ 
    children, 
    title, 
    description, 
    className,
    variant = 'default'
}: MobileFormSectionProps) {
    const content = (
        <div className="space-y-4">
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="text-base sm:text-lg font-semibold">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );

    if (variant === 'card') {
        return (
            <Card className={className}>
                <CardContent className="p-4 sm:p-6">
                    {content}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            {content}
        </div>
    );
}

// Mobile-optimized form field
interface MobileFormFieldProps {
    label: string;
    children: React.ReactNode;
    error?: string;
    required?: boolean;
    description?: string;
    className?: string;
    layout?: 'vertical' | 'horizontal';
}

export function MobileFormField({ 
    label, 
    children, 
    error, 
    required, 
    description, 
    className,
    layout = 'vertical'
}: MobileFormFieldProps) {
    return (
        <div className={cn(
            "space-y-2",
            layout === 'horizontal' && "sm:flex sm:items-start sm:space-y-0 sm:space-x-4",
            className
        )}>
            <div className={cn(
                "space-y-1",
                layout === 'horizontal' && "sm:w-1/3 sm:pt-2"
            )}>
                <Label className="text-sm font-medium">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {description && (
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            
            <div className={cn(
                "space-y-1",
                layout === 'horizontal' && "sm:flex-1"
            )}>
                {children}
                {error && (
                    <p className="text-xs text-destructive font-medium">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}

// Mobile-optimized input group
interface MobileInputGroupProps {
    children: React.ReactNode;
    className?: string;
    columns?: 1 | 2 | 3;
}

export function MobileInputGroup({ 
    children, 
    className,
    columns = 1
}: MobileInputGroupProps) {
    const gridClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    };

    return (
        <div className={cn(
            "grid gap-4",
            gridClasses[columns],
            className
        )}>
            {children}
        </div>
    );
}

// Mobile-optimized select field
interface MobileSelectFieldProps {
    label: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    value?: string;
    onValueChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    description?: string;
    className?: string;
}

export function MobileSelectField({
    label,
    placeholder = "Select an option",
    options,
    value,
    onValueChange,
    error,
    required,
    description,
    className
}: MobileSelectFieldProps) {
    return (
        <MobileFormField
            label={label}
            error={error}
            required={required}
            description={description}
            className={className}
        >
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger className="h-11 text-base touch-manipulation">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-base py-3 touch-manipulation"
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </MobileFormField>
    );
}

// Mobile-optimized textarea field
interface MobileTextareaFieldProps {
    label: string;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
    required?: boolean;
    description?: string;
    rows?: number;
    className?: string;
}

export function MobileTextareaField({
    label,
    placeholder,
    value,
    onChange,
    error,
    required,
    description,
    rows = 4,
    className
}: MobileTextareaFieldProps) {
    return (
        <MobileFormField
            label={label}
            error={error}
            required={required}
            description={description}
            className={className}
        >
            <Textarea
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                rows={rows}
                className="text-base touch-manipulation resize-none"
            />
        </MobileFormField>
    );
}

// Mobile-optimized checkbox group
interface MobileCheckboxGroupProps {
    label: string;
    options: { value: string; label: string; description?: string }[];
    values?: string[];
    onValueChange?: (values: string[]) => void;
    error?: string;
    required?: boolean;
    description?: string;
    className?: string;
    layout?: 'vertical' | 'horizontal';
}

export function MobileCheckboxGroup({
    label,
    options,
    values = [],
    onValueChange,
    error,
    required,
    description,
    className,
    layout = 'vertical'
}: MobileCheckboxGroupProps) {
    const handleChange = (optionValue: string, checked: boolean) => {
        if (!onValueChange) return;
        
        if (checked) {
            onValueChange([...values, optionValue]);
        } else {
            onValueChange(values.filter(v => v !== optionValue));
        }
    };

    return (
        <MobileFormField
            label={label}
            error={error}
            required={required}
            description={description}
            className={className}
        >
            <div className={cn(
                "space-y-3",
                layout === 'horizontal' && "sm:flex sm:flex-wrap sm:gap-6 sm:space-y-0"
            )}>
                {options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                        <Checkbox
                            id={option.value}
                            checked={values.includes(option.value)}
                            onCheckedChange={(checked) => 
                                handleChange(option.value, checked as boolean)
                            }
                            className="mt-1 touch-manipulation"
                        />
                        <div className="flex-1 min-w-0">
                            <Label 
                                htmlFor={option.value}
                                className="text-sm font-medium cursor-pointer"
                            >
                                {option.label}
                            </Label>
                            {option.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </MobileFormField>
    );
}

// Mobile-optimized radio group
interface MobileRadioGroupProps {
    label: string;
    options: { value: string; label: string; description?: string }[];
    value?: string;
    onValueChange?: (value: string) => void;
    error?: string;
    required?: boolean;
    description?: string;
    className?: string;
    layout?: 'vertical' | 'horizontal';
}

export function MobileRadioGroup({
    label,
    options,
    value,
    onValueChange,
    error,
    required,
    description,
    className,
    layout = 'vertical'
}: MobileRadioGroupProps) {
    return (
        <MobileFormField
            label={label}
            error={error}
            required={required}
            description={description}
            className={className}
        >
            <RadioGroup 
                value={value} 
                onValueChange={onValueChange}
                className={cn(
                    "space-y-3",
                    layout === 'horizontal' && "sm:flex sm:flex-wrap sm:gap-6 sm:space-y-0"
                )}
            >
                {options.map((option) => (
                    <div key={option.value} className="flex items-start space-x-3">
                        <RadioGroupItem 
                            value={option.value} 
                            id={option.value}
                            className="mt-1 touch-manipulation"
                        />
                        <div className="flex-1 min-w-0">
                            <Label 
                                htmlFor={option.value}
                                className="text-sm font-medium cursor-pointer"
                            >
                                {option.label}
                            </Label>
                            {option.description && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </RadioGroup>
        </MobileFormField>
    );
}

// Mobile-optimized form actions
interface MobileFormActionsProps {
    children: React.ReactNode;
    className?: string;
    layout?: 'horizontal' | 'vertical' | 'split';
    sticky?: boolean;
}

export function MobileFormActions({ 
    children, 
    className,
    layout = 'horizontal',
    sticky = false
}: MobileFormActionsProps) {
    const layoutClasses = {
        horizontal: "flex flex-col sm:flex-row gap-3 sm:gap-4",
        vertical: "flex flex-col gap-3",
        split: "flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4"
    };

    return (
        <div className={cn(
            "pt-6 border-t border-border/50",
            sticky && "sticky bottom-0 bg-background/95 backdrop-blur-sm p-4 -mx-4 border-t",
            layoutClasses[layout],
            className
        )}>
            {children}
        </div>
    );
}

// Mobile-optimized submit button
interface MobileSubmitButtonProps {
    children: React.ReactNode;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    fullWidth?: boolean;
}

export function MobileSubmitButton({
    children,
    loading = false,
    disabled = false,
    className,
    variant = 'default',
    fullWidth = true
}: MobileSubmitButtonProps) {
    return (
        <Button
            type="submit"
            variant={variant}
            size="touch"
            disabled={disabled || loading}
            className={cn(
                "font-medium",
                fullWidth && "w-full sm:w-auto sm:min-w-[120px]",
                className
            )}
        >
            {loading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                    Processing...
                </>
            ) : (
                children
            )}
        </Button>
    );
}
