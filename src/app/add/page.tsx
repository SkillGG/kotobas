"use client";

import { SearchResponse } from "@/components/SearchResponse";
import { useRef, useState } from "react";

export default function KotoAdd() {
  const [jisho, setJisho] = useState(false);

  const [search, showSearch] = useState("");

  const searchBoxRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex justify-center">
        <label className="w-full max-w-64 cursor-pointer select-none py-2 text-center">
          <span
            className={`${jisho ? "bg-green-200" : "bg-blue-200"} rounded-lg px-2 py-1 text-black`}
          >
            {jisho ? "Jisho" : "Weblio"}
          </span>
          <input
            type="checkbox"
            className="hidden"
            checked={jisho}
            onChange={(e) => {
              setJisho(e.target.checked);
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
            }
          }}
        />
        <button
          className="rounded-r-lg bg-slate-300 px-2 py-1 text-black"
          onClick={() => {
            const val = searchBoxRef.current?.value;
            if (val) showSearch(val);
          }}
        >
          Search
        </button>
      </div>
      {search &&
        (void console.log("search"),
        (<SearchResponse jisho={jisho} keyword={search} />))}
    </>
  );
}
