import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { kotobasWords } from "@/server/db/schema";
import { parseJisho } from "./jisho";
import { desc, gt } from "drizzle-orm";
import { parseWiktionary } from "./wiktionary";
import { Dictionaries, DictionaryEntry } from "@/utils";
import { parseJotoba } from "./jotoba";

export const wordRouter = createTRPCRouter({
  getList: publicProcedure.query(async ({ ctx }) => {
    const novels = await ctx.db
      .select({
        lang: kotobasWords.lang,
        meanings: kotobasWords.meanings,
        word: kotobasWords.word,
      })
      .from(kotobasWords)
      .orderBy(desc(kotobasWords.id));
    return novels;
  }),
  scrapLists: publicProcedure
    .input(
      z.object({
        dic: z.enum(Dictionaries),
        keyword: z.string(),
      }),
    )
    .query(async ({ input: { dic, keyword } }) => {
      console.log("Searching in ", dic, "for ", keyword);
      const dics = {
        jisho: parseJisho,
        jotoba: parseJotoba,
        wikiEN: parseWiktionary("EN"),
        wikiJP: parseWiktionary("JA"),
      } as const;
      const words = await dics[dic]?.(keyword);

      if ("error" in words) throw words.error;

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
    .mutation(async ({ ctx, input: { lang, meanings, word, pitch } }) => {
      await ctx.db.insert(kotobasWords).values({
        lang: lang,
        word: word,
        meanings: meanings,
        pitch: pitch?.map((p) => `(${p.part})${p.high ? "+" : "-"}`),
      });
      return "OK";
    }),
  getDBList: publicProcedure.query(async ({ ctx }) => {
    const listFromDB = await ctx.db
      .select({
        lang: kotobasWords.lang,
        meanings: kotobasWords.meanings,
        word: kotobasWords.word,
      })
      .from(kotobasWords)
      .orderBy(desc(kotobasWords.id))
      .limit(10);
    return listFromDB;
  }),
  clear: publicProcedure.query(async ({ ctx }) => {
    await ctx.db.delete(kotobasWords).where(gt(kotobasWords.id, -1));
  }),
});
