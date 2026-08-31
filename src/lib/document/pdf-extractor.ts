import * as pdfjsLib from 'pdfjs-dist';

// Configure worker URL for pdfjs-dist 4.x
if (typeof window !== 'undefined' && 'Worker' in window) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Could not set pdfjs workerSrc:', e);
  }
}

export interface ExtractedPDFPage {
  pageNumber: number;
  text: string;
  headings: string[];
  images?: string[];
}

export class PDFExtractor {
  /**
   * Sanitizes extracted text, repairs broken spacing, fixes spaced digits and joined words
   */
  static sanitizeText(raw: string): string {
    let text = raw
      .replace(/ﬁ/g, 'fi')
      .replace(/ﬂ/g, 'fl')
      .replace(/ﬀ/g, 'ff')
      .replace(/ﬃ/g, 'ffi')
      .replace(/ﬄ/g, 'ffl')
      .replace(/\(cid:\d+\)/gi, '')
      // Fix single-character spaced sequences (e.g., "2 0 2 6" -> "2026", "A I" -> "AI")
      .replace(/\b(\d)\s+(\d)\s+(\d)\s+(\d)\b/g, '$1$2$3$4')
      .replace(/\b(\d)\s+(\d)\b/g, '$1$2')
      .replace(/\b([A-Z])\s+([A-Z])\s+([A-Z])\s+([A-Z]+)\b/g, '$1$2$3$4')
      .replace(/\b([A-Z])\s+([A-Z])\b/g, '$1$2')
      // Fix hyphenated word breaks across lines
      .replace(/(\w+)-\s*\n\s*(\w+)/g, '$1$2')
      // Fix double spaces
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return text;
  }

