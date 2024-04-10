import { SanitizedText } from "@/htr/sanitizer";

export async function ServerHTRText({ htr }: { htr: string }) {
  return <>{new SanitizedText({ htr }).toJSX()}</>;
}
