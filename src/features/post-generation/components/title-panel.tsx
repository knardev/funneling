"use client";

import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
// Import your server actions
import { generateTitle } from "@/features/post-generation/actions/content/generate_title";
import { Analysis } from "../types";

export function TitlePanel() {
  // Input states
  const [mainkeyword, setMainKeyword] = useState("");
  const [subkeywords, setSubKeywords] = useState<string[]>([]);

  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [titles, setTitles] = useState<string[]>([]);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  // Generate Title
  const handleGenerateTitle = async () => {
    updateLog("Generating title...");
    try {
      const result = await generateTitle(mainkeyword, subkeywordlist, serviceAnalysis);
      setTitles(result.optimizedTitles);
      setSubKeywords(result.selected_subkeywords);
      updateLog(`Title generated: ${JSON.stringify(result)}`);
    } catch (error: any) {
      updateLog(`Error generating title: ${error.message}`);
    }
  };

  // Reset all states
  const handleResetStates = () => {
    setMainKeyword("");
    setSubKeywords([]);
    setSubKeywordlist(null);
    setTitles([]);
    setDebugLogs([]);
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} maxSize={25}>
          <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto">
            <h2>Initial Input</h2>
            <div>
              <Label>Keyword</Label>
              <Input
                placeholder="Enter keyword"
                value={mainkeyword}
                onChange={(e) => setMainKeyword(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerateTitle}>Generate Title</Button>  
              <Button onClick={handleResetStates}>Reset States</Button>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="bg-slate-300" />
        <ResizablePanel
          defaultSize={75}
          maxSize={75}
          className="p-4 flex flex-col gap-4"
        >
          <h2>Debug Panel</h2>
          <div className="mt-4 space-y-2 text-sm">
            <pre>Keyword: {mainkeyword}</pre>
            <pre>Subkeywords: {subkeywords.join(", ") || "No subkeywords"}</pre>
            <pre>
                Titles:
                {titles.length > 0
                    ? titles.map((title, index) => (
                        <div key={index}>
                        {index + 1}. {title}
                        <br />
                        </div>
                    ))
                : "No titles"}
            </pre>
          </div>
          <div className="mt-4">
            <h3>Execution Logs:</h3>
            <div className="text-sm">
              {debugLogs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