  /**
   * Extracts clean, properly arranged text, headings, and diagrams/images from a PDF File or ArrayBuffer page-by-page.
   */
  static async extractTextFromPDF(file: File | ArrayBuffer): Promise<ExtractedPDFPage[]> {
    const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
    const uint8Array = new Uint8Array(arrayBuffer);

    // 1. Try standard pdfjs extraction with spatial layout reconstruction
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false,
        stopAtErrors: false,
      });

      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const pages: ExtractedPDFPage[] = [];

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent({
          includeMarkedContent: true,
        });

        // 1. Structured Text Reconstruction
        let lastY: number | null = null;
        let lastX: number | null = null;
        let lastWidth: number = 0;
        let lastFontSize: number = 12;

        interface TextLine {
          text: string;
          y: number;
          fontSize: number;
          isHeading: boolean;
        }

        const lines: TextLine[] = [];
        let currentLineText = '';
        let currentLineY = 0;
        let currentLineFontSize = 12;
        const headings: string[] = [];

        for (const item of textContent.items as any[]) {
          const str = item.str || '';
          if (!str && !item.hasEOL) continue;

          const transform = item.transform || [1, 0, 0, 1, 0, 0];
          const x = transform[4] || 0;
          const y = transform[5] || 0;
          const fontSize = Math.abs(transform[0]) || 12;
          const itemWidth = item.width || 0;

          // Vertical break detection
          const isNewY = lastY !== null && Math.abs(y - lastY) > (fontSize * 0.45);

          if (isNewY || item.hasEOL) {
            if (currentLineText.trim()) {
              const isHeading =
                currentLineFontSize >= 13 ||
                (currentLineText.trim().length < 60 && /^[A-Z0-9\s:–—\-#]+$/.test(currentLineText.trim()) && currentLineText.trim().length > 3);

              if (isHeading && currentLineText.trim().length < 80) {
                headings.push(currentLineText.trim());
              }

              lines.push({
                text: currentLineText.trim(),
                y: currentLineY,
                fontSize: currentLineFontSize,
                isHeading,
              });
            }
            currentLineText = '';
            currentLineY = y;
            currentLineFontSize = fontSize;
          }

          // Horizontal spacing calculation: insert space if there is a gap between items
          const xGap = (lastX !== null && lastY !== null && Math.abs(y - lastY) <= 3) ? x - (lastX + lastWidth) : 0;
          const needsSpace =
            currentLineText.length > 0 &&
            !currentLineText.endsWith(' ') &&
            !str.startsWith(' ') &&
            (xGap > fontSize * 0.15 || str.match(/^[A-Z0-9]/));

          if (needsSpace) {
            currentLineText += ' ';
          }

          currentLineText += str;
          lastX = x;
          lastY = y;
          lastWidth = itemWidth;
          lastFontSize = fontSize;
        }

        if (currentLineText.trim()) {
          const isHeading =
            currentLineFontSize >= 13 ||
            (currentLineText.trim().length < 60 && /^[A-Z0-9\s:–—\-#]+$/.test(currentLineText.trim()));

          if (isHeading && currentLineText.trim().length < 80) {
            headings.push(currentLineText.trim());
          }

          lines.push({
            text: currentLineText.trim(),
            y: currentLineY,
            fontSize: currentLineFontSize,
            isHeading,
          });
        }

        // 2. Intelligent Paragraph Assembly (prevents single-line fragmentation)
        const paragraphs: string[] = [];
        let currentParagraph = '';

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const prevLine = lines[i - 1];

          const isMajorGap = prevLine && Math.abs(prevLine.y - line.y) > (line.fontSize * 1.7);
          const isPrevHeading = prevLine?.isHeading;
          const isCurHeading = line.isHeading;

          if (isMajorGap || isPrevHeading || isCurHeading) {
            if (currentParagraph.trim()) {
              paragraphs.push(currentParagraph.trim());
            }
            currentParagraph = line.isHeading ? `### ${line.text}` : line.text;
          } else {
            // Join flowing sentences into cohesive paragraph
            if (currentParagraph.endsWith('-')) {
              currentParagraph = currentParagraph.slice(0, -1) + line.text;
            } else {
              currentParagraph += (currentParagraph ? ' ' : '') + line.text;
            }
          }
        }

        if (currentParagraph.trim()) {
          paragraphs.push(currentParagraph.trim());
        }

        let fullText = paragraphs.join('\n\n');
        fullText = this.sanitizeText(fullText);

        if (!fullText || fullText.length < 15) {
          fullText = `# Page ${pageNum}\n\n[Page ${pageNum}: Scanned diagram or visual content]`;
        }

        if (headings.length === 0) {
          const firstLine = lines.find((l) => l.text.length < 60 && !l.text.startsWith('http'))?.text || `Section ${pageNum}`;
          headings.push(firstLine.replace(/^#+\s+/, ''));
        }

        // 3. Extract Embedded Diagrams / Images from Page Operator List
        const pageImages: string[] = [];
        try {
          if (typeof document !== 'undefined') {
            const opList = await page.getOperatorList();
            const imageNames: string[] = [];
            const ops = (pdfjsLib as any).OPS;

            if (ops && opList?.fnArray) {
              for (let i = 0; i < opList.fnArray.length; i++) {
                const fn = opList.fnArray[i];
                if (fn === ops.paintImageXObject || fn === ops.paintInlineImageXObject) {
                  const imgName = opList.argsArray[i]?.[0];
                  if (imgName && !imageNames.includes(imgName)) {
                    imageNames.push(imgName);
                  }
                }
              }
            }

            // Extract up to 4 diagrams per page
            for (const imgName of imageNames.slice(0, 4)) {
              await new Promise<void>((resolve) => {
                try {
                  page.objs.get(imgName, (imgData: any) => {
                    if (imgData && imgData.width > 60 && imgData.height > 60) {
                      const canvas = document.createElement('canvas');
                      canvas.width = imgData.width;
                      canvas.height = imgData.height;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        if (imgData.data) {
                          const imgArray = new Uint8ClampedArray(imgData.data.buffer || imgData.data);
                          const imgD = new ImageData(imgArray, imgData.width, imgData.height);
                          ctx.putImageData(imgD, 0, 0);
                          pageImages.push(canvas.toDataURL('image/png'));
                        } else if (imgData.bitmap) {
                          ctx.drawImage(imgData.bitmap, 0, 0);
                          pageImages.push(canvas.toDataURL('image/png'));
                        }
                      }
                    }
                    resolve();
                  });
                } catch {
                  resolve();
                }
              });
            }
          }
        } catch {
          // ignore operator extraction errors
        }

        pages.push({
          pageNumber: pageNum,
          text: fullText,
          headings: Array.from(new Set(headings)),
          images: pageImages.length > 0 ? pageImages : undefined,
        });
      }

      if (pages.length > 0) {
        return pages;
      }
    } catch (err) {
      console.warn('PDF.js extraction failed, attempting stream parser:', err);
    }

    // 2. Fallback stream extractor
    return this.fallbackStreamExtract(arrayBuffer);
  }

  /**
   * Fallback pure client-side PDF stream parser
   */
  private static async fallbackStreamExtract(buffer: ArrayBuffer): Promise<ExtractedPDFPage[]> {
    const bytes = new Uint8Array(buffer);
    const textDecoder = new TextDecoder('latin1');
    const raw = textDecoder.decode(bytes);

    const textChunks: string[] = [];

    // Match (string) Tj
    const tjMatches = raw.match(/\(([^()]{2,})\)\s*T[jJ]/g) || [];
    for (const match of tjMatches) {
      const cleaned = match.replace(/[\(\)]/g, '').replace(/T[jJ]/g, '').trim();
      const sanitized = this.sanitizeText(cleaned);
      if (sanitized.length > 1) textChunks.push(sanitized);
    }

    // Match array strings [(part1) (part2)] TJ
    const arrayMatches = raw.match(/\[(.*?)\]\s*TJ/gi) || [];
    for (const arr of arrayMatches) {
      const innerStrings = arr.match(/\(([^()]+)\)/g) || [];
      const combined = innerStrings.map((s) => s.replace(/[\(\)]/g, '')).join(' ');
      const sanitized = this.sanitizeText(combined);
      if (sanitized.trim().length > 1) textChunks.push(sanitized.trim());
    }

    let fullText = textChunks.join(' ');

    if (fullText.length < 80) {
      const printable = raw.replace(/[^\x20-\x7E\n\r]/g, ' ');
      const words = printable
        .split(/\s+/)
        .filter((w) => w.length > 2 && !w.startsWith('/') && !w.includes('obj') && !w.includes('endobj'));
      fullText = words.join(' ');
    }

    fullText = this.sanitizeText(fullText);

    if (fullText.length < 30) {
      fullText = 'Uploaded Document content. Click "I\'m Lost" or Ask AI to explore concepts.';
    }

    // Split into ~350 word pages
    const words = fullText.split(/\s+/);
    const pages: ExtractedPDFPage[] = [];
    const pageSize = 350;

    for (let i = 0; i < words.length; i += pageSize) {
      const pageNum = Math.floor(i / pageSize) + 1;
      const pageText = words.slice(i, i + pageSize).join(' ');
      pages.push({
        pageNumber: pageNum,
        text: `# Section ${pageNum}\n\n${pageText}`,
        headings: [`Section ${pageNum}`],
      });
    }

    return pages;
  }
}
