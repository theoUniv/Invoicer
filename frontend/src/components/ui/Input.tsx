import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ 
        className = '', 
        label,
        error,
        ...props 
    }, ref) => {
        const baseStyles = 'w-full bg-transparent border-0 border-b border-[#DDD8D2] py-3 font-["Inter"] text-base text-[#1A1817] transition-colors focus:border-[#1A1817] focus:outline-none placeholder:text-[#8A8580] placeholder:font-light';
        
        const combinedClassName = `${baseStyles} ${className} ${error ? 'border-red-500' : ''}`;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-[#8A8580] mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={combinedClassName}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-500">
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
