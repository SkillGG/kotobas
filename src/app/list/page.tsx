"use client";

import React from "react";
import { api } from "@/trpc/react";
import DictionaryEntryView from "@/components/dbEntry";

export default function KotoList() {
  const list = api.koto.getDBList.useQuery(undefined, {
    refetchInterval: 5000,
  }).data;

  return (
    <div className="max-h-screen overflow-hidden">
      {list?.map((w) => {
        return <DictionaryEntryView entry={w} key={`${w.lang}_${w.word}`} />;
      })}
    </div>
  );
}
