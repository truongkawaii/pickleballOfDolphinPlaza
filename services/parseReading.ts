import { ComprehensiveReading, ReadingSection } from "../types";

export function parseComprehensiveReading(text: string): ComprehensiveReading {
  // Split by numbered sections (e.g., "1. ", "2. ", "3. ")
  const sectionRegex = /^\d+\.\s+(.+?)$/gm;
  const matches = [...text.matchAll(sectionRegex)];

  const sections: ReadingSection[] = [];

  // Extract overview (everything before first numbered section)
  const firstMatch = matches[0];
  const overview = firstMatch
    ? text.substring(0, firstMatch.index).trim()
    : text.substring(0, 500);

  // Parse each section
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];

    const sectionTitle = match[1].trim();
    const startIndex = (match.index || 0) + match[0].length;
    const endIndex = nextMatch ? nextMatch.index : text.length;

    let sectionContent = text.substring(startIndex, endIndex).trim();

    // Try to extract subsections (lines starting with bullets or dashes)
    const subsectionRegex = /^[\-\•\*]\s+(.+?)$/gm;
    const subsectionMatches = [...sectionContent.matchAll(subsectionRegex)];

    const subsections =
      subsectionMatches.length > 0
        ? subsectionMatches.map((sm) => ({
            title: sm[1].split(":")[0].trim(),
            content: sm[1].split(":").slice(1).join(":").trim() || sm[1],
          }))
        : undefined;

    sections.push({
      id: `section-${i}`,
      title: sectionTitle,
      content: sectionContent,
      subsections,
    });
  }

  return {
    overview,
    sections,
  };
}
