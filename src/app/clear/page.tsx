"use client";

import { api } from "@/trpc/react";
import React from "react";

export default function KotoList() {
  const {
    client: {
      koto: { clear },
    },
    koto: {
      getDBList: { invalidate: invalidateDB },
    },
  } = api.useUtils();

  const list = api.koto.getDBList.useQuery().data;

  return (
    <div className="grid h-screen place-content-center overflow-hidden">
      {!list?.length ? (
        <span className="text-green-300">DATA CLEARED!</span>
      ) : (
        <button
          className="text-red-500"
          onClick={async () => {
            await clear.query();
            await invalidateDB();
          }}
        >
          CLEAR ALL DATA
        </button>
      )}
    </div>
  );
}
