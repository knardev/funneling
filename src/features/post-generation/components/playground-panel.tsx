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
import { Textarea } from "@/components/ui/textarea";

// Import your server actions
import { initializeContent } from "@/features/post-generation/actions/initialize_content";
import { generateTitle } from "@/features/post-generation/actions/content/generate_title";
import { generateToc } from "@/features/post-generation/actions/content/generate_toc";
import { generateIntro } from "@/features/post-generation/actions/content/generate_intro";
import { generateBody } from "@/features/post-generation/actions/content/generate_body";
import { generateConclusion } from "@/features/post-generation/actions/content/generate_conclusion";
import { generateImagePrompt } from "@/features/post-generation/actions/image/generate_imagePrompt";
import { generateImage } from "@/features/post-generation/actions/image/generate_image";

import { Analysis } from "../types";

export function PlaygroundPanel() {
  // Input states
  const [keyword, setKeyword] = useState("");
  const [subkeywords, setSubKeywords] = useState("");
  const [personaServiceName, setPersonaServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceAdvantages, setServiceAdvantages] = useState("");

  // Result states
  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null,
    marketing_points: null,
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [title, setTitle] = useState("");
  const [toc, setToc] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [imagePrompts, setImagePrompts] = useState("");
  const [images, setImages] = useState("");

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const persona = {
    service_industry: serviceType,
    service_name: personaServiceName,
    service_advantage: serviceAdvantages,
  };

  const keywordObj = {
    keyword,
    subkeywords: "",
  };

  // Utility function to update logs
  const updateLog = (message: string) => {
    setDebugLogs((prevLogs) => [
      ...prevLogs,
      `${new Date().toISOString()}: ${message}`,
    ]);
  };

  // Individual step execution handlers
  const handleInitializeContent = async () => {
    updateLog("Initializing content...");
    const result = await initializeContent(keyword, persona);
    setServiceAnalysis(result.service_analysis);
    setSubKeywordlist(result.subkeywordlist);
    updateLog(`Content initialized: ${JSON.stringify(result)}`);
  };

  const handleGenerateTitle = async () => {
    updateLog("Generating title...");
    const result = await generateTitle(keywordObj, persona);
    setTitle(result.title);
    // setSubKeywords(result.subkeyword);
    updateLog(`Title generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateToc = async () => {
    updateLog("Generating TOC...");
    const result = await generateToc(keywordObj, title, serviceAnalysis);
    setToc(result.toc);
    updateLog(`TOC generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateIntro = async () => {
    updateLog("Generating intro...");
    const result = await generateIntro(keywordObj, title, persona, toc);
    setIntro(result.intro);
    updateLog(`Intro generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateBody = async () => {
    updateLog("Generating body...");
    const result = await generateBody(keywordObj, persona, title, toc, intro);
    setBody(result.body);
    updateLog(`Body generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateConclusion = async () => {
    updateLog("Generating conclusion...");
    const result = await generateConclusion(
      keywordObj,
      persona,
      title,
      toc,
      intro,
      body
    );
    setConclusion(result.conclusion);
    updateLog(`Conclusion generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateImagePrompt = async () => {
    updateLog("Generating image prompts...");
    const result = await generateImagePrompt(keywordObj, persona, {
      title,
      toc,
      intro,
      body,
      conclusion,
    });
    setImagePrompts(result.imagePrompts);
    updateLog(`Image prompts generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateImages = async () => {
    updateLog("Generating images...");
    const result = await generateImage(
      keywordObj,
      persona,
      {
        title,
        toc,
        intro,
        body,
        conclusion,
      },
      imagePrompts
    );
    setImages(result.images);
    updateLog(`Images generated: ${JSON.stringify(result)}`);
  };

  // Run all steps in sequence
  const handleRunAll = async () => {
    updateLog("Running all steps...");
    await handleInitializeContent();
    await handleGenerateTitle();
    await handleGenerateToc();
    await handleGenerateIntro();
    await handleGenerateBody();
    await handleGenerateConclusion();
    await handleGenerateImagePrompt();
    await handleGenerateImages();
    updateLog("All steps completed.");
  };

  // Reset all states
  const handleResetStates = () => {
    setKeyword("");
    setSubKeywords("");
    setPersonaServiceName("");
    setServiceType("");
    setServiceAdvantages("");
    setSubKeywordlist(null);
    setServiceAnalysis({
      industry_analysis: null,
      advantage_analysis: null,
      target_needs: null,
      marketing_points: null,
    });
    setTitle("");
    setToc("");
    setIntro("");
    setBody("");
    setConclusion("");
    setImagePrompts("");
    setImages("");
    setDebugLogs([]);
    updateLog("States reset.");
  };

  return (
    <div className="h-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} maxSize={25}>
          <div className="p-4 flex flex-col gap-4 h-full">
            <h2>Initial Input</h2>
            <div>
              <Label>Keyword</Label>
              <Input
                placeholder="Enter keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <div>
              <Label>Persona Service Name</Label>
              <Input
                placeholder="Enter persona service name"
                value={personaServiceName}
                onChange={(e) => setPersonaServiceName(e.target.value)}
              />
            </div>
            <div>
              <Label>Service Industry</Label>
              <Input
                placeholder="Enter service industry"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              />
            </div>
            <div>
              <Label>Service Advantages</Label>
              <Textarea
                placeholder="Enter service advantages"
                value={serviceAdvantages}
                onChange={(e) => setServiceAdvantages(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleInitializeContent}>
                Initialize Content
              </Button>
              <Button onClick={handleGenerateTitle}>Generate Title</Button>
              <Button onClick={handleGenerateToc}>Generate TOC</Button>
              <Button onClick={handleGenerateIntro}>Generate Intro</Button>
              <Button onClick={handleGenerateBody}>Generate Body</Button>
              <Button onClick={handleGenerateConclusion}>
                Generate Conclusion
              </Button>
              <Button onClick={handleGenerateImagePrompt}>
                Generate Image Prompt
              </Button>
              <Button onClick={handleGenerateImages}>Generate Images</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button onClick={handleRunAll}>Run All Steps</Button>
              <Button variant="destructive" onClick={handleResetStates}>
                Reset States
              </Button>
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
            <pre>Keyword: {keyword}</pre>
            <pre>Persona Service Name: {personaServiceName}</pre>
            <pre>Service Type: {serviceType}</pre>
            <pre>Service Advantages: {serviceAdvantages}</pre>
            <pre>Service Analysis: {JSON.stringify(serviceAnalysis)}</pre>
            <pre>Subkeywords: {subkeywords}</pre>
            <pre>Title: {title}</pre>
            <pre>TOC: {toc}</pre>
            <pre>Intro: {intro}</pre>
            <pre>Body: {body}</pre>
            <pre>Conclusion: {conclusion}</pre>
            <pre>Image Prompts: {imagePrompts}</pre>
            <pre>Images: {images}</pre>
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
