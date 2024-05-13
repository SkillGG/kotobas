import { type DictionaryEntry, fetchURL } from "@/utils";
import parse from "node-html-parser";

export const parseJisho = async (
  keyword: string,
  page = 1,
): Promise<DictionaryEntry[]> => {
  const url = `https://jisho.org/search/${encodeURIComponent(keyword)}?page=${page}`;

  const text = await fetchURL(url);

  if (!text) return void console.error("JishoText not OK"), [];

  const parsed = parse(text);

  const parseFurigana = (kanji: string, furi: typeof parsed | null) => {
    if (!furi) return kanji;

    const spans = furi.querySelectorAll("span").map((r) => r.textContent);

    const kanjis = kanji.split("");

    spans.forEach((f, i) => {
      if (!f) return;
      kanjis[i] = `[r]${kanjis[i]}[rt]${f}[/rt][/r]`;
    });
    return kanjis.join("");
  };

  const parseConcept = (concept: typeof parsed) => {
    const wordDiv = concept.querySelector(".concept_light-representation");
    if (!wordDiv) return void console.error("no wDiv"), null;

    const furi = wordDiv.querySelector(".furigana");
    const kanji = wordDiv.querySelector(".text");

    if (!kanji?.textContent) return void console.error("no kanji"), null;

    const word = parseFurigana(kanji.textContent.trim(), furi);

    const meaningList = concept.querySelector(".meanings-wrapper");

    if (!meaningList) return void console.error("no meanings"), null;

    const meanings = meaningList
      .querySelectorAll("*")
      .reduce<({ type?: string; meaning?: string } | null)[]>((p, e) => {
        if (e.classList.contains("meaning-tags")) {
          if (!e.textContent) return void console.error("no meaning-tags"), p;
          return [...p, { type: e.textContent }];
        }
        if (e.classList.contains("meaning-wrapper")) {
          const meaning = e.querySelector(".meaning-meaning");
          if (!meaning?.textContent)
            return void console.error("no meaning-meaning"), p;
          if (p.length === 0)
            return [
              {
                type: "?",
                meaning: meaning.textContent.trim(),
              },
            ];
          const lastMean = p[p.length - 1];
          if (lastMean?.type === "??" || lastMean?.type === "?")
            return [
              ...p,
              {
                type: lastMean.type ?? "??",
                meaning: meaning.textContent,
              },
            ];
          return [
            ...p.slice(0, p.length - 1),
            {
              type: lastMean?.type ?? "??",
              meaning: meaning.textContent,
            },
          ];
        }
        return p;
      }, []);

    const solidMeanings = meanings.filter((p) => p?.type && p?.meaning) as {
      type: string;
      meaning: string;
    }[];

    return {
      word,
      meanings: solidMeanings.map(({ type, meaning }) => `${type}\n${meaning}`),
    };
  };

  const exactMatch = parsed.querySelector(".exact_block");
  const probableBlocks = parsed.querySelector(".concepts");

  const words: DictionaryEntry[] = [];

  if (exactMatch) {
    const matches = exactMatch.querySelectorAll(".concept_light");
    const mWords = matches.map((m) => m && parseConcept(m));
    for (const w of mWords) {
      if (w) words.push({ ...w, exactMatch: true, lang: "EN" });
    }
  }
  if (probableBlocks) {
    const matches = probableBlocks.querySelectorAll(".concept_light");
    const mWords = matches.map((m) => m && parseConcept(m));
    for (const w of mWords) {
      if (w) words.push({ ...w, exactMatch: false, lang: "EN" });
    }
  }

  return words;
};
