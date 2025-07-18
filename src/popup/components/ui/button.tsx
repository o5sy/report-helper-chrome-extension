import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

function Button({
  children,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const { className, ...rest } = props;
  const classes = `transition-colors disabled:bg-gray-400 hover:bg-[#46aa32]/90 rounded-md bg-primary px-4 py-2 text-primary-foreground focus-visible:ring-ring disabled:opacity-50 ${className}`;

  return (
    <button className={classes} type="button" {...rest}>
      {children}
    </button>
  );
}

export default Button;
