import React, { useState, useEffect } from "react";
import { Figure, FigureType } from "../types";
import { LCARS } from "../utils/lcars";

interface ChartEditorProps {
  figure: Figure;
  onUpdate: (updatedFigure: Figure) => void;
  onClose: () => void;
}

// Available chart types to switch between
const CHART_TYPES: FigureType[] = [
  "line", "bar", "scatter", "gauge", "pie", "area", "radar", "boxplot"
];

export default function ChartEditor({ figure, onUpdate, onClose }: ChartEditorProps) {
  // Create a working copy of the figure to edit
  const [editedFigure, setEditedFigure] = useState<Figure>({ ...figure });
  // Track current editing tab
  const [activeTab, setActiveTab] = useState<'type' | 'data' | 'style'>('type');
  // Track if data values are being manually edited
  const [isEditingData, setIsEditingData] = useState(false);
  // Track data as string for manual editing
  const [dataString, setDataString] = useState("");
  // Track validation errors
  const [error, setError] = useState<string | null>(null);

  // Generate data string when switching to data tab or when data changes
  useEffect(() => {
    if (activeTab === 'data' && !isEditingData) {
      try {
        // Format the data based on type
        if (editedFigure.type === "scatter") {
          setDataString(JSON.stringify(editedFigure.data, null, 2));
        } else if (editedFigure.type === "boxplot") {
          setDataString(JSON.stringify(editedFigure.data, null, 2));
        } else {
          // For simple array data
          setDataString(JSON.stringify(editedFigure.data, null, 2));
        }
      } catch (err) {
        setDataString(String(editedFigure.data));
      }
    }
  }, [activeTab, editedFigure.data, editedFigure.type, isEditingData]);

  // Handle chart type change
  const handleTypeChange = (newType: FigureType) => {
    // Helper function to generate appropriate data for the new chart type
    const generateDataForType = (type: FigureType): any => {
      const rnd = () => Math.random();
      const len = 8; // Default data length
      
      switch (type) {
        case "line":
        case "area":
        case "step":
          return Array.from({ length: len }, () => +(30 + rnd() * 70).toFixed(1));
        
        case "bar":
          return Array.from({ length: 5 }, () => Math.round(30 + rnd() * 70));
        
        case "scatter":
          return Array.from({ length: 10 }, () => ({
            x: +(rnd() * 100).toFixed(1),
            y: +(rnd() * 100).toFixed(1)
          }));
        
        case "gauge":
          return Array.from({ length: 3 }, () => Math.round(40 + rnd() * 60));
        
        case "pie":
          const pieRaw = Array.from({ length: 5 }, () => Math.round(10 + rnd() * 40));
          const pieSum = pieRaw.reduce((a, b) => a + b, 0);
          return pieRaw.map(v => +(v / pieSum * 100).toFixed(1));
        
        case "radar":
          return Array.from({ length: 6 }, () => Math.round(30 + rnd() * 70));
        
        case "boxplot":
          const boxRaw = Array.from({ length: 20 }, () => Math.round(30 + rnd() * 70));
          boxRaw.sort((a, b) => a - b);
          return {
            min: boxRaw[0],
            q1: boxRaw[5],
            median: boxRaw[10],
            q3: boxRaw[15],
            max: boxRaw[19],
            outliers: boxRaw.filter((v, i) => i < 2 || i > 17)
          };
        
        default:
          return Array.from({ length: len }, () => +(30 + rnd() * 70).toFixed(1));
      }
    };

    // Check if we need to generate new data for the chart type
    const currentDataType = typeof editedFigure.data;
    const needsNewData = (
      (newType === "scatter" && !Array.isArray(editedFigure.data)) ||
      (newType === "boxplot" && currentDataType !== "object") ||
      (["line", "bar", "pie", "area", "radar", "gauge"].includes(newType) && 
       !Array.isArray(editedFigure.data))
    );

    setEditedFigure(prev => ({
      ...prev,
      type: newType,
      data: needsNewData ? generateDataForType(newType) : prev.data
    }));
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedFigure(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  // Handle caption change
  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedFigure(prev => ({
      ...prev,
      caption: e.target.value
    }));
  };

  // Handle data string edit
  const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDataString(e.target.value);
    setIsEditingData(true);
  };

  // Apply data changes
  const applyDataChanges = () => {
    try {
      const newData = JSON.parse(dataString);
      
      // Validate data based on chart type
      if (editedFigure.type === "scatter") {
        if (!Array.isArray(newData) || !newData.every(item => typeof item === "object" && "x" in item && "y" in item)) {
          throw new Error("Scatter data must be an array of {x, y} objects");
        }
      } else if (editedFigure.type === "boxplot") {
        if (typeof newData !== "object" || !["min", "q1", "median", "q3", "max"].every(key => key in newData)) {
          throw new Error("Boxplot data must have min, q1, median, q3, max properties");
        }
      } else if (!Array.isArray(newData)) {
        throw new Error("Data must be an array of numbers");
      }
      
      setEditedFigure(prev => ({
        ...prev,
        data: newData
      }));
      setIsEditingData(false);
      setError(null);
    } catch (err) {
      setError(`Invalid data format: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  // Handle save button
  const handleSave = () => {
    // Apply any pending data changes first
    if (isEditingData) {
      try {
        applyDataChanges();
      } catch (err) {
        // If there's an error, don't proceed with saving
        return;
      }
    }
    
    // Send the updated figure to the parent
    onUpdate(editedFigure);
    onClose();
  };

  // Reset data to original
  const handleResetData = () => {
    setEditedFigure(prev => ({
      ...prev,
      data: figure.data
    }));
    setIsEditingData(false);
    setError(null);
  };

  // Randomize data
  const handleRandomizeData = () => {
    handleTypeChange(editedFigure.type);
    setIsEditingData(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#12182c] rounded-2xl border border-amber-500 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-400">Edit Chart</h2>
          <button 
            className="text-slate-300 hover:text-white"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 mb-4">
          <button 
            className={`px-4 py-2 ${activeTab === 'type' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('type')}
          >
            Chart Type
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'data' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'style' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-400'}`}
            onClick={() => setActiveTab('style')}
          >
            Style
          </button>
        </div>

        {/* Type Tab */}
        {activeTab === 'type' && (
          <div className="space-y-4">
            <div>
              <label className="block text-amber-300 mb-2">Chart Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600"
                value={editedFigure.title}
                onChange={handleTitleChange}
              />
            </div>

            <div>
              <label className="block text-amber-300 mb-2">Chart Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CHART_TYPES.map(type => (
                  <button
                    key={type}
                    className={`p-2 rounded-lg text-center ${editedFigure.type === type 
                      ? 'bg-amber-500 text-black font-bold' 
                      : 'bg-slate-700 text-white'}`}
                    onClick={() => handleTypeChange(type)}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-amber-300 mb-2">Caption</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600"
                value={editedFigure.caption}
                onChange={handleCaptionChange}
              />
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-amber-300">Chart Data</label>
              <div className="space-x-2">
                <button 
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                  onClick={handleRandomizeData}
                >
                  Randomize
                </button>
                <button 
                  className="px-3 py-1 bg-slate-600 text-white rounded-lg text-sm"
                  onClick={handleResetData}
                >
                  Reset
                </button>
                {isEditingData && (
                  <button 
                    className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                    onClick={applyDataChanges}
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                className="w-full h-64 px-3 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 font-mono text-sm"
                value={dataString}
                onChange={handleDataChange}
                spellCheck="false"
              />
              {error && (
                <div className="absolute bottom-0 left-0 right-0 bg-red-900 text-white p-2 rounded-b-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="bg-slate-800 p-3 rounded-lg text-sm text-slate-300">
              <h4 className="font-bold text-amber-300 mb-1">Data Format Help</h4>
              <p className="mb-2">Format depends on chart type:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="text-amber-200">Line, Bar, Area, Pie, Radar:</span> Array of numbers</li>
                <li><span className="text-amber-200">Scatter:</span> Array of {`{x: number, y: number}`} objects</li>
                <li><span className="text-amber-200">Boxplot:</span> Object with min, q1, median, q3, max, outliers</li>
                <li><span className="text-amber-200">Gauge:</span> Array of 1-3 numbers (0-100)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Style Tab */}
        {activeTab === 'style' && (
          <div className="text-center py-12">
            <p className="text-amber-300 mb-2">LCARS theme applied to all charts.</p>
            <p className="text-slate-300 text-sm">Custom styling options will be available in a future update.</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button 
            className="px-4 py-2 bg-slate-700 text-white rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 bg-amber-500 text-black font-bold rounded-lg"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
