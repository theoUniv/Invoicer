import React from 'react';

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'circle' | 'circle-light' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    loadingText?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-white text-[#1A1817] hover:transform hover:translate-y-[-1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] shadow-[0_4px_14px_rgba(0,0,0,0.03)] transition-all duration-300',
    dark: 'bg-[#1A1817] text-white hover:bg-black transition-all duration-300',
    outline: 'bg-transparent border border-[#1A1817] text-[#1A1817] hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent text-[#1A1817] hover:bg-accent hover:text-accent-foreground',
    circle: 'w-10 h-10 rounded-full bg-[#1A1817] text-white border-none hover:opacity-80 transition-opacity duration-200',
    'circle-light': 'w-10 h-10 rounded-full bg-transparent border border-[#DDD8D2] text-[#1A1817] hover:opacity-80 transition-opacity duration-200'
};

const sizeStyles: Record<ButtonSize, string> = {
    default: 'px-6 py-3 rounded-full',
    sm: 'px-4 py-2 text-xs rounded-full',
    lg: 'px-8 py-4 text-lg rounded-full',
    icon: 'w-10 h-10'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ 
        className = '', 
        variant = 'primary', 
        size = 'default', 
        isLoading = false, 
        loadingText = 'Chargement...', 
        children, 
        disabled, 
        ...props 
    }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center cursor-pointer whitespace-nowrap font-["Inter"] font-medium text-sm focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
        
        const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

        return (
            <button
                ref={ref}
                className={combinedClassName}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? loadingText : children}
            </button>
        );
    }
);

Button.displayName = 'Button';
