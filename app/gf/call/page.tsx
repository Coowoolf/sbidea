import { Suspense } from "react";
import { CallClient } from "./call-client";

export default function GfCallPage() {
  return (
    <Suspense>
      <CallClient />
    </Suspense>
  );
}
