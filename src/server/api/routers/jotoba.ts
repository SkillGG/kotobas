import { type DictionaryEntry, fetchDirectly } from "@/utils";

/** @see {isJotobaData} ts-auto-guard:type-guard */
export type JotobaData = {
  words: {
    reading: {
      kana: string;
      kanji?: string;
      furigana?: string;
    };
    common: boolean;
    senses: {
      glosses: string[];
      pos?: (string | Record<string, string>)[];
      language?:
        | "English"
        | "German"
        | "Spanish"
        | "Russain"
        | "Swedish"
        | "French"
        | "Dutch"
        | "Hungarian"
        | "Slovenian";
      misc?: string;
    }[];
    audio?: string;
    pitch?: {
      part: string;
      high: boolean;
    }[];
  }[];
};

export const parseJotoba = async (
  keyword: string,
): Promise<DictionaryEntry[]> => {
  const url = `https://jotoba.de/api/search/words`;

  const txt = await fetchDirectly(url, false, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: keyword,
      language: "English",
    }),
  });

  const json: JotobaData = JSON.parse(txt) as JotobaData;

  if (!json) return void console.error("JishoText not OK"), [];

  const words: DictionaryEntry[] = [];

  const readingToHSR = ({
    kana,
    furigana,
  }: JotobaData["words"][number]["reading"]): string => {
    return (
      furigana?.replace(/\[(.*?)\]/g, (m, g) => {
        console.log("m", m, "g", g);
        const data = m.substring(1, m.length - 1).split("|");
        console.log(data);
        const [clump, ...kanjis] = data;
        return kanjis.length < (clump?.length ?? 0)
          ? `[r]${clump}[rt]${kanjis.join("")}[/rt][/r]`
          : clump?.split("").reduce((p, n, i) => {
              return p + `[r]${n}[rt]${kanjis[i] ?? ""}[/rt][/r]`;
            }, "") ??
              data[0] ??
              m.substring(1, m.length - 1);
      }) ?? kana
    );
  };

  for (const word of json.words) {
    const reading = readingToHSR(word.reading);
    console.log(reading);
    words.push({
      word: reading,
      meanings: word.senses.reduce<string[]>((p, sense) => {
        return [
          ...p,
          `${sense.pos
            ?.map((s) =>
              typeof s === "string"
                ? s
                : Object.entries(s)
                    .map(([p, v]) => (v === "Normal" ? p : `${v} ${p}`))
                    .join(","),
            )
            .join(", ")}\n${sense.glosses.join(", ")}`,
        ];
      }, []),
      lang: "EN",
      pitch: word.pitch,
    });
  }

  return words;
};
