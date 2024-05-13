import { type DictionaryEntry } from "@/utils";
import { type ComponentPropsWithoutRef, type PropsWithoutRef } from "react";
import { HTRText } from "./htrLabel";

import css from "./dicEntry.module.css";

export default function DictionaryEntryView({
  entry,
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { entry: DictionaryEntry }) {
  console.log(entry);
  return (
    <div
      className={`${className} cursor-pointer border-b-[1px] border-gray-300 hover:bg-[#fff2]`}
      {...props}
    >
      <div
        className={`${
          entry.exactMatch
            ? "text-orange-300"
            : entry.exactMatch !== undefined
              ? "text-yellow-300"
              : ""
        } mx-[auto] mt-2 w-fit border-b-2 border-dotted px-5 text-center text-[2rem]`}
      >
        <HTRText htr={entry.word} />
      </div>
      {entry.pitch && (
        <div className="mx-[auto] my-1 w-fit">
          {entry.pitch.map(({ part, high }) => {
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
      <ol>
        {entry.meanings.map((m) => {
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
