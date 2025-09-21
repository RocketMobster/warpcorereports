import React, { useEffect, useRef } from "react";

export default function HelpPanel({ onClose, target }: { onClose: () => void, target?: "templates"|"figure-bias"|"presets"|"produce-reroll"|"references"|"crew-size" }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const sectionRefs = {
    'produce-reroll': useRef<HTMLDivElement>(null),
    'presets': useRef<HTMLDivElement>(null),
    'templates': useRef<HTMLDivElement>(null),
    'figure-bias': useRef<HTMLDivElement>(null),
    'references': useRef<HTMLDivElement>(null),
    'crew-size': useRef<HTMLDivElement>(null)
  } as const;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    // Focus the close button for accessibility
    setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current) onClose();
  };

  useEffect(() => {
    if (!target) return;
    // Scroll the requested section into view after mount
    setTimeout(() => {
      const el = sectionRefs[target]?.current;
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [target]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-title"
      onClick={onBackdropClick}
    >
      <div className="w-full max-w-3xl lcars-card shadow-2xl max-h-[85vh] overflow-hidden" onClick={(e)=>e.stopPropagation()}>
        <div className="lcars-rail lcars-rail-alt"></div>
        <div className="lcars-body flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between flex-none">
            <h2 id="help-title" className="text-lg font-bold">Help & Usage</h2>
            <button ref={closeBtnRef} onClick={onClose} className="lcars-btn" aria-label="Close help">Close</button>
          </div>
          <div className="space-y-3 pr-2 mt-2 overflow-y-auto flex-1 min-h-0">
          <div ref={sectionRefs['produce-reroll']}>
            <div className="lcars-label">Produce vs Reroll</div>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><strong>Produce Report</strong>: Applies the controls above to create a new report. The Seed field (or lock) is respected.</li>
              <li><strong>Reroll Current Report</strong>: Creates a new variation of the currently displayed report by generating a fresh seed and stardate while preserving that report’s settings.</li>
              <li><strong>Reroll changes</strong>: Randomized content only — problem topics/summaries, chart data, references selection, and other generated text.</li>
              <li><strong>Reroll preserves</strong>: All settings used in the displayed report, including counts, detail level, graphs toggle/count, <em>Mission Template</em>, figure bias, vessel, signatory info, humor level, and the “Add Name to References” choice.</li>
              <li><strong>Seed lock nuance</strong>: The lock applies to Produce. Reroll always uses a fresh seed, regardless of the Seed control.</li>
            </ul>
          </div>
          <div ref={sectionRefs['presets']}>
            <div className="lcars-label">Presets</div>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><strong>What they do</strong>: Quickly set counts, detail level, graphs on/off and count, humor, and figure bias to a curated combination.</li>
              <li><strong>Customizable</strong>: You can tweak any control after choosing a preset; the badge will show “Modified”.</li>
              <li><strong>Persistence</strong>: The last chosen preset state is remembered locally.</li>
            </ul>
          </div>
          <div ref={sectionRefs['templates']}>
            <div className="lcars-label">Mission Templates</div>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><strong>Purpose</strong>: Bias the content domain without changing your numeric controls.</li>
              <li><strong>Incident</strong>: Favors systems like Deflector, Shields, EPS, SIF, and Transporters; chart types skew to status/impact (bar, gauge, step, etc.).</li>
              <li><strong>Survey</strong>: Favors Sensors, Subspace comms, Bussard Collectors, etc.; charts skew to trends/distributions (line, scatter, heatmap, pie, radar).</li>
              <li><strong>Reroll behavior</strong>: Reroll keeps the chosen template for the current report.</li>
              <li><strong>Shareable settings</strong>: The settings link encodes the template as well.</li>
              <li><strong>Also affects</strong>: Header recipients (To/CC/Submitted To), narrative tone in Abstract/Conclusion, figure captions, and reference sources are gently biased by the template.</li>
            </ul>
          </div>
          <div ref={sectionRefs['crew-size']}>
            <div className="lcars-label">Crew Size Controls</div>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><strong>Grow/Shrink</strong>: Use the Crew Size control to increase or decrease the number of crew entries. Order is preserved.</li>
              <li><strong>Locked Preservation</strong>: Locked members are never removed or regenerated. Shrinking below the number of locked members is clamped.</li>
              <li><strong>Coverage Enforcement</strong>: The panel ensures at least one of Command, Operations, Medical, Security, and Science is present where possible (unlocked members only).</li>
              <li><strong>Regenerate vs Apply</strong>: Apply changes the list size. Regenerate re-fills only unlocked slots without changing the target size.</li>
              <li><strong>Persistence</strong>: Your crew and locks are saved locally so they stick around between sessions.</li>
            </ul>
          </div>
          <div ref={sectionRefs['references']}>
            <div className="lcars-label">References & Canon Names</div>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li><strong>Signatory</strong>: Enable “Add Name to References” to guarantee a signing engineer entry.</li>
              <li><strong>Canon names</strong>: Toggle “Allow Canon Names in References” to occasionally include famous Star Trek names — curated for plausible ranks/titles.</li>
              <li><strong>Era filter</strong>: Enable “Filter Canon Names by Era” to only include canon names active during the vessel’s timeframe.</li>
              <li><strong>Frequency</strong>: Use “Famous Author Frequency” to choose Off / Rare / Occasional / Frequent appearance rates. Humor and template can nudge frequency slightly.</li>
              <li><strong>Rotation memory</strong>: “Famous Rotation Memory” avoids reusing recently seen famous names (default 6). Set to 0 to disable.</li>
              <li><strong>One-per-entry</strong>: At most one famous author appears in a single reference entry.</li>
              <li><strong>Good defaults</strong>: Canon names allowed; era filter on; frequency "Occasional"; rotation memory 6.</li>
              <li><strong>Share links</strong>: Settings links encode these as <code>cn</code>, <code>ce</code>, <code>ff</code>, and <code>fm</code>.</li>
            </ul>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
