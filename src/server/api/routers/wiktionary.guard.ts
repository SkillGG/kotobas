/*
 * Generated type guards for "wiktionary.ts".
 * WARNING: Do not manually change this file.
 */
import {
  type WikiParsedSections,
  type WikiSectionData,
  type WikiData,
} from "./wiktionary";

export function isWikiParsedSections(obj: unknown): obj is WikiParsedSections {
  const typedObj = obj as WikiParsedSections;
  return (
    ((typedObj !== null && typeof typedObj === "object") ||
      typeof typedObj === "function") &&
    ((typedObj.parse !== null && typeof typedObj.parse === "object") ||
      typeof typedObj.parse === "function") &&
    typeof typedObj.parse.title === "string" &&
    Array.isArray(typedObj.parse.sections) &&
    typedObj.parse.sections.every((e: unknown) => isWikiSectionData(e))
  );
}

export function isWikiSectionData(obj: unknown): obj is WikiSectionData {
  const typedObj = obj as WikiSectionData;
  return (
    ((typedObj !== null && typeof typedObj === "object") ||
      typeof typedObj === "function") &&
    typeof typedObj.toclevel === "number" &&
    typeof typedObj.number === "string" &&
    typeof typedObj.level === "string" &&
    typeof typedObj.line === "string"
  );
}

export function isWikiData(obj: unknown): obj is WikiData {
  const typedObj = obj as WikiData;
  return (
    ((typedObj !== null && typeof typedObj === "object") ||
      typeof typedObj === "function") &&
    ((typedObj.parse !== null && typeof typedObj.parse === "object") ||
      typeof typedObj.parse === "function") &&
    typeof typedObj.parse.title === "string" &&
    ((typedObj.parse.text !== null &&
      typeof typedObj.parse.text === "object") ||
      typeof typedObj.parse.text === "function") &&
    typeof typedObj.parse.text["*"] === "string"
  );
}
