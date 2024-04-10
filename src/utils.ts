import { type CSSProperties } from "react";

export const cssIf = (
  condidion: unknown,
  onTrue?: string,
  onFalse = "",
): string => {
  return !!condidion ? `${onTrue}` ?? onFalse : onFalse;
};

export const cssPIf = (
  condition: unknown,
  onTrue?: CSSProperties,
  onFalse: CSSProperties = {},
) => {
  return !!condition ? onTrue ?? onFalse : onFalse;
};

export const cssDef = (condidion?: string) => {
  return cssIf(!!condidion, condidion, "");
};

export type Optional<T, K extends keyof T> = Pick<
  Partial<T>,
  K
> &
  Omit<T, K>;
