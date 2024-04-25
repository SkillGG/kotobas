import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { kotobasWords } from "@/server/db/schema";
import parse from "node-html-parser";
import { env } from "@/env";
import { fetchDirectly, fetchFromProxy } from "@/utils";

const DictionaryEntry = z.object({
  word: z.string(),
  meanings: z.array(z.string()),
  exactMatch: z.boolean().optional(),
  lang: z.enum(["EN", "JP"]),
});

type DictionaryEntry = z.infer<typeof DictionaryEntry>;

const fetchURL = async (url: string) =>
  env.IS_REMOTE === "false"
    ? await fetchDirectly(url)
    : await fetchFromProxy(url);

const parseJisho = async (
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

const parseWeblio = async (
  keyword: string,
  page = 0,
): Promise<DictionaryEntry[]> => {
  const url = `https://www.weblio.jp/content/${encodeURIComponent(keyword)}?page=${page}`;

  const text = await fetchURL(url);

  if (!text) return void console.error("JishoText not OK"), [];

  const parsed = parse(text);

  const content = parsed.querySelector("#cont");
  if (!content) return void console.log("NO CONTENT!"), [];

  const items = content
    .querySelectorAll(".pbarT, .kijiWrp")
    .reduce<{ bar?: typeof parsed; kiji?: typeof parsed }[]>((p, n, i, a) => {
      if (a.length === 0) {
        return [{ bar: n }];
      } else {
        const isBar = n.classList.contains("pbarT");
        const lastEl = a[i - 1];
        if (!lastEl) return isBar ? [{ bar: n }] : [{ kiji: n }];
        const lastBar = lastEl.classList.contains("pbarT");
        if (isBar) {
          return [...p, { bar: n }];
        } else if (lastBar) {
          const lastEl = p[p.length - 1];
          if (lastEl) lastEl.kiji = n;
        } else {
          return [...p, { kiji: n }];
        }
      }
      return p;
    }, []);

    

  return [];
};

export const wordRouter = createTRPCRouter({
  getList: publicProcedure.query(async ({ ctx }) => {
    const novels = await ctx.db
      .select({
        lang: kotobasWords.lang,
        meanings: kotobasWords.meanings,
        word: kotobasWords.word,
      })
      .from(kotobasWords);
    return novels;
  }),
  scrapLists: publicProcedure
    .input(z.object({ jisho: z.boolean(), keyword: z.string() }))
    .query(async ({ input: { jisho, keyword } }) => {
      console.log("Searching in ", jisho ? "jisho" : "weblio", "for ", keyword);
      const words = jisho
        ? await parseJisho(keyword)
        : await parseWeblio(keyword);

      const wordSet: typeof words = [];

      for (const word of words) {
        const alreadyIn = wordSet.find(
          (w) => w.word === word.word && w.lang === word.lang,
        );
        if (alreadyIn) {
          alreadyIn.meanings = [...alreadyIn.meanings, ...word.meanings];
        } else {
          wordSet.push(word);
        }
      }

      return wordSet;
    }),
  addWord: publicProcedure
    .input(DictionaryEntry)
    .mutation(async ({ ctx, input: { lang, meanings, word } }) => {
      await ctx.db
        .insert(kotobasWords)
        .values({ lang: lang, word: word, meanings: meanings });
      return "OK";
    }),
  getDBList: publicProcedure.query(async ({ ctx }) => {
    const listFromDB = await ctx.db.query.kotobasWords.findMany({ limit: 10 });
    return listFromDB;
  }),
  clear: publicProcedure.query(async ({ ctx }) => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await ctx.db.delete(kotobasWords);
  }),
});
