import React from "react";
import { api } from "@/trpc/react";
import { type Dictionary } from "@/utils";
import DictionaryEntryView from "./dicEntry";

export function SearchResponse({
  dic,
  keyword,
}: {
  dic: Dictionary;
  keyword: string;
}) {
  const search = api.koto.scrapLists.useQuery({
    dic,
    keyword,
  });

  const utils = api.useUtils();

  const inDB = api.koto.getList.useQuery().data;

  const data = search.data?.reduce<{
    in: typeof search.data;
    out: typeof search.data;
  }>(
    (p, f) => {
      if (inDB?.find((w) => w.word === f.word && w.lang === f.lang)) {
        return { ...p, in: [...(p.in ?? []), f] };
      }
      return { ...p, out: [...(p.out ?? []), f] };
    },
    {
      in: [],
      out: [],
    },
  );

  if (!search.isFetched && search.isFetching) return <>Fetching...</>;

  return (
    <div>
      <div className="flex overflow-hidden sm:h-[calc(100vh_-_64px)]">
        {!!data?.in?.length && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b-2 text-center text-2xl">Added</div>
            <div className="overflow-auto pb-2">
              {data?.in?.map((w) => {
                return (
                  <DictionaryEntryView
                    entry={w}
                    key={`${dic ? "j" : "w"}_${w.word}`}
                  />
                );
              })}
            </div>
          </div>
        )}
        <div
          className={`${data?.in.length ? "" : "mx-[auto] sm:max-w-[50%]"} flex flex-1 flex-col overflow-hidden`}
        >
          <div className="border-b-2 text-center text-2xl">Fetched</div>
          <div className="overflow-auto pb-2">
            {data?.out?.map((w) => {
              return (
                <DictionaryEntryView
                  entry={w}
                  title={"Add to the list!"}
                  key={`${dic ? "j" : "w"}_${w.word}`}
                  onClick={async () => {
                    await utils.client.koto.addWord.mutate(w);
                    await utils.koto.getList.invalidate();
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
