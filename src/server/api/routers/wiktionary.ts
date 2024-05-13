import { type DictionaryEntry, fetchDirectly } from "@/utils";
import {  isWikiParsedSections } from "./wiktionary.guard";

/** @see {isWikiParsedSections} ts-auto-guard:type-guard */
export type WikiParsedSections = {
  parse: {
    title: string;
    sections: WikiSectionData[];
  };
};

/** @see {isWikiSectionData} ts-auto-guard:type-guard */
export type WikiSectionData = {
  toclevel: number;
  number: string;
  level: string;
  line: string;
};

/** @see {isWikiData} ts-auto-guard:type-guard */
export type WikiData = {
  parse : {
    title: string;
    text: {["*"]: string}
  }
};

const getWikiURL = (
  lang: string,
  action: string,
  prop: string,
  propData: Record<string, string>,
) => {
  return `https://${lang}.wiktionary.org/w/api.php?action=${action}&prop=${prop}${Object.entries(propData).reduce((p, n) => `${p}&${n[0]}${n[1]?"=":""}${n[1]}`, "")}&format=json`;
};

export const parseWiktionary = (
  lang: "EN" | "JA",
): ((keyword: string) => Promise<DictionaryEntry[] | { error: string }>) => {
  return async (keyword) => {
    const page = encodeURIComponent(keyword);
    const sectionURL = getWikiURL(lang, "parse", "sections", { page });
    const japSectionURL = (section: number) =>
      getWikiURL(lang, "query", "extracts", { exintro: `${section}`, page });
    const json = await fetchDirectly(sectionURL, true);
    if (!isWikiParsedSections(json)) {
      console.error("Not a WikiSectionData!", json);
      return { error: "" };
    }

    const {
      parse: { sections },
    } = json;

    const indexedSections: (WikiSectionData & { id: number })[] = sections.map(
      (u, id) => ({ ...u, id }),
    );

    const mainSection = indexedSections.find((sec) => {
      const { line, toclevel } = sec;
      return (line === "日本語" || line === "Japanese") && toclevel === 1;
    });
    if (!mainSection) return { error: "No Japanese section!" };
    const subsections = indexedSections.filter((subs) => {
      return (
        subs.number.startsWith(mainSection.number) &&
        mainSection.number !== subs.number &&
        !!/^\d+\.\d+$/.exec(subs.number)
      );
    });

    // console.log(subsections);

    for (const section of subsections) {
      await fetchDirectly(japSectionURL(section.id + 1), true);
      // if(!isWikiData(data))
      // console.log(section, data);
    }


    return [];
  };
};
