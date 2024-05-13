"use client";

import React from "react";
import { api } from "@/trpc/react";
import { HTRText } from "@/components/htrLabel";
import DictionaryEntryView from "@/components/dbEntry";

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
        return <DictionaryEntryView entry={w} key={`${w.lang}_${w.word}`} />;
      })}
    </div>
  );
}
