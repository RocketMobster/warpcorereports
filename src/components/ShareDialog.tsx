import React, { useState } from "react";
import { Report } from "../types";
import { shareReport, ShareOptions } from "../utils/shareReport";

interface ShareDialogProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareDialog({ report, isOpen, onClose }: ShareDialogProps) {
  const [shareMethod, setShareMethod] = useState<"link" | "email">("link");
  const [includeFormat, setIncludeFormat] = useState<"pdf" | "docx" | "txt" | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState(`Starfleet Engineering Report: ${report.header.title}`);
  const [shareLink, setShareLink] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareComplete, setShareComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleShare = async (explicitFormat?: "pdf" | "docx" | "txt") => {
    // Prevent double-clicks
    if (isSharing) return;
    
    setIsSharing(true);
    setShareComplete(false);
    setShareLink("");
    setErrorMessage(null);
    
    try {
      // If an explicit format is provided, use it (for the format switching buttons)
      const formatToUse = explicitFormat || includeFormat;
      
      const options: ShareOptions = {
        format: shareMethod,
        includeFormat: formatToUse,
        emailAddress: emailAddress,
        emailSubject: emailSubject
      };
      
      // For email sharing, first generate and download the file if a format is selected
      if (shareMethod === "email" && options.includeFormat) {
        console.log(`Generating ${options.includeFormat} file for email sharing...`);
        
        try {
          // Directly generate the file based on selected format
          if (options.includeFormat === "pdf") {
            await shareReport(report, { 
              ...options, 
              includeFormat: "pdf",
              format: "email" // Force email format to ensure file generation
            });
          } else if (options.includeFormat === "docx") {
            try {
              await shareReport(report, { 
                ...options, 
                includeFormat: "docx",
                format: "email" // Force email format to ensure file generation
              });
              console.log("DOCX file generated successfully");
            } catch (docxError) {
              console.error("Error generating DOCX file:", docxError);
              setErrorMessage(`Error generating DOCX file. A simplified version without charts has been created instead.`);
              // We don't throw here because we still want the user to be able to proceed with the simplified version
            }
          } else if (options.includeFormat === "txt") {
            await shareReport(report, { 
              ...options, 
              includeFormat: "txt",
              format: "email" // Force email format to ensure file generation
            });
          }
          
          console.log(`${options.includeFormat.toUpperCase()} file generated successfully`);
          setShareComplete(true);
          
        } catch (fileError) {
          console.error(`Error generating ${options.includeFormat} file:`, fileError);
          setErrorMessage(`Error generating ${options.includeFormat.toUpperCase()} file. Please try again.`);
        }
      } else if (shareMethod === "link") {
        // For link sharing, generate the URL
        const result = await shareReport(report, options);
        
        if (typeof result === "string") {
          setShareLink(result);
          setShareComplete(true);
        }
      }
      
      // Update the state to match what was actually used
      if (explicitFormat) {
        setIncludeFormat(explicitFormat);
      }
      
    } catch (error) {
      console.error("Error sharing report:", error);
      setErrorMessage("There was an error sharing your report. Please try again.");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy link:", err);
      alert("Unable to copy link. Please select and copy it manually.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-[#12182c] rounded-2xl border border-amber-500 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-amber-400 mb-4">Share Report</h2>
        
        <div className="mb-4">
          <label className="block text-amber-300 mb-2">Share Method</label>
          <div className="flex gap-4">
            <button 
              className={`px-4 py-2 rounded-lg ${shareMethod === "link" ? "bg-amber-500 text-black font-bold" : "bg-slate-700 text-white"}`}
              onClick={() => setShareMethod("link")}
              disabled={isSharing}
            >
              Generate Link
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${shareMethod === "email" ? "bg-amber-500 text-black font-bold" : "bg-slate-700 text-white"}`}
              onClick={() => setShareMethod("email")}
              disabled={isSharing}
            >
              Email Report
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-amber-300 mb-2">Include Format (Optional)</label>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1 rounded-lg ${includeFormat === "pdf" ? "bg-amber-500 text-black font-bold" : "bg-slate-700 text-white"}`}
              onClick={() => setIncludeFormat(includeFormat === "pdf" ? null : "pdf")}
              disabled={isSharing}
            >
              PDF
            </button>
            <button 
              className={`px-3 py-1 rounded-lg ${includeFormat === "docx" ? "bg-amber-500 text-black font-bold" : "bg-slate-700 text-white"}`}
              onClick={() => setIncludeFormat(includeFormat === "docx" ? null : "docx")}
              disabled={isSharing}
            >
              DOCX
            </button>
            <button 
              className={`px-3 py-1 rounded-lg ${includeFormat === "txt" ? "bg-amber-500 text-black font-bold" : "bg-slate-700 text-white"}`}
              onClick={() => setIncludeFormat(includeFormat === "txt" ? null : "txt")}
              disabled={isSharing}
            >
              TXT
            </button>
          </div>
          
          {includeFormat && shareMethod === "email" && (
            <div className="mt-2 text-yellow-300 text-sm p-2 bg-slate-800 rounded-lg">
              <p><strong>Note:</strong> Browser security prevents automatic file attachments.</p>
              <p>A {includeFormat.toUpperCase()} file will be downloaded first, then you'll need to manually attach it to the email.</p>
            </div>
          )}
        </div>
        
        {shareMethod === "email" && (
          <>
            <div className="mb-4">
              <label className="block text-amber-300 mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="recipient@example.com"
                disabled={isSharing}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-amber-300 mb-2">Subject</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                disabled={isSharing}
              />
            </div>
            
            {shareComplete && (
              <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-green-600">
                <p className="text-green-400 font-bold mb-2">✓ Report file downloaded successfully</p>
                
                <div className="bg-slate-700 rounded p-3 mb-4">
                  <p className="text-amber-300 text-sm font-bold mb-2">Need a different format?</p>
                  <div className="flex gap-2 mb-1">
                    <button
                      onClick={() => {
                        setIncludeFormat("pdf");
                        setShareComplete(false);
                        handleShare("pdf");
                      }}
                      className={`flex-1 py-1 px-2 text-xs rounded ${includeFormat === "pdf" ? "bg-amber-500 text-black font-bold" : "bg-slate-600 text-white"}`}
                    >
                      Generate PDF
                    </button>
                    <button
                      onClick={() => {
                        setIncludeFormat("docx");
                        setShareComplete(false);
                        handleShare("docx");
                      }}
                      className={`flex-1 py-1 px-2 text-xs rounded ${includeFormat === "docx" ? "bg-amber-500 text-black font-bold" : "bg-slate-600 text-white"}`}
                    >
                      Generate DOCX
                    </button>
                    <button
                      onClick={() => {
                        setIncludeFormat("txt");
                        setShareComplete(false);
                        handleShare("txt");
                      }}
                      className={`flex-1 py-1 px-2 text-xs rounded ${includeFormat === "txt" ? "bg-amber-500 text-black font-bold" : "bg-slate-600 text-white"}`}
                    >
                      Generate TXT
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">Click any of the buttons above to generate a different file format</p>
                </div>
                
                <p className="text-white text-sm mb-3">
                  Click the button below to open your email client:
                </p>
                
                <button 
                  onClick={() => {
                    // Generate the email body
                    const emailBody = `
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
${report.problems.map((p, i) => `${i+1}. ${p.title}`).join('\n')}

CONCLUSION
---------
${report.conclusion}

NOTE: Please attach the downloaded ${includeFormat?.toUpperCase()} file to this email before sending.
`;
                    
                    const encodedBody = encodeURIComponent(emailBody);
                    const encodedSubject = encodeURIComponent(`Starfleet Engineering Report - ${report.header.vessel}`);
                    const mailtoLink = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;
                    
                    // Use window.open instead of window.location.href for better compatibility
                    try {
                      console.log("Opening email client with link:", mailtoLink);
                      const mailWindow = window.open(mailtoLink, "_blank");
                      
                      // Fall back if window.open fails (e.g., due to popup blockers)
                      if (!mailWindow) {
                        console.warn("Failed to open mail client in new window - falling back to current window");
                        window.location.href = mailtoLink;
                      }
                    } catch (error) {
                      console.error("Error opening email client:", error);
                      alert("There was an error opening your email client. Please try a different browser or create an email manually.");
                    }
                  }}
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg font-bold w-full mb-3 hover:bg-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                  </svg>
                  Open Email Client
                </button>
                
                <div className="text-xs text-slate-300">
                  <div className="flex gap-2 items-center mb-1">
                    <span className="font-bold text-amber-400">To:</span> 
                    <span>{emailAddress}</span>
                  </div>
                  <div className="flex gap-2 items-center mb-3">
                    <span className="font-bold text-amber-400">Subject:</span> 
                    <span>Starfleet Engineering Report - {report.header.vessel}</span>
                  </div>
                  
                  <ol className="list-decimal pl-5 space-y-1 text-slate-300">
                    <li>Wait for the file to finish downloading</li>
                    <li>Click the "Open Email Client" button above</li>
                    <li>Manually attach the downloaded file to your email</li>
                    <li>Send the email</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
        
        {shareMethod === "link" && shareComplete && shareLink && (
          <div className="mb-4">
            <label className="block text-amber-300 mb-2">Shareable Link</label>
            <div className="flex">
              <input 
                type="text"
                readOnly
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-l-lg border border-slate-600"
                value={shareLink}
              />
              <button 
                className="bg-amber-500 text-black font-bold px-3 py-2 rounded-r-lg"
                onClick={handleCopyLink}
              >
                Copy
              </button>
            </div>
            <p className="text-green-400 mt-2 text-sm">Link copied to clipboard!</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">
            <p>{errorMessage}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-4 mt-6">
          <button 
            className="px-4 py-2 bg-slate-700 text-white rounded-lg"
            onClick={onClose}
            disabled={isSharing}
          >
            Close
          </button>
          
          <button 
            className={`px-4 py-2 ${isSharing ? "bg-gray-500" : "bg-amber-500 text-black font-bold"} rounded-lg`}
            onClick={() => handleShare()}
            disabled={isSharing || (shareMethod === "email" && !emailAddress)}
          >
            {isSharing ? "Processing..." : "Share Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
