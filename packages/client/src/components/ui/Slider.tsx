import { InputHTMLAttributes, forwardRef } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="block text-xs text-text-tertiary mb-2 font-mono">{label}</label>
        )}
        <input
          ref={ref}
          type="range"
          className="w-full h-2 bg-border-default rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent-gold
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-bg-base
            [&::-webkit-slider-thumb]:shadow-gold
            [&::-webkit-slider-thumb]:cursor-grab
            [&::-webkit-slider-thumb:active]:cursor-grabbing"
          {...props}
        />
      </div>
    );
  },
);

Slider.displayName = 'Slider';
