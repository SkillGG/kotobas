"use client";

import { SearchResponse } from "@/components/SearchResponse";
import { Dictionaries, dictionaryName, type Dictionary } from "@/utils";
import {  useRef, useState } from "react";

export default function KotoAdd() {
  const [dictionary, setDictionary] = useState<Dictionary>("jotoba");

  const [search, showSearch] = useState("");

  const searchBoxRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex justify-center">
        <label className="w-full max-w-64 cursor-pointer select-none py-2 text-center">
          <span
            className={`${dictionary === "jisho" ? "bg-green-200" : "bg-red-200"} rounded-lg px-2 py-1 text-black`}
          >
            {dictionaryName[dictionary]}
          </span>
          <button
            className="hidden"
            onClick={() => {
              setDictionary((p) => {
                const pI = Dictionaries.findIndex((d) => d === p);
                if (pI < 0) return Dictionaries[0] ?? "jisho";
                if (pI >= Dictionaries.length - 1)
                  return Dictionaries[0] ?? "jisho";
                return Dictionaries[pI + 1] ?? "jisho";
              });
            }}
          />
        </label>
      </div>
      <div className="flex justify-center">
        <input
          type="text"
          className="rounded-l-lg bg-slate-300 py-1 pl-2 text-black outline-none"
          ref={searchBoxRef}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = searchBoxRef.current?.value;
              if (val) showSearch(val);
              if (searchBoxRef.current) searchBoxRef.current.value = "";
            }
          }}
        />
        <button
          className="rounded-r-lg bg-slate-300 px-2 py-1 text-black"
          onClick={() => {
            const val = searchBoxRef.current?.value;
            if (val) showSearch(val);
            if (searchBoxRef.current) searchBoxRef.current.value = "";
          }}
        >
          {dictionary ? "Search" : <>TODO</>}
        </button>
      </div>
      {search &&
        (void console.log("search"),
        (<SearchResponse dic={dictionary} keyword={search} />))}
    </>
  );
}
