import { Suspense } from "react";
import { SbtiQuizClient } from "./sbti-client";

export const metadata = {
  title: "SBTI · 傻逼型人格测试",
  description: "30 题,4 分钟,测出你的 SBTI(Shabi-Type Indicator),看看你和谁最般配。",
};

export default function SbtiPage() {
  return (
    <Suspense>
      <SbtiQuizClient />
    </Suspense>
  );
}
