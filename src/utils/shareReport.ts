import { Report } from "../types";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import { buildDocx } from "./docxExport";
import { reportToTxt } from "./reportGen";
// @ts-ignore
import { Canvg } from "canvg";

// Types for sharing options
export interface ShareOptions {
  format: "link" | "email";
  includeFormat?: "pdf" | "docx" | "txt" | null;
  emailAddress?: string;
  emailSubject?: string;
}

/**
 * Generate a shareable link for the report
 * This simulates creating a shareable link - in a real app, 
 * this would save the report to a server and return a unique URL
 */
export const generateShareableLink = async (report: Report, format?: "pdf" | "docx" | "txt" | null): Promise<string> => {
  // In a real application, this would make an API call to store the report
  // and return a unique URL that could be used to access it
  
  // Get the base URL including any base path (important for GitHub Pages)
  const baseUrl = window.location.origin;
  
  // Detect if we're running on GitHub Pages by checking the hostname
  const isGitHubPages = window.location.hostname.includes('github.io');
  // Add the repository name as base path if on GitHub Pages
  const basePath = isGitHubPages ? '/warpcorereports' : '';
  
  // Extract key data to recreate the report
  // Include enough details to generate a similar report but not all data
  const reportData = {
    title: report.header.title,
    stardate: report.header.stardate,
    vessel: report.header.vessel,
    preparedBy: `${report.header.preparedBy.rank} ${report.header.preparedBy.name}`,
    problemCount: report.problems.length,
    originalSeed: report.originalSeed || "" // Store the original seed if available
  };
  
  // Serialize and encode the data
  const reportDataStr = JSON.stringify(reportData);
  const reportId = btoa(reportDataStr).replace(/=/g, '');
  
  // Create a shareable URL with the report ID, including the base path
  const shareUrl = `${baseUrl}${basePath}/#/shared-report/${reportId}`;
  
  // If a specific format is requested, attach it to the URL
  const fullUrl = format ? `${shareUrl}?format=${format}` : shareUrl;
  
  // Copy to clipboard
  try {
    await navigator.clipboard.writeText(fullUrl);
    console.log('Share link copied to clipboard:', fullUrl);
  } catch (err) {
    console.error('Failed to copy link to clipboard', err);
  }
  
  return fullUrl;
};

/**
 * Share report via email
 * Uses the browser's mailto: functionality to open the default email client
 */
export const shareViaEmail = async (
  report: Report, 
  emailAddress: string, 
  subject?: string,
  format?: "pdf" | "docx" | "txt" | null
): Promise<boolean> => {
  // Create email subject using vessel name from report
  const emailSubject = subject || `Starfleet Engineering Report - ${report.header.vessel}`;
  
  // Create a more comprehensive email body with report details
  let emailBody = `
STARFLEET ENGINEERING REPORT
===========================
Title: ${report.header.title}
Stardate: ${report.header.stardate}
Vessel: ${report.header.vessel}
Prepared By: ${report.header.preparedBy.rank} ${report.header.preparedBy.name}, ${report.header.preparedBy.division}
Submitted To: ${report.header.submittedTo}

ABSTRACT
--------
${report.abstract}

PROBLEMS SUMMARY
---------------
${report.problems.map((p, i) => `${i+1}. ${p.title}`).join('\\n')}

CONCLUSION
---------
${report.conclusion}

`;

  // Add crew manifest if available
  if (report.crewManifest && report.crewManifest.length > 0) {
    emailBody += `
CREW MANIFEST (MENTIONED)
------------------------
${report.crewManifest.map(cm => `- ${cm.rank} ${cm.name}, ${cm.role}`).join('\\n')}
`;
  }

  // Add note about file attachment
  if (format && format !== null) {
    emailBody += `
NOTE: A ${format?.toUpperCase()} file has been downloaded to your computer. 
IMPORTANT: You must manually attach this file to this email before sending.
`;
  }

  // Encode the body for mailto link
  const encodedBody = encodeURIComponent(emailBody);
  const encodedSubject = encodeURIComponent(emailSubject);
  
  // Create the mailto link
  const mailtoLink = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;
  
  try {
    // Create a temporary anchor element to bypass potential security restrictions
    const tempLink = document.createElement('a');
    tempLink.href = mailtoLink;
    tempLink.style.display = 'none';
    document.body.appendChild(tempLink);
    
    // Try to open the email client
    tempLink.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(tempLink);
    }, 100);
    
    // As a fallback, also try the traditional method
    setTimeout(() => {
      window.location.href = mailtoLink;
    }, 200);
    
    // Return true to indicate that we tried to open the email client
    return true;
  } catch (error) {
    console.error("Error opening email client:", error);
    // Return false to indicate that opening the email client failed
    return false;
  }
};

