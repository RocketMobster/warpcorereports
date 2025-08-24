import React from "react";
import { Figure } from "../types";

// LCARS color palette
const LCARS_COLORS = ["#FFB300", "#FF6F00", "#00BFFF", "#B39DDB", "#F44336", "#00C853", "#212121"];

// Helper to pick LCARS color
function lcarsColor(idx: number) {
  return LCARS_COLORS[idx % LCARS_COLORS.length];
}

// Main LCARSChart component
export default function LCARSChart({ figure, width = 320, height = 180 }: { figure: Figure; width?: number; height?: number }) {
  // Error state
  const [isError, setIsError] = React.useState(false);
  
  // Tooltip state
  const [hovered, setHovered] = React.useState<{ idx: number; x: number; y: number; value?: any; label?: string } | null>(null);

  // Try to render the chart, and catch any errors
  React.useEffect(() => {
    try {
      // Just checking if data is valid
      if (!figure?.data) {
        setIsError(true);
      } else {
        setIsError(false);
      }
    } catch (error) {
      console.error("Error in chart initialization:", error);
      setIsError(true);
    }
  }, [figure]);

  // Tooltip rendering (keeps tooltip inside SVG area)
  const renderTooltip = () => {
    if (!hovered) return null;
    const tooltipWidth = 140;
    const tooltipHeight = 60;
    let x = hovered.x + 10;
    let y = hovered.y - tooltipHeight - 10;
    // Prevent overflow right
    if (x + tooltipWidth > width) x = width - tooltipWidth - 8;
    // Prevent overflow left
    if (x < 0) x = 8;
    // Prevent overflow top
    if (y < 0) y = 8;
    // Prevent overflow bottom
    if (y + tooltipHeight > height) y = height - tooltipHeight - 8;
    // If still too close to bottom, show above point
    if (hovered.y + 10 + tooltipHeight > height) y = hovered.y - tooltipHeight - 10;
    // If still too close to top, show below point
    if (y < 0) y = hovered.y + 10;
    return (
      <foreignObject x={x} y={y} width={tooltipWidth} height={tooltipHeight} style={{ pointerEvents: 'none' }}>
        <div style={{ background: '#222', color: '#FFB300', border: '1px solid #FFB300', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontWeight: 'bold', boxShadow: '0 2px 8px #000', opacity: 0.97, minHeight: 40 }}>
          {hovered.label ? <div>{hovered.label}</div> : null}
          <div>Value: {hovered.value}</div>
        </div>
      </foreignObject>
    );
  };
  // If there's an error, render the warning triangle
  if (isError) {
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        <g>
          {/* Caution triangle */}
          <path 
            d="M 160,50 L 240,180 L 80,180 Z" 
            fill="#FFB300" 
            stroke="#FF8C00" 
            strokeWidth="2"
          >
            <animate 
              attributeName="opacity" 
              values="0.8;1;0.8" 
              dur="2s" 
              repeatCount="indefinite" 
            />
          </path>
          <text x="160" y="150" textAnchor="middle" fill="black" fontWeight="bold" fontSize="26">
            !
          </text>
          <text x="160" y="200" textAnchor="middle" fill="#FFB300" fontWeight="bold" fontSize="14">
            Chart render failed. Contact the author.
          </text>
        </g>
      </svg>
    );
  }
  
  // PIE CHART
  if (figure.type === "pie") {
    const radius = Math.min(width, height) / 2 - 30;
    const cx = width / 2, cy = height / 2;
    let total = figure.data.reduce((a:number,b:number)=>a+b,0);
    let angle = 0;
    const slices = figure.data.map((v:number,i:number) => {
      const startAngle = angle;
      const endAngle = angle + (v/total)*2*Math.PI;
      angle = endAngle;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = endAngle-startAngle > Math.PI ? 1 : 0;
      return <path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`}
        fill={lcarsColor(i)}
        opacity={hovered?.idx === i ? 1 : 0.85}
        stroke={hovered?.idx === i ? '#fff' : undefined}
        strokeWidth={hovered?.idx === i ? 2 : undefined}
  onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: v })}
        onMouseLeave={() => setHovered(null)}
      />;
    });
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {slices}
        {renderTooltip()}
      </svg>
    );
  }
  // AREA CHART
  if (figure.type === "area") {
    // Filled line chart with axes/ticks
    const pointsArr = figure.data.map((v: number, i: number):{x:number,y:number} => {
      const x = (i / (figure.data.length - 1)) * (width - 48) + 36;
      const y = height - 30 - v * (height - 60);
      return {x, y};
    });
    const points = pointsArr.map((p:{x:number,y:number}) => `${p.x},${p.y}`).join(" ");
    const areaPath = `M36,${height-30} L${points} L${width-20},${height-30} Z`;
    const maxVal = Math.max(...figure.data);
    const minVal = Math.min(...figure.data);
    const ticks = [minVal, Math.round((minVal+maxVal)/2), maxVal];
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Y axis */}
        <line x1={36} y1={height-30} x2={36} y2={30} stroke="#888" strokeWidth={2}/>
        {/* X axis */}
        <line x1={36} y1={height-30} x2={width-20} y2={height-30} stroke="#888" strokeWidth={2}/>
        {/* Y axis ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={32} y1={height-30-(t/maxVal)*(height-60)} x2={40} y2={height-30-(t/maxVal)*(height-60)} stroke="#888" />
            <text x={28} y={height-30-(t/maxVal)*(height-60)+5} fill="#FFB300" fontSize={10} textAnchor="end">{t}</text>
          </g>
        ))}
        {/* Area fill */}
        <path d={areaPath} fill={lcarsColor(1)} opacity={0.5}/>
        <polyline points={points} fill="none" stroke={lcarsColor(0)} strokeWidth={2}/>
  {pointsArr.map((p: {x: number, y: number}, i: number) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hovered?.idx === i ? 7 : 4}
            fill={lcarsColor(i)}
            opacity={hovered?.idx === i ? 1 : 0.7}
            stroke={hovered?.idx === i ? '#fff' : undefined}
            strokeWidth={hovered?.idx === i ? 2 : undefined}
            onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: figure.data[i] })}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {renderTooltip()}
      </svg>
    );
  }
  // RADAR CHART
  if (figure.type === "radar") {
    const n = figure.data.length;
    const r = Math.min(width, height)/2-40;
    const cx = width/2, cy = height/2;
    const angles = figure.data.map((_:number,i:number):number=>2*Math.PI*i/n);
    const pointsArr = figure.data.map((v:number,i:number):{x:number,y:number}=>{
      const len = r*v/100;
      return {x: cx+len*Math.cos(angles[i]), y: cy+len*Math.sin(angles[i])};
    });
    // Draw axes
    const axes = angles.map((a:number,i:number)=>(<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#444"/>));
    const points = pointsArr.map((p:{x:number,y:number})=>`${p.x},${p.y}`).join(" ");
    // Add labels for all data points, positioned outward from each vertex
    const labels = [];
    for (let i = 0; i < pointsArr.length; i++) {
      const angle = angles[i];
      const labelX = pointsArr[i].x + 18 * Math.cos(angle);
      const labelY = pointsArr[i].y + 18 * Math.sin(angle);
      labels.push(
        <text
          key={i}
          x={labelX}
          y={labelY}
          fill={hovered?.idx === i ? '#FFB300' : '#fff'}
          fontSize={hovered?.idx === i ? 18 : 14}
          textAnchor="middle"
          style={{ cursor: 'pointer' }}
          onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: figure.data[i] })}
          onMouseLeave={() => setHovered(null)}
        >{figure.data[i]}</text>
      );
    }
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {axes}
        <polygon points={points} fill={lcarsColor(2)} opacity={0.5}/>
        <polyline points={points} fill="none" stroke={lcarsColor(0)} strokeWidth={2}/>
        {labels}
        {renderTooltip()}
      </svg>
    );
  }
  if (figure.type === "line") {
    // Smoother, thinner line, less cartoonish
    const pointsArr = figure.data.map((v: number, i: number):{x:number,y:number} => {
      const x = (i / (figure.data.length - 1)) * (width - 60) + 52;
      const y = height - 30 - v * (height - 60);
      return {x, y};
    });
    const points = pointsArr.map((p:{x:number,y:number}) => `${p.x},${p.y}`).join(" ");
    const maxVal = Math.max(...figure.data);
    const minVal = Math.min(...figure.data);
    const ticks = [minVal, Math.round((minVal+maxVal)/2), maxVal];
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Y axis */}
        <line x1={52} y1={height-30} x2={52} y2={30} stroke="#888" strokeWidth={2}/>
        {/* X axis */}
        <line x1={52} y1={height-30} x2={width-20} y2={height-30} stroke="#888" strokeWidth={2}/>
        {/* Y axis ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={48} y1={height-30-(t/maxVal)*(height-60)} x2={56} y2={height-30-(t/maxVal)*(height-60)} stroke="#888" />
            <text x={44} y={height-30-(t/maxVal)*(height-60)+5} fill="#FFB300" fontSize={10} textAnchor="end">{t}</text>
          </g>
        ))}
        {/* Polyline */}
        <polyline points={points} fill="none" stroke={lcarsColor(0)} strokeWidth={2} />
      </svg>
    );
  }
  // BAR CHART
  if (figure.type === "bar") {
    // Avoid single-bar charts, shrink bar width/height, less cartoonish
    if (!figure.data || figure.data.length < 2) {
      return <div style={{ color: '#FFB300', background: '#222', borderRadius: 12, padding: 16 }}>Insufficient data for bar chart</div>;
    }
    const barWidth = Math.max(8, (width - 48) / figure.data.length - 2); // Fix axis cutoff by increasing left margin
    const maxVal = Math.max(...figure.data);
    const minVal = Math.min(...figure.data);
    // Axis ticks
    const ticks = [minVal, Math.round((minVal+maxVal)/2), maxVal];
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Y axis */}
        <line x1={28} y1={height-30} x2={28} y2={30} stroke="#888" strokeWidth={2}/>
        {/* X axis */}
        <line x1={28} y1={height-30} x2={width-20} y2={height-30} stroke="#888" strokeWidth={2}/>
        {/* Y axis ticks */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={24} y1={height-30-(t/maxVal)*(height-60)} x2={32} y2={height-30-(t/maxVal)*(height-60)} stroke="#888" />
            <text x={16} y={height-30-(t/maxVal)*(height-60)+5} fill="#FFB300" fontSize={10} textAnchor="end">{t}</text>
          </g>
        ))}
        {/* Bars */}
        {figure.data.map((v: number, i: number) => (
          <rect
            key={i}
            x={36 + i * (barWidth + 2)}
            y={height - 30 - (v / maxVal) * (height - 60)}
            width={barWidth}
            height={(v / maxVal) * (height - 60)}
            fill={lcarsColor(i)}
            rx={2}
            opacity={hovered?.idx === i ? 1 : 0.85}
            stroke={hovered?.idx === i ? '#fff' : undefined}
            strokeWidth={hovered?.idx === i ? 2 : undefined}
            onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: v })}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {renderTooltip()}
      </svg>
    );
  }
  // BOXPLOT CHART
  if (figure.type === "boxplot") {
    // Defensive: check for valid boxplot object
    if (!figure.data || typeof figure.data !== "object" || !("min" in figure.data)) {
      return <div style={{ color: '#FFB300', background: '#222', borderRadius: 12, padding: 16 }}>Invalid boxplot data</div>;
    }
    const { min, q1, median, q3, max, outliers } = figure.data;
    const boxLeft = 48, boxRight = width-40, boxY = height/2;
    const scale = (v:number) => boxLeft + ((v-min)/(max-min||1))*(boxRight-boxLeft);
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Whiskers */}
        <line x1={scale(min)} y1={boxY} x2={scale(max)} y2={boxY} stroke="#888" strokeWidth={2}/>
        {/* Box */}
        <rect x={scale(q1)} y={boxY-18} width={scale(q3)-scale(q1)} height={36} fill={lcarsColor(2)} opacity={0.5} rx={6}/>
        {/* Median */}
        <line x1={scale(median)} y1={boxY-18} x2={scale(median)} y2={boxY+18} stroke={lcarsColor(0)} strokeWidth={3}/>
        {/* Outliers */}
        {outliers.map((v:number,i:number)=>(<circle
          key={i}
          cx={scale(v)}
          cy={boxY}
          r={hovered?.idx === i ? 10 : 6}
          fill="#F44336"
          opacity={hovered?.idx === i ? 1 : 0.7}
          stroke={hovered?.idx === i ? '#fff' : undefined}
          strokeWidth={hovered?.idx === i ? 2 : undefined}
          onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: v })}
          onMouseLeave={() => setHovered(null)}
        />))}
        {renderTooltip()}
        {/* Value labels */}
        <text x={scale(min)} y={boxY+32} fill="#fff" fontSize={12} textAnchor="middle">{min}</text>
        <text x={scale(q1)} y={boxY+32} fill="#fff" fontSize={12} textAnchor="middle">{q1}</text>
        <text x={scale(median)} y={boxY+32} fill="#fff" fontSize={12} textAnchor="middle">{median}</text>
        <text x={scale(q3)} y={boxY+32} fill="#fff" fontSize={12} textAnchor="middle">{q3}</text>
        <text x={scale(max)} y={boxY+32} fill="#fff" fontSize={12} textAnchor="middle">{max}</text>
      </svg>
    );
  }
  // SCATTER CHART
  if (figure.type === "scatter") {
    // Defensive: check for valid array of points
    if (!Array.isArray(figure.data) || !figure.data.length || typeof figure.data[0] !== "object") {
      return <div style={{ color: '#FFB300', background: '#222', borderRadius: 12, padding: 16 }}>Invalid scatterplot data</div>;
    }
    // Calculate linear regression (trend line)
    const n = figure.data.length;
    const sumX = figure.data.reduce((acc,pt)=>acc+pt.x,0);
    const sumY = figure.data.reduce((acc,pt)=>acc+pt.y,0);
    const sumXY = figure.data.reduce((acc,pt)=>acc+pt.x*pt.y,0);
    const sumXX = figure.data.reduce((acc,pt)=>acc+pt.x*pt.x,0);
    const slope = (n*sumXY - sumX*sumY)/(n*sumXX - sumX*sumX||1);
    const intercept = (sumY - slope*sumX)/n;
    const x0 = 0, x1 = 100;
    const y0 = slope*x0 + intercept;
    const y1 = slope*x1 + intercept;
    // Find outliers/extremes (top 2 max Y, bottom 2 min Y)
    const sorted = [...figure.data].sort((a,b)=>a.y-b.y);
    const labelIdxs = new Set([
      figure.data.indexOf(sorted[0]),
      figure.data.indexOf(sorted[1]),
      figure.data.indexOf(sorted[sorted.length-1]),
      figure.data.indexOf(sorted[sorted.length-2])
    ]);
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Axes */}
        <line x1={36} y1={height-30} x2={36} y2={30} stroke="#888" strokeWidth={2}/>
        <line x1={36} y1={height-30} x2={width-20} y2={height-30} stroke="#888" strokeWidth={2}/>
        {/* Trend line */}
        <line x1={36 + x0/100*(width-56)} y1={height-30 - y0/100*(height-60)} x2={36 + x1/100*(width-56)} y2={height-30 - y1/100*(height-60)} stroke="#FFB300" strokeWidth={2} opacity={0.7}/>
        {/* Points */}
        {figure.data.map((pt: { x: number; y: number }, i: number) => (
          <g key={i}>
            <circle
              cx={36 + pt.x / 100 * (width - 56)}
              cy={height - 30 - pt.y / 100 * (height - 60)}
              r={hovered?.idx === i ? 6 : 3.5}
              fill={lcarsColor(i)}
              opacity={hovered?.idx === i ? 1 : 0.7}
              stroke={hovered?.idx === i ? '#fff' : undefined}
              strokeWidth={hovered?.idx === i ? 2 : undefined}
              onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: `(${pt.x}, ${pt.y})` })}
              onMouseLeave={() => setHovered(null)}
            />
            {labelIdxs.has(i) && (
              <text x={36 + pt.x / 100 * (width - 56)} y={height - 30 - pt.y / 100 * (height - 60) - 8} fill="#fff" fontSize={11} textAnchor="middle">({pt.x},{pt.y})</text>
            )}
          </g>
        ))}
        {renderTooltip()}
      </svg>
    );
  }
  // GAUGE CHART (supports multiple values)
  if (figure.type === "gauge") {
    // Accepts array of values, renders multiple horizontal bars
    const values = Array.isArray(figure.data) ? figure.data : [figure.data];
    const gaugeWidth = width - 40;
    const barHeight = 20;
    const gap = 16;
    const totalHeight = values.length * barHeight + (values.length-1)*gap;
    const startY = (height-totalHeight)/2;
    // Pick contrasting text color for each gauge
    function gaugeTextColor(idx:number) {
      // Use white for yellow/orange gauges, yellow for blue/purple/green/dark
      const color = lcarsColor(idx);
      if (color === "#FFB300" || color === "#FF6F00") return "#fff";
      return "#FFB300";
    }
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {values.map((value:number, i:number) => (
          <g key={i}>
            <rect x={20} y={startY + i*(barHeight+gap)} width={gaugeWidth} height={barHeight} fill="#444" rx={10} />
            <rect
              x={20}
              y={startY + i*(barHeight+gap)}
              width={gaugeWidth * value / 100}
              height={barHeight}
              fill={lcarsColor(i)}
              rx={10}
              opacity={hovered?.idx === i ? 1 : 0.85}
              stroke={hovered?.idx === i ? '#fff' : undefined}
              strokeWidth={hovered?.idx === i ? 2 : undefined}
              onMouseMove={e => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: value })}
              onMouseLeave={() => setHovered(null)}
            />
            <text x={width / 2} y={startY + i*(barHeight+gap) + barHeight/2 + 5} fill={gaugeTextColor(i)} fontSize={17} textAnchor="middle">{value}%</text>
          </g>
        ))}
        {renderTooltip()}
      </svg>
    );
  }
  // STEP CHART
  if (figure.type === "step") {
    // Segmented line chart with axis/tick marks and data labels
    const n = figure.data.length;
    const axisX1 = 36, axisYEnd = height-30, axisYStart = 30;
    const axisX2 = width-20, axisY2 = height-30;
    // Build step path
    let stepPath = `M${axisX1},${axisYEnd - ((figure.data[0]-Math.min(...figure.data))/(Math.max(...figure.data)-Math.min(...figure.data)||1))*(axisYEnd-axisYStart)}`;
    for (let i = 1; i < n; i++) {
      const prevY = axisYEnd - ((figure.data[i-1]-Math.min(...figure.data))/(Math.max(...figure.data)-Math.min(...figure.data)||1))*(axisYEnd-axisYStart);
      const currX = axisX1 + (i/(n-1))*(width-40);
      const currY = axisYEnd - ((figure.data[i]-Math.min(...figure.data))/(Math.max(...figure.data)-Math.min(...figure.data)||1))*(axisYEnd-axisYStart);
      stepPath += ` H${currX} V${currY}`;
    }
    // X axis ticks
    const xTicks = [];
    for (let i = 0; i < n; i++) {
      const x = axisX1 + (i/(n-1))*(width-40);
      xTicks.push(
        <g key={i}>
          <line x1={x} y1={axisYEnd} x2={x} y2={axisYEnd+6} stroke="#fff" />
          <text x={x} y={axisYEnd+18} fill="#fff" fontSize={12} textAnchor="middle">{i+1}</text>
        </g>
      );
    }
    // Y axis ticks
    const minVal = Math.min(...figure.data);
    const maxVal = Math.max(...figure.data);
    const yTicks = [];
    for (let t of [minVal, Math.round((minVal+maxVal)/2), maxVal]) {
      const y = axisYEnd - ((t-minVal)/(maxVal-minVal||1))*(axisYEnd-axisYStart);
      yTicks.push(
        <g key={t}>
          <line x1={axisX1-8} y1={y} x2={axisX1} y2={y} stroke="#fff" />
          <text x={axisX1-12} y={y+5} fill="#fff" fontSize={12} textAnchor="end">{t}</text>
        </g>
      );
    }
    // Data point labels
    const labels = [];
    for (let i = 0; i < n; i++) {
      const x = axisX1 + (i/(n-1))*(width-40);
      const y = axisYEnd - ((figure.data[i]-minVal)/(maxVal-minVal||1))*(axisYEnd-axisYStart);
      labels.push(
        <text key={i} x={x} y={y-12} fill="#FFB300" fontSize={14} textAnchor="middle">{figure.data[i]}</text>
      );
    }
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Y axis */}
        <line x1={axisX1} y1={axisYEnd} x2={axisX1} y2={axisYStart} stroke="#888" strokeWidth={2}/>
        {/* X axis */}
        <line x1={axisX1} y1={axisYEnd} x2={axisX2} y2={axisY2} stroke="#888" strokeWidth={2}/>
        {xTicks}
        {yTicks}
        <path d={stepPath} fill="none" stroke={lcarsColor(0)} strokeWidth={2}/>
        {labels.map((label, i) => React.cloneElement(label, {
          fill: hovered?.idx === i ? '#FFB300' : '#FFB300',
          fontSize: hovered?.idx === i ? 18 : 14,
          onMouseMove: (e: any) => setHovered({ idx: i, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: figure.data[i] }),
          onMouseLeave: () => setHovered(null)
        }))}
        {renderTooltip()}
      </svg>
    );
  }
  // HEATMAP CHART
  if (figure.type === "heatmap") {
    // Defensive: check for valid 2D array and all rows have equal length
    if (!Array.isArray(figure.data) || !Array.isArray(figure.data[0]) || figure.data.length < 2 || figure.data[0].length < 2 || !figure.data.every(row => Array.isArray(row) && row.length === figure.data[0].length)) {
      return <div style={{ color: '#FFB300', background: '#222', borderRadius: 12, padding: 16 }}>Invalid heatmap data</div>;
    }
    const rows = figure.data.length;
    const cols = figure.data[0].length;
    const cellW = (width - 40) / cols;
    const cellH = (height - 40) / rows;
    // Find min/max for color scaling
    const flat = figure.data.flat();
    const minVal = Math.min(...flat);
    const maxVal = Math.max(...flat);
    // Color scale
    function cellColor(val:number) {
      const t = (val-minVal)/(maxVal-minVal||1);
      // LCARS blue to orange
      return `rgb(${255*t},${127+50*(1-t)},${255*(1-t)})`;
    }
    return (
      <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
        <rect x={0} y={0} width={width} height={height} fill="#222" />
        {/* Draw grid */}
        {figure.data.map((row:number[], r:number) => row.map((v:number, c:number) => (
          <rect
            key={`${r}-${c}`}
            x={20 + c*cellW}
            y={20 + r*cellH}
            width={cellW-2}
            height={cellH-2}
            fill={cellColor(v)}
            rx={3}
            opacity={hovered?.idx === r*cols+c ? 1 : 0.85}
            stroke={hovered?.idx === r*cols+c ? '#fff' : undefined}
            strokeWidth={hovered?.idx === r*cols+c ? 2 : undefined}
            onMouseMove={e => setHovered({ idx: r*cols+c, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: v })}
            onMouseLeave={() => setHovered(null)}
          />
        )))}
        {/* Add value labels */}
        {figure.data.map((row:number[], r:number) => row.map((v:number, c:number) => (
          <text
            key={`label-${r}-${c}`}
            x={20 + c*cellW + cellW/2}
            y={20 + r*cellH + cellH/2 + 5}
            fill={hovered?.idx === r*cols+c ? '#FFB300' : '#fff'}
            fontSize={hovered?.idx === r*cols+c ? 18 : 13}
            textAnchor="middle"
            style={{ cursor: 'pointer' }}
            onMouseMove={e => setHovered({ idx: r*cols+c, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, value: v })}
            onMouseLeave={() => setHovered(null)}
          >{v}</text>
        )))}
        {renderTooltip()}
      </svg>
    );
  }
  // Fallback
  // Fallback for unknown or missing chart type/data
  return <svg id={figure.id} width={width} height={height} style={{ background: "#222", borderRadius: 12 }}>
    <rect x={0} y={0} width={width} height={height} fill="#222" />
    <text x={width/2} y={height/2} fill="#FFB300" fontSize={14} textAnchor="middle">
      {figure?.type ? `Unknown chart type: ${figure.type}` : 'Missing or invalid chart data'}
    </text>
  </svg>;
}
