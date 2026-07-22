import { TranslationItem } from '../types';
import type { Paragraph } from 'docx';

export async function exportToJSON(history: TranslationItem[], fileName = 'MV_English_Learning_History.json'): Promise<void> {
  const { saveAs } = await import('file-saver');
  const jsonStr = JSON.stringify(history, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  saveAs(blob, fileName);
}

export async function exportToTXT(history: TranslationItem[], fileName = 'MV_English_Learning_History.txt'): Promise<void> {
  const { saveAs } = await import('file-saver');
  let content = `========================================================\n`;
  content += `       MV LIVE TRANSLATOR & LEARNING HUB HISTORY        \n`;
  content += `========================================================\n`;
  content += `Export Date: ${new Date().toLocaleString()}\n`;
  content += `Total Recorded Lessons & Translations: ${history.length}\n`;
  content += `Languages: Telugu (te-IN) ↔ English (en-US)\n\n`;

  history.forEach((item, index) => {
    const srcLangLabel = item.sourceLang === 'te-IN' ? 'Telugu' : 'English';
    const tgtLangLabel = item.targetLang === 'te-IN' ? 'Telugu' : 'English';
    
    content += `[${index + 1}] Time: ${item.timestamp} | Accuracy/Confidence: ${item.confidence}%\n`;
    content += `Original (${srcLangLabel}): ${item.sourceText}\n`;
    content += `Translation (${tgtLangLabel}): ${item.translatedText}\n`;
    if (item.studentAnalysis?.phonetic) {
      content += `Pronunciation Guide: ${item.studentAnalysis.phonetic}\n`;
    }
    if (item.grammarCorrection) {
      content += `Grammar Fix: ${item.grammarCorrection.correctedText}\n`;
      content += `Grammar Explanation: ${item.grammarCorrection.explanation}\n`;
    }
    if (item.studentAnalysis?.grammarTip) {
      content += `Learning Tip: ${item.studentAnalysis.grammarTip}\n`;
    }
    content += `--------------------------------------------------------\n\n`;
  });

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, fileName);
}

export async function exportToPDF(history: TranslationItem[], fileName = 'MV_English_Learning_History.pdf'): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF();

  // Header Styling
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text("MV Live English Learning & Translation History", 14, 18);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()} | Total Items: ${history.length}`, 14, 25);

  let yPos = 40;

  history.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const srcLangLabel = item.sourceLang === 'te-IN' ? 'Telugu' : 'English';
    const tgtLangLabel = item.targetLang === 'te-IN' ? 'Telugu' : 'English';

    // Box border
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, yPos, 182, 38, 3, 3, 'FD');

    // Box Header
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(10);
    doc.text(`#${index + 1} | Time: ${item.timestamp} | Accuracy: ${item.confidence}%`, 18, yPos + 7);

    // Source Text
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`${srcLangLabel}: ${item.sourceText.slice(0, 75)}`, 18, yPos + 16);

    // Translated Text
    doc.setTextColor(16, 185, 129);
    doc.text(`${tgtLangLabel}: ${item.translatedText.slice(0, 75)}`, 18, yPos + 25);

    if (item.grammarCorrection) {
      doc.setTextColor(217, 119, 6);
      doc.text(`Grammar Fix: ${item.grammarCorrection.correctedText.slice(0, 70)}`, 18, yPos + 33);
    }

    yPos += 44;
  });

  doc.save(fileName);
}

export async function exportToDOCX(history: TranslationItem[], fileName = 'MV_English_Learning_History.docx'): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
  const { saveAs } = await import('file-saver');

  const paragraphs: Paragraph[] = [
    new Paragraph({
      text: "MV Live Translator & English Learning History",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 }
    }),
    new Paragraph({
      text: `Export Date: ${new Date().toLocaleString()} | Total Items: ${history.length}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  ];

  history.forEach((item, index) => {
    const srcLangLabel = item.sourceLang === 'te-IN' ? 'Telugu' : 'English';
    const tgtLangLabel = item.targetLang === 'te-IN' ? 'Telugu' : 'English';

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `[Item #${index + 1}] `, bold: true, color: "4F46E5" }),
          new TextRun({ text: `Timestamp: ${item.timestamp} | Accuracy: ${item.confidence}%`, italics: true, color: "64748B" })
        ],
        spacing: { before: 200, after: 100 }
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${srcLangLabel} (Original): `, bold: true }),
          new TextRun({ text: item.sourceText })
        ]
      }),
      new Paragraph({
        children: [
          new TextRun({ text: `${tgtLangLabel} (Translation): `, bold: true, color: "059669" }),
          new TextRun({ text: item.translatedText, bold: true })
        ],
        spacing: { after: 100 }
      })
    );

    if (item.grammarCorrection) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({ text: `Grammar Correction: `, bold: true, color: "D97706" }),
            new TextRun({ text: item.grammarCorrection.correctedText })
          ],
          spacing: { after: 200 }
        })
      );
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
