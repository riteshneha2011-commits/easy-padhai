import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const html = useMemo(() => {
    if (!content) return "";
    try {
      marked.setOptions({
        breaks: true,
        gfm: true,
      });
      const rawHtml = marked.parse(content) as string;
      if (typeof window !== "undefined" && DOMPurify.sanitize) {
        return DOMPurify.sanitize(rawHtml);
      }
      return rawHtml;
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
