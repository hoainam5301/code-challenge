// Ambient types for the surrounding app this snippet assumes but doesn't include.
declare module "@mui/material" {
  import type { ReactNode } from "react";
  export interface BoxProps {
    className?: string;
    children?: ReactNode;
  }
}

declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
