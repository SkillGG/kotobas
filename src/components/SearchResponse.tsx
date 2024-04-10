import React from "react";
import { HTRText } from "@/components/htrLabel";
import { api } from "@/trpc/react";

export function SearchResponse({
  jisho,
  keyword,
}: {
  jisho: boolean;
  keyword: string;
}) {
  const search = api.koto.scrapLists.useQuery({
    jisho,
    keyword,
  }).data;

  const inDB = api.koto.getList.useQuery().data;

  const addWord = api.koto.addWord.useMutation();

  return (
    <div className="xsm:w-full mx-[auto] w-[50%]">
      {search?.map((w) => {
        const isAlreadyIn = !!inDB?.find(
          (x) => w.word === x.word && w.lang === x.lang,
        );
        return (
          <div
            title="Add to the list"
            className={`${isAlreadyIn ? "" : "cursor-pointer"} border-b-[1px] border-gray-300 hover:bg-[#fff2]`}
            key={`${jisho ? "j" : "w"}_${w.word}`}
            onClick={() => {
              if (isAlreadyIn) {
                alert("already added!");
              } else {
                void addWord.mutate(w);
              }
            }}
          >
            <div
              className={`${
                w.exactMatch
                  ? "text-green-300"
                  : w.exactMatch !== undefined
                    ? "text-orange-300"
                    : ""
              } mx-[auto] mt-2 w-fit border-b-2 border-dotted px-5 text-center text-[2rem]`}
            >
              <HTRText htr={w.word} />
            </div>
            <ol>
              {w.meanings.map((m) => {
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
