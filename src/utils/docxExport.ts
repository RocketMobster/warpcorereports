import { Report } from "../types";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, BorderStyle, AlignmentType, ImageRun } from "docx";
// @ts-ignore
import { Canvg } from "canvg";

export async function buildDocx(report: Report) {
  const parts: Paragraph[] = [] as any;

  // Title Page
  parts.push(
    new Paragraph({
      text: report.header.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER
    })
  );
  
  parts.push(
    new Paragraph({
      text: "",
      spacing: { after: 100 }
    })
  );
  
  parts.push(new Paragraph({
    children: [
      new TextRun({
        text: "Stardate: ",
        bold: true
      }),
      new TextRun(report.header.stardate)
    ]
  }));
  
  parts.push(new Paragraph({
    children: [
      new TextRun({
        text: "Vessel: ",
        bold: true
      }),
      new TextRun(report.header.vessel)
    ]
  }));
  
  parts.push(new Paragraph({
    children: [
      new TextRun({
        text: "Prepared By: ",
        bold: true
      }),
      new TextRun(`${report.header.preparedBy.rank} ${report.header.preparedBy.name}, ${report.header.preparedBy.division}`)
    ]
  }));
  
  parts.push(new Paragraph({
    children: [
      new TextRun({
        text: "Submitted To: ",
        bold: true
      }),
      new TextRun(report.header.submittedTo)
    ],
    spacing: { after: 200 }
  }));

  // Abstract
  parts.push(new Paragraph({ 
    text: "Abstract", 
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200 }
  }));
  
  parts.push(new Paragraph({
    text: report.abstract,
    spacing: { after: 150 }
  }));

  // Global figure counter for sequential numbering
  let globalFigureCounter = 1;

  // Problems
  for (const [idx, p] of report.problems.entries()) {
    parts.push(new Paragraph({ 
      text: `Problem ${idx+1}: ${p.title}`, 
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200 }
    }));
    
    parts.push(new Paragraph({
      text: p.summary,
      spacing: { after: 150 }
    }));
    
    // Figures
    const figures = (report.figures||[]).filter(f => f.sectionAnchor === p.id);
    if (figures.length > 0) {
      parts.push(new Paragraph({ 
        text: "Figures:", 
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 150 }
      }));
      
      for (const f of figures) {
        const figureNumber = `Figure ${globalFigureCounter++}`;
        
        parts.push(
          new Paragraph({
            text: `${figureNumber}: ${f.title}`,
            heading: HeadingLevel.HEADING_4,
            spacing: { before: 150 }
          })
        );
        
        // Try to get SVG element and convert to image
        const svgElem = document.getElementById(f.id);
        if (svgElem && svgElem instanceof SVGSVGElement) {
          try {
            const svgString = new XMLSerializer().serializeToString(svgElem);
            let width = 320, height = 180;
            
            if (svgElem.viewBox && svgElem.viewBox.baseVal) {
              width = svgElem.viewBox.baseVal.width || width;
              height = svgElem.viewBox.baseVal.height || height;
            } else if (svgElem.width && svgElem.height) {
              width = Number(svgElem.width.baseVal.value) || width;
              height = Number(svgElem.height.baseVal.value) || height;
            }
            
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              try {
                // Convert SVG to PNG with timeout for safety
                const pngData = await Promise.race([
                  (async () => {
                    const v = await Canvg.fromString(ctx, svgString);
                    await v.render();
                    return canvas.toDataURL("image/png");
                  })(),
                  new Promise<string>((_, reject) => 
                    setTimeout(() => reject(new Error("Chart conversion timed out")), 5000)
                  )
                ]);
                
                // Add image to document
                const imageRun = new ImageRun({
                  data: pngData.split(',')[1],
                  transformation: {
                    width: width * 0.75,
                    height: height * 0.75
                  }
                });
                
                parts.push(
                  new Paragraph({
                    children: [imageRun],
                    spacing: { after: 120 }
                  })
                );
              } catch (conversionError) {
                console.error("Error converting chart to image:", conversionError);
                parts.push(
                  new Paragraph({
                    text: "⚠️ Chart unavailable - Conversion error",
                    spacing: { after: 120 }
                  })
                );
              }
            } else {
              parts.push(
                new Paragraph({
                  text: "⚠️ Chart unavailable - Canvas context unavailable",
                  spacing: { after: 120 }
                })
              );
            }
          } catch (error) {
            console.error("Error processing SVG element:", error);
            parts.push(
              new Paragraph({
                text: "⚠️ Chart unavailable - SVG processing error",
                spacing: { after: 120 }
              })
            );
          }
        } else {
          console.warn(`Chart element with ID ${f.id} not found or not an SVG element`);
          parts.push(
            new Paragraph({
              text: "⚠️ Chart unavailable - Element not found",
              spacing: { after: 120 }
            })
          );
        }
        
        parts.push(
          new Paragraph({
            text: f.caption,
            spacing: { after: 150 }
          })
        );
      }
    }
  }

  // Conclusion
  parts.push(new Paragraph({ 
    text: "Conclusion", 
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200 }
  }));
  
  parts.push(new Paragraph({
    text: report.conclusion,
    spacing: { after: 150 }
  }));

  // Crew Manifest
  if (report.crewManifest && report.crewManifest.length) {
    parts.push(new Paragraph({ 
      text: "Crew Manifest (Mentioned)", 
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200 }
    }));
    
    report.crewManifest.forEach(cm => 
      parts.push(
        new Paragraph({
          text: `• ${cm.rank} ${cm.name}, ${cm.role}`,
          spacing: { after: 80 }
        })
      )
    );
  }

  // References
  parts.push(new Paragraph({ 
    text: "References", 
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200 }
  }));
  
  report.references.forEach(r => {
    // Extract just the reference text without the number at the beginning
    let refText = r.text;
    if (refText.match(/^\[\d+\]/)) {
      refText = refText.replace(/^\[\d+\]\s*/, "");
    }
    
    parts.push(
      new Paragraph({
        text: `[${r.id}] ${refText}`,
        spacing: { after: 80 }
      })
    );
  });

  const doc = new Document({ 
    sections: [{ 
      properties: {}, 
      children: parts as any 
    }] 
  });
  
  return Packer.toBlob(doc);
}
