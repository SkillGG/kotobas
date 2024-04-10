import { type ReactNode } from "react";

import { parse } from "node-html-parser";

import replace from "react-string-replace";
import React from "react";

import he from "he";

const deepReplace = (
  node: ReactNode,
  r: (s: ReactNode[]) => ReactNode[],
): ReactNode[] => {
  if (!node) return [node];
  if (typeof node === "string") {
    const ret = r([node]);
    return ret;
  } else {
    if (typeof node === "object" && "props" in node) {
      const { props } = node as { props: unknown };
      if (props && typeof props === "object" && "children" in props) {
        if (Array.isArray(props.children)) {
          const ret = props.children.map((c) => deepReplace(c as ReactNode, r));
          return [React.cloneElement(node, props, ret)];
        } else if (typeof props.children === "string") {
          const ret = r([props.children]);
          return [React.cloneElement(node, props, ...ret)];
        } else return [node];
      }
      return [node];
    }
  }
  return [node];
};

export class SanitizedText {
  /**
   * HyperText Ruby
   */
  htr: string;

  constructor({ htr }: { htr: string }) {
    this.htr = htr;
  }
  static fromHTML(html: string, decode = true): SanitizedText {
    const parsed = parse(html);

    parsed.querySelectorAll("br").forEach((el) => {
      el.replaceWith("[/]");
    });
    parsed.querySelectorAll("ruby").forEach((el) => {
      el.innerHTML = el.innerHTML.replace(/<(\/)?r(t|b|p)>/g, "[$1r$2]");
      el.replaceWith(el.outerHTML.replace(/<(\/)?ruby>/gi, "[$1r]"));
    });

    return new SanitizedText({
      htr: decode ? he.decode(parsed.outerHTML) : parsed.outerHTML,
    });
  }
  deRubify(r: ReactNode[]): ReactNode[] {
    const deRuby = replace(r, /\[r]([\s\S]*?)\[\/r]/g, (q) => {
      const noRB = replace(q, /\[rb]([\s\S]*?)\[\/rb]/g, (m) => {
        return m;
      });

      const rt = replace(noRB, /\[rt]([\s\S]*?)\[\/rt]/g, (m) => {
        return <rt key={m}>{m}</rt>;
      });

      const rp = replace(rt, /\[rp]([\s\S]*?)\[\/rp]/g, (m) => {
        return <rp key={m}>{m}</rp>;
      });

      return <ruby key={q}>{...rp}</ruby>;
    });

    return deRuby;
  }
  formatText(nodes: ReactNode[]): ReactNode[] {
    const replaced = nodes
      .flatMap((node) =>
        deepReplace(node, (r) =>
          replace(r, /\[b]([\s\S]*?)\[\/b]/g, (m) => <b>{m}</b>),
        ),
      )
      .flatMap((node) =>
        deepReplace(node, (r) =>
          replace(r, /\[i]([\s\S]*?)\[\/i]/g, (m) => <i>{m}</i>),
        ),
      )
      .flatMap((node) =>
        deepReplace(node, (r) =>
          replace(r, /\[s]([\s\S]*?)\[\/s]/g, (m) => <s>{m}</s>),
        ),
      )
      .flatMap((node) =>
        deepReplace(node, (r) =>
          replace(r, /\[sup]([\s\S]*?)\[\/sup]/g, (m) => <sup>{m}</sup>),
        ),
      )
      .flatMap((node) =>
        deepReplace(node, (r) =>
          replace(r, /\[sub]([\s\S]*?)\[\/sub]/g, (m) => <sub>{m}</sub>),
        ),
      );

    return replaced;
  }
  toJSX(onlyBRs = false): ReactNode {
    const deruby = onlyBRs ? [this.htr] : this.deRubify([this.htr]);

    const formatted = onlyBRs ? deruby : this.formatText(deruby).flat(3);

    const deBRd = formatted
      .flatMap((node) =>
        deepReplace(node, (n) =>
          replace(n, /(\[\/])/g, (_, i) => <br key={i} />),
        ),
      )
      .flatMap((node) =>
        deepReplace(node, (n) => replace(n, /(\&gt;)/g, () => ">")),
      )
      .flatMap((node) =>
        deepReplace(node, (n) => replace(n, /(\&lt;)/g, () => "<")),
      );

    return <>{...deBRd}</>;
  }
}
