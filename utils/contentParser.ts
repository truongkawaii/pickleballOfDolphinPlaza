export interface ParsedContent {
  type: "paragraph" | "subsection-header" | "bullet" | "nested-bullet";
  content: string;
  level: number;
}

export function parseReadingContent(text: string): ParsedContent[] {
  const lines = text.split("\n");
  const parsed: ParsedContent[] = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Subsection header (ends with :)
    if (line.endsWith(":")) {
      parsed.push({
        type: "subsection-header",
        content: line.slice(0, -1),
        level: 0,
      });
    }
    // Main bullet point (starts with •)
    else if (line.startsWith("•")) {
      parsed.push({
        type: "bullet",
        content: line.substring(1).trim(),
        level: 1,
      });
    }
    // Nested bullet point (starts with *)
    else if (line.startsWith("*")) {
      parsed.push({
        type: "nested-bullet",
        content: line.substring(1).trim(),
        level: 2,
      });
    }
    // Regular paragraph
    else {
      parsed.push({
        type: "paragraph",
        content: line,
        level: 0,
      });
    }
  }

  return parsed;
}
