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
  });

  const utils = api.useUtils();

  const inDB = api.koto.getList.useQuery().data;

  const { mutate: addWord } = api.koto.addWord.useMutation();

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

  console.log(search, inDB, data);

  if (!search.isFetched && search.isFetching) return <>Fetching...</>;

  return (
    <div>
      <div className="flex h-[calc(100vh_-_64px)] overflow-hidden">
        {!!data?.in?.length && (
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="border-b-2 text-center text-2xl">Added</div>
            <div className="overflow-auto pb-2">
              {data?.in?.map((w) => {
                return (
                  <div
                    title="Add to the list"
                    className={`border-b-[1px] border-gray-300`}
                    key={`${jisho ? "j" : "w"}_${w.word}`}
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
          </div>
        )}
        <div
          className={`${data?.in.length ? "" : "mx-[auto] max-w-[50%]"} flex flex-1 flex-col overflow-hidden`}
        >
          <div className="border-b-2 text-center text-2xl">Fetched</div>
          <div className="overflow-auto pb-2">
            {data?.out?.map((w) => {
              return (
                <div
                  title="Add to the list"
                  className={`cursor-pointer border-b-[1px] border-gray-300 hover:bg-[#fff2]`}
                  key={`${jisho ? "j" : "w"}_${w.word}`}
                  onClick={async () => {
                    await utils.client.koto.addWord.mutate(w);
                    await utils.koto.getList.invalidate();
                  }}
                >
                  <div
                    className={`${
                      w.exactMatch
                        ? "text-orange-300"
                        : w.exactMatch !== undefined
                          ? "text-yellow-300"
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
        </div>
      </div>
    </div>
  );
}
