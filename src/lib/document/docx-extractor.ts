import mammoth from 'mammoth';

export interface ExtractedDocxPage {
  pageNumber: number;
  text: string;
  headings: string[];
}

export class DocxExtractor {
  /**
   * Extracts clean formatted text and headings from a .docx file or ArrayBuffer.
   * Splits into logical reading pages (~400 words each).
   */
  static async extractTextFromDocx(file: File | ArrayBuffer): Promise<ExtractedDocxPage[]> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;

    // Use mammoth to extract clean markdown/raw text
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value || '';

    if (!rawText.trim()) {
      throw new Error('No readable text found in DOCX file.');
    }

    // Clean up excessive whitespace
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Extract potential headings (lines that are short, capitalized, or start with numbers)
    const lines = cleanedText.split('\n');
    const detectedHeadings: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.length > 3 &&
        trimmed.length < 80 &&
        !trimmed.endsWith('.') &&
        !trimmed.startsWith('http')
      ) {
        if (/^[0-9]+[\.\)]\s+[A-Z]/.test(trimmed) || /^[A-Z\s]{4,}$/.test(trimmed) || trimmed.length < 40) {
          detectedHeadings.push(trimmed);
        }
      }
    }

    // Split text into ~350-400 word chunks per page
    const paragraphs = cleanedText.split('\n\n');
    const pages: ExtractedDocxPage[] = [];
    let currentPageParagraphs: string[] = [];
    let currentWordCount = 0;
    let pageNumber = 1;

    for (const p of paragraphs) {
      const pWords = p.split(/\s+/).length;
      if (currentWordCount + pWords > 380 && currentPageParagraphs.length > 0) {
        // Page boundary
        const pageText = currentPageParagraphs.join('\n\n');
        const pageHeadings = detectedHeadings.filter((h) => pageText.includes(h));
        const primaryHeading = pageHeadings[0] || currentPageParagraphs[0]?.slice(0, 40) || `Section ${pageNumber}`;

        pages.push({
          pageNumber,
          text: pageText.startsWith('#') ? pageText : `# ${primaryHeading.replace(/^#+\s*/, '')}\n\n${pageText}`,
          headings: pageHeadings.length > 0 ? pageHeadings : [primaryHeading],
        });

        pageNumber++;
        currentPageParagraphs = [p];
        currentWordCount = pWords;
      } else {
        currentPageParagraphs.push(p);
        currentWordCount += pWords;
      }
    }

    if (currentPageParagraphs.length > 0) {
      const pageText = currentPageParagraphs.join('\n\n');
      const pageHeadings = detectedHeadings.filter((h) => pageText.includes(h));
      const primaryHeading = pageHeadings[0] || currentPageParagraphs[0]?.slice(0, 40) || `Section ${pageNumber}`;

      pages.push({
        pageNumber,
        text: pageText.startsWith('#') ? pageText : `# ${primaryHeading.replace(/^#+\s*/, '')}\n\n${pageText}`,
        headings: pageHeadings.length > 0 ? pageHeadings : [primaryHeading],
      });
    }

    return pages;
  }
}