/**
 * Main function to share a report based on specified options
 */
export const shareReport = async (report: Report, options: ShareOptions): Promise<string | boolean | void> => {
  if (options.format === "link") {
    return generateShareableLink(report, options.includeFormat);
  } else if (options.format === "email" && options.emailAddress) {
    try {
      // First generate and download the file attachment if requested
      if (options.includeFormat && options.includeFormat !== null) {
        // Only generate the file once
        if (options.includeFormat === "pdf") {
          await generatePdfForShare(report);
        } else if (options.includeFormat === "docx") {
          await generateDocxForShare(report);
        } else if (options.includeFormat === "txt") {
          await generateTxtForShare(report);
        }
      }
      
      // Then open the email client
      const emailSuccess = await shareViaEmail(
        report, 
        options.emailAddress, 
        options.emailSubject,
        options.includeFormat
      );
      
      // Return whether the email client was opened successfully
      return emailSuccess;
    } catch (error) {
      console.error("Error sharing report via email:", error);
      throw error;
    }
  }
  
  throw new Error("Invalid share options provided");
};

// Helper functions to generate different formats for sharing
const generatePdfForShare = async (report: Report): Promise<void> => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let yPos = 48;
  const actions: Array<() => Promise<void>> = [];

  actions.push(async () => {
    doc.setFontSize(18);
    doc.text(report.header.title, 48, yPos);
    yPos += 32;
  });
  
  actions.push(async () => {
    doc.setFontSize(12);
    doc.text(`Stardate: ${report.header.stardate}`, 48, yPos);
    yPos += 20;
    doc.text(`Vessel: ${report.header.vessel}`, 48, yPos);
    yPos += 20;
    doc.text(`Prepared By: ${report.header.preparedBy.rank} ${report.header.preparedBy.name}, Engineering`, 48, yPos);
    yPos += 20;
    doc.text(`Submitted To: ${report.header.submittedTo}`, 48, yPos);
    yPos += 20;
  });
  
  actions.push(async () => {
    doc.setFontSize(14);
    doc.text("Abstract", 48, yPos);
    yPos += 20;
    doc.setFontSize(10);
    const abstractLines = doc.splitTextToSize(report.abstract, 500);
    doc.text(abstractLines, 48, yPos);
    yPos += abstractLines.length * 12;
  });
  
  if (report.problems) {
    // Create a counter for sequential figure numbering
    let figureCounter = 1;
    
    report.problems.forEach((p, i) => {
      actions.push(async () => {
        yPos += 30;
        doc.setFontSize(14);
        if (yPos > 700) { doc.addPage(); yPos = 48; }
        doc.text(`Problem ${i+1}: ${p.title}`, 48, yPos);
        yPos += 20;
        doc.setFontSize(10);
        const problemLines = doc.splitTextToSize(p.summary, 500);
        if (yPos + problemLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
        doc.text(problemLines, 48, yPos);
        yPos += problemLines.length * 12;
      });
      
      const figs = (report.figures || []).filter(f => f.sectionAnchor === p.id);
      if (figs.length) {
        actions.push(async () => {
          yPos += 20;
          if (yPos > 700) { doc.addPage(); yPos = 48; }
          doc.text("Figures:", 48, yPos);
        });
        
        figs.forEach(f => {
          // Create a figure number for the PDF
          const figureNumber = `Figure ${figureCounter++}`;
          
          actions.push(async () => {
            yPos += 15;
            const captionText = `- ${figureNumber}: ${f.title} — ${f.caption}`;
            const captionLines = doc.splitTextToSize(captionText, 420);
            if (yPos + captionLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
            doc.text(captionLines, 60, yPos);
            yPos += captionLines.length * 12;
            
            const svgElem = document.getElementById(f.id);
            let width = 320, height = 180;
            if (svgElem && svgElem instanceof SVGSVGElement) {
              try {
                const svgString = new XMLSerializer().serializeToString(svgElem);
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
                  const v = await Canvg.fromString(ctx, svgString);
                  await v.render();
                  const pngData = canvas.toDataURL("image/png");
                  
                  if (yPos + height + 10 > 700) { doc.addPage(); yPos = 48; }
                  doc.addImage(pngData, "PNG", 60, yPos + 10, width, height);
                  yPos += height + 10;
                } else {
                  yPos += 30;
                    doc.setTextColor(255, 179, 0); // Amber color
                    doc.text("⚠️ Chart unavailable - Contact the author", 60, yPos);
                }
              } catch (e) {
                yPos += 30;
                  doc.setTextColor(255, 179, 0); // Amber color
                  doc.text("⚠️ Chart unavailable - Contact the author", 60, yPos);
              }
            } else {
              yPos += 30;
                doc.setTextColor(255, 179, 0); // Amber color
                doc.text("⚠️ Chart unavailable - Contact the author", 60, yPos);
            }
          });
        });
      }
    });
  }
  
  actions.push(async () => {
    yPos += 30;
    doc.setFontSize(14);
    doc.text("Conclusion", 48, yPos);
    yPos += 20;
    doc.setFontSize(10);
    const conclusionLines = doc.splitTextToSize(report.conclusion, 500);
    doc.text(conclusionLines, 48, yPos);
    yPos += conclusionLines.length * 12;
  });
  
  if (report.crewManifest && report.crewManifest.length) {
    actions.push(async () => {
      yPos += 30;
      doc.setFontSize(14);
      doc.text("Crew Manifest (Mentioned)", 48, yPos);
      doc.setFontSize(10);
      report.crewManifest?.forEach(cm => {
        yPos += 15;
        doc.text(`- ${cm.rank} ${cm.name}, ${cm.role}`, 48, yPos);
      });
    });
  }
  
  actions.push(async () => {
    yPos += 30;
    doc.setFontSize(14);
    if (yPos > 700) { doc.addPage(); yPos = 48; }
    doc.text("References", 48, yPos);
    doc.setFontSize(10);
    report.references.forEach((r, idx) => {
      let cleanText = r.text.replace(/^\[\d+\]\s*/, "");
      const refText = `[${idx + 1}] ${cleanText}`;
      const refLines = doc.splitTextToSize(refText, 420);
      if (yPos + refLines.length * 12 > 700) { doc.addPage(); yPos = 48; }
      doc.text(refLines, 48, yPos);
      yPos += refLines.length * 12;
    });
  });
  
  for (const act of actions) {
    await act();
  }
  
  // Create a filename with the vessel name and stardate
  const safeVesselName = report.header.vessel.replace(/\s+/g, '_');
  const safeStardate = report.header.stardate.replace(/\./g, '-');
  const filename = `Starfleet_Engineering_Report_${safeVesselName}_SD${safeStardate}.pdf`;
  
  doc.save(filename);
};

const generateDocxForShare = async (report: Report): Promise<void> => {
  const doc = await buildDocx(report);
  
  // Create a filename with the vessel name and stardate
  const safeVesselName = report.header.vessel.replace(/\s+/g, '_');
  const safeStardate = report.header.stardate.replace(/\./g, '-');
  const filename = `Starfleet_Engineering_Report_${safeVesselName}_SD${safeStardate}.docx`;
  
  saveAs(doc, filename);
};

const generateTxtForShare = async (report: Report): Promise<void> => {
  const txt = reportToTxt(report);
  const blob = new Blob([txt], { type: "text/plain" });
  
  // Create a filename with the vessel name and stardate
  const safeVesselName = report.header.vessel.replace(/\s+/g, '_');
  const safeStardate = report.header.stardate.replace(/\./g, '-');
  const filename = `Starfleet_Engineering_Report_${safeVesselName}_SD${safeStardate}.txt`;
  
  saveAs(blob, filename);
};
