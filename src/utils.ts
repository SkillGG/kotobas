import { type CSSProperties } from "react";
import { env } from "./env";
import { z } from "zod";

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

type JSONableFetchReturn<T extends boolean> = T extends true ? unknown : string;

export const fetchDirectly = async <T extends boolean>(
  url: string,
  json: T,
  init?: RequestInit,
): Promise<JSONableFetchReturn<T>> => {
  console.log("Fetching directly", url);
  const res = await fetch(url, init);
  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }
  if (json) return (await res.json()) as JSONableFetchReturn<T>;

  return (await res.text()) as JSONableFetchReturn<T>;
};

export const fetchFromProxy = async <T extends boolean>(
  url: string,
  json: T,
  init?: RequestInit,
): Promise<JSONableFetchReturn<T>> => {
  console.log("Fetching via proxy");
  const res = await fetch(env.GCLOUD_FETCH, {
    method: "post",
    headers: { Authorization: `bearer ${env.GCLOUD_KEY}` },
    body: JSON.stringify({ url, init }),
  });
  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }

  if (json) return (await res.json()) as JSONableFetchReturn<T>;

  return (await res.text()) as JSONableFetchReturn<T>;
};

export const DictionaryEntry = z.object({
  word: z.string(),
  pitch: z.array(z.object({ part: z.string(), high: z.boolean() })).optional(),
  meanings: z.array(z.string()),
  exactMatch: z.boolean().optional(),
  lang: z.enum(["EN", "JP"]),
});

export type DictionaryEntry = z.infer<typeof DictionaryEntry>;

export const fetchJSON = async (url: string) => {
  env.IS_REMOTE === "false"
    ? await fetchDirectly(url, true)
    : await fetchFromProxy(url, true);
};

export const fetchURL = async (url: string) =>
  env.IS_REMOTE === "false"
    ? await fetchDirectly(url, false)
    : await fetchFromProxy(url, false);

export type Dictionary = "jisho" | "wikiEN" | "wikiJP" | "jotoba";

export const dictionaryName: { [k in Dictionary]: string } = {
  jotoba: "Jotoba",
  wikiJP: "Wiktionary (JP)",
  wikiEN: "Wiktionary (EN)",
  jisho: "Jisho",
};

export const Dictionaries = Object.keys(
  dictionaryName,
) as readonly string[] as readonly [Dictionary, ...Dictionary[]];
