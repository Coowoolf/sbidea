import { Suspense } from "react";
import { ResultClient } from "./result-client";

export const metadata = {
  title: "你的 SBTI 结果",
  description: "这是你的傻逼型人格 + 最匹配你的几个对象。",
};

export default function SbtiResultPage() {
  return (
    <Suspense>
      <ResultClient />
    </Suspense>
  );
}
