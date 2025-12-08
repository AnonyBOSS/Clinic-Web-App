import * as React from "react";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export default function Card({
  as: Comp = "div",
  className,
  ...props
}: CardProps) {
  return (
    <Comp
      className={`card p-4 sm:p-5 ${className ?? ""}`}
      {...props}
    />
  );
}
