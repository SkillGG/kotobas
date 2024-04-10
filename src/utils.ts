import { type CSSProperties } from "react";
import { env } from "./env";

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

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export const fetchDirectly = async (url: string) => {
  console.log("Fetching directly", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }
  const text = await res.text();
  return text;
};

export const fetchFromProxy = async (url: string) => {
  console.log("Fetching via proxy");
  const res = await fetch(env.GCLOUD_FETCH, {
    method: "post",
    headers: { Authorization: `bearer ${env.GCLOUD_KEY}` },
    body: JSON.stringify({ url }),
  });
  console.log(res);
  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }

  const text = await res.text();
  return text;
};
