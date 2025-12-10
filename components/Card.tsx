import * as React from "react";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: "default" | "glass" | "gradient";
  hover?: boolean;
}

export default function Card({
  as: Comp = "div",
  className,
  variant = "default",
  hover = true,
  ...props
}: CardProps) {
  const variantClasses = {
    default: "card",
    glass: "card-glass",
    gradient: "card-gradient"
  };

  const hoverClass = hover ? "" : "hover:shadow-sm hover:transform-none";

  return (
    <Comp
      className={`${variantClasses[variant]} p-4 sm:p-5 ${hoverClass} ${className ?? ""}`}
      {...props}
    />
  );
}
