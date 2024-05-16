import { type DictionaryEntry, fetchDirectly } from "@/utils";

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
      pos?: (string | Record<string, string | string[]>)[];
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

const posTypes = {
  "Keiyoushi Adjective": " 形容詞",
  "Na Adjective": "形容動詞",
  Verb: "動詞",
  Noun: "名詞",
};

const verbTypes = {
  A: "あ",
  I: "い",
  U: "う",
  Ku: "く",
  Su: "す",
  Tsu: "つ",
  Fu: "ふ",
  Ru: "る",
  Na: "な",
  Nu: "ぬ",
  No: "の",
};

const deromanize = (s: string): string =>
  Object.entries(verbTypes).find(([n]) => n === s)?.[1] ??
  Object.entries(posTypes).find(([n]) => n === s)?.[1] ??
  (s.split(" ").length > 1 ? s.split(" ").map(deromanize).join(" ") : s);

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
        const data = m.substring(1, m.length - 1).split("|");
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
    // console.log(word, reading);
    words.push({
      word: reading,
      meanings: word.senses.reduce<string[]>((words, sense) => {
        console.log(sense);
        return [
          ...words,
          `${sense.pos
            ?.map((position) =>
              typeof position === "string"
                ? deromanize(position)
                : Object.entries(position)
                    .map(([posName, posValue]) =>
                      posValue === "Normal"
                        ? deromanize(posName)
                        : typeof posValue === "string"
                          ? `${deromanize(`${posValue} ${posName}`)}`
                          : `${Object.values(posValue)
                              .map((pValue) => {
                                console.log(posName, pValue);
                                return posName === "Verb"
                                  ? `~${deromanize(pValue)}`
                                  : `${posName}`;
                              })
                              .join(",")} ${posName}`,
                    )
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
