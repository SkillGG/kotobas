import { pgTable, index, pgEnum, text, serial } from "drizzle-orm/pg-core";

export const klang = pgEnum("KLang", ["JP", "EN"]);

export const kotobasWords = pgTable(
  "kotobas_words",
  {
    id: serial("id").primaryKey(),
    lang: klang("lang").notNull(),
    word: text("word").notNull(),
    meanings: text("meanings").array(),
    examples: text("examples").array(),
    pitch: text("pitch").array(),
  },
  (table) => {
    return {
      wordLangIdx: index("kotobas_words_word_lang_idx").on(
        table.lang,
        table.word,
      ),
    };
  },
);
