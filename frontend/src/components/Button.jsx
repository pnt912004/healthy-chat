// src/components/Button.jsx
// Reusable Button component với các variant theo Design System

const variants = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  filled:    'btn-filled h-xxl px-md',
  ghost:     'bg-transparent text-primary border border-primary hover:bg-surface-container rounded-lg px-6 py-3 font-label-md text-label-md transition-colors',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
