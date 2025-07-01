import React from "react";

export const Popup: React.FC = () => {
  return (
    <div className="w-80 p-4 bg-background text-foreground">
      <h1 className="text-xl font-bold mb-4">Report Generator</h1>

      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Current Page</p>
        <p className="text-sm">Ready to generate report</p>
      </div>

      <button
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        type="button"
      >
        Generate Report
      </button>
    </div>
  );
};
