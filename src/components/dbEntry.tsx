"use client";

import { type PropsWithoutRef } from "react";
import { HTRText } from "./htrLabel";
import { type inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import css from "./dicEntry.module.css";

export default function DatabaseEntry({
  entry,
}: PropsWithoutRef<{
  entry: inferRouterOutputs<AppRouter>["koto"]["getDBList"][number];
}>) {
  return (
    <div className="overflow-hidden border-b-[1px] border-gray-300">
      <h1
        className={`kanjiname mx-[auto] mt-2 w-fit border-b-2 border-dotted px-5 text-center text-[2rem]`}
      >
        <HTRText htr={entry.word} />
      </h1>
      {entry.pitch && (
        <div className="mx-[auto] my-1 w-fit">
          {entry.pitch.map((txt) => {
            const exec = /\((.*?)\)(\+|\-)/.exec(txt);
            if (!exec) return null;
            const [, part, highStr] = exec;
            if (typeof part !== "string" || typeof highStr !== "string")
              return null;
            const high = highStr === "+";
            return (
              <span
                key={`${part}${high}`}
                className={`${high ? css.high : css.low} ${part.length === 0 ? css.empty : ""}`}
              >
                {part}
              </span>
            );
          })}
        </div>
      )}
      <hr className="mx-auto w-[33%]" />
      <ol>
        {entry.meanings?.map((m) => {
          const [type, meaning] = m.split("\n");
          return (
            <li
              className="mb-1 border-b-[1px] border-dotted pb-2 text-center last-of-type:border-none last-of-type:pb-0 "
              key={meaning}
            >
              <div>
                {type !== "?" && type !== "??" && (
                  <small>
                    <b>{type}</b>
                  </small>
                )}
                <div className="xsm:w-full mx-[auto] w-[50%]">{meaning}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
