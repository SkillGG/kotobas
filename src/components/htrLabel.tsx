import { SanitizedText } from "@/htr/sanitizer";

export function HTRText({ htr }: { htr: string }) {
  return <>{new SanitizedText({ htr }).toJSX()}</>;
}
