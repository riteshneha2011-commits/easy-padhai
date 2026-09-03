import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import katex from "katex";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function renderMarkdownWithMath(content: string): string {
  if (!content) return "";

  const mathTokens: Array<{ placeholder: string; html: string }> = [];
  let tokenCounter = 0;

  // 1. Extract Display Math \[ ... \] and $$ ... $$
  let processed = content.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const placeholder = `%%KATEX_DISP_${tokenCounter++}%%`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathTokens.push({
        placeholder,
        html: `<div class="katex-display-wrapper my-3 overflow-x-auto py-1">${rendered}</div>`,
      });
    } catch {
      mathTokens.push({ placeholder, html: `<div class="katex-error">\\[${math}\\]</div>` });
    }
    return placeholder;
  });

  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const placeholder = `%%KATEX_DISP_${tokenCounter++}%%`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
      mathTokens.push({
        placeholder,
        html: `<div class="katex-display-wrapper my-3 overflow-x-auto py-1">${rendered}</div>`,
      });
    } catch {
      mathTokens.push({ placeholder, html: `<div class="katex-error">$$${math}$$</div>` });
    }
    return placeholder;
  });

  // 2. Extract Inline Math \( ... \) and $ ... $
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const placeholder = `%%KATEX_INL_${tokenCounter++}%%`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      mathTokens.push({ placeholder, html: `<span class="katex-inline-wrapper">${rendered}</span>` });
    } catch {
      mathTokens.push({ placeholder, html: `\\(${math}\\)` });
    }
    return placeholder;
  });

  // Match $math$ while avoiding currency like $10 or $$
  processed = processed.replace(/(^|[^\\])\$([^\$\n]+?)\$/g, (match, prefix, math) => {
    if (/^\s*\d+([.,]\d+)?\s*$/.test(math)) return match;
    const placeholder = `%%KATEX_INL_${tokenCounter++}%%`;
    try {
      const rendered = katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
      mathTokens.push({ placeholder, html: `<span class="katex-inline-wrapper">${rendered}</span>` });
      return `${prefix}${placeholder}`;
    } catch {
      return match;
    }
  });

  // 3. Parse Markdown
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  let html = marked.parse(processed) as string;

  // 4. Restore math tokens
  for (const item of mathTokens) {
    html = html.replace(`<p>${item.placeholder}</p>`, item.html);
    html = html.replace(item.placeholder, item.html);
  }

  // 5. Wrap table tags in responsive container
  html = html.replace(/<table>/g, '<div class="table-container overflow-x-auto my-4 rounded-xl border border-border"><table>');
  html = html.replace(/<\/table>/g, "</table></div>");

  // 6. Sanitize with DOMPurify
  if (typeof window !== "undefined" && DOMPurify.sanitize) {
    return DOMPurify.sanitize(html, {
      ADD_TAGS: [
        "math",
        "semantics",
        "annotation",
        "annotation-xml",
        "mrow",
        "mi",
        "mo",
        "mn",
        "msup",
        "msub",
        "msubsup",
        "mfrac",
        "msqrt",
        "mtext",
        "mspace",
        "mpadded",
        "mstyle",
        "mtable",
        "mtr",
        "mtd",
      ],
      ADD_ATTR: ["aria-hidden", "style", "viewBox", "xmlns", "display", "mathvariant", "columnalign"],
    });
  }

  return html;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      return renderMarkdownWithMath(content);
    } catch (e) {
      console.error("Markdown parse error:", e);
      return content;
    }
  }, [content]);

  return (
    <div 
      className={cn("easy-markdown leading-relaxed space-y-3.5", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** Lightweight Math & Markdown inline renderer for Quizzes (prompt, options, explanations) */
export function MathText({ content, className }: { content: string; className?: string }) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      return renderMarkdownWithMath(content);
    } catch {
      return content;
    }
  }, [content]);

  return (
    <span
      className={cn("easy-markdown inline-math-text [&_p]:inline [&_p]:m-0", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
