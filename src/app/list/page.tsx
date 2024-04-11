"use client";

import React from "react";
import { api } from "@/trpc/react";
import { HTRText } from "@/components/htrLabel";

export default function KotoList() {
  const list = api.koto.getDBList.useQuery(undefined, {
    refetchInterval: 5000,
  }).data;

  const sortedList = [...(list ?? [])]?.sort((p, n) => {
    return n.id - p.id;
  });

  return (
    <div className="max-h-screen overflow-hidden">
      {sortedList?.map((w) => {
        return (
          <div
            key={`${w.lang}_${w.word}`}
            className="overflow-hidden border-b-[1px] border-gray-300"
          >
            <h1
              className={`kanjiname mx-[auto] mt-2 w-fit border-b-2 border-dotted px-5 text-center text-[2rem]`}
            >
              <HTRText htr={w.word} />
            </h1>
            <ol>
              {w.meanings?.map((m) => {
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
                      <div className="xsm:w-full mx-[auto] w-[50%]">
                        {meaning}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
