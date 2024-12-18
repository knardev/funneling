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

import { Analysis, FinalResult } from "../types";
import { saveFinalResult } from "../actions/save_finalResult";

export function BrandPanel() {
  // Input states
  const [mainkeyword, setMainKeyword] = useState("");
  const [personaServiceName, setPersonaServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [serviceAdvantages, setServiceAdvantages] = useState("");

  // Result states
  const [serviceAnalysis, setServiceAnalysis] = useState<Analysis>({
    industry_analysis: null,
    advantage_analysis: null,
    target_needs: null
  });
  const [subkeywordlist, setSubKeywordlist] = useState<string[] | null>(null);
  const [title, setTitle] = useState("");
  const [toc, setToc] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [updatedContent, setUpdatedContent] = useState("");
  const [imagePrompts, setImagePrompts] = useState<{id:string,prompt:string}[]>([]);
  const [images, setImages] = useState<{id:string,imageUrl:string}[]>([]);

  // Debug log state
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const persona = {
    service_industry: serviceType,
    service_name: personaServiceName,
    service_advantage: serviceAdvantages,
  };


  const content = {
    title,
    toc : [toc],
    intro,
    body,
    conclusion
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
    const hasAllPersonaData=personaServiceName.trim() && serviceType.trim() && serviceAdvantages.trim()
    const result = await initializeContent(mainkeyword, hasAllPersonaData ? persona : undefined);
    if (result.serviceanalysis) {
      setServiceAnalysis(result.serviceanalysis);
    }
    setSubKeywordlist(result.subkeywordlist);
    updateLog(`Content initialized: ${JSON.stringify(result)}`);
  };

// // subkeywordlist 중 subkeywords 선택
//   const handleGenerateTitle = async () => {
//     updateLog("Generating title...");
//     const result = await generateTitle(mainkeyword,subkeywordlist, serviceAnalysis);
//     setTitle(result.title);
//     setSubKeywords(result.subkeywords);
//     updateLog(`Title generated: ${JSON.stringify(result)}`);
//   };

  const handleGenerateToc = async () => {
    updateLog("Generating TOC...");
    const result = await generateToc(mainkeyword, title, serviceAnalysis);
    setToc(result.toc);
    updateLog(`TOC generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateIntro = async () => {
    updateLog("Generating intro...");
    const result = await generateIntro(mainkeyword, title, toc, serviceAnalysis);
    setIntro(result.intro);
    updateLog(`Intro generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateBody = async () => {
    updateLog("Generating body...");
    const result = await generateBody(mainkeyword, title, toc, intro, serviceAnalysis);
    setBody(result.body);
    updateLog(`Body generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateConclusion = async () => {
    updateLog("Generating conclusion...");
    const result = await generateConclusion(
      mainkeyword,
      title,
      toc,
      intro,
      body,
      serviceAnalysis
    );
    setConclusion(result.conclusion);
    updateLog(`Conclusion generated: ${JSON.stringify(result)}`);
  };

  const handleGenerateImagePrompt = async () => {
    updateLog("Generating image prompts...");
    const result = await generateImagePrompt({
      title,
      toc : [toc],
      intro,
      body,
      conclusion,
    }, serviceAnalysis);
    if(result.updatedContent){
      setUpdatedContent(result.updatedContent)
      setImagePrompts(result.imagePrompts);
    }
    updateLog(`Image prompts generated: ${JSON.stringify(result.imagePrompts)}`);
  };

  const handleGenerateImages = async () => {
    updateLog("Generating images...");
    const result = await generateImage(
      imagePrompts
    );
    setImages(result.images);
    updateLog(`Images generated: ${JSON.stringify(result.images)}`);
  };
  
  const handleSaveFinalResult = async () => {
    try{
    updateLog("Saving final result...");
    const finalResult:FinalResult={
      mainKeyword:mainkeyword,
      persona,
      service_analysis:serviceAnalysis,
      content,
      imagePrompts,
      images,
      updatedContent
    }
    const result = await saveFinalResult(finalResult);
    updateLog(`Final result saved: ${JSON.stringify(result)}`);
    }catch(error){
      updateLog(`Error saving final result: ${error}`);
      console.error("Error saving final result:", error);
    }
  };

  // Run all steps in sequence
  const handleRunAll = async () => {
    updateLog("Running all steps...");
    
    try {
      // Initialize Content
      updateLog("Initializing content...");
      const hasAllPersonaData = personaServiceName.trim() && serviceType.trim() && serviceAdvantages.trim();
      const initResult = await initializeContent(mainkeyword, hasAllPersonaData ? persona : undefined);
      updateLog(`Content initialized: ${JSON.stringify(initResult)}`);
      setServiceAnalysis(initResult.serviceanalysis || { industry_analysis: null, advantage_analysis: null, target_needs: null });
      setSubKeywordlist(initResult.subkeywordlist);
      
    //   // Generate Title
    //   updateLog("Generating title...");
    //   const titleResult = await generateTitle(
    //     mainkeyword,
    //     initResult.subkeywordlist,
    //     initResult.serviceanalysis
    //   );
    //   setTitle(titleResult.title);
    //   setSubKeywords(titleResult.subkeywords);
    //   updateLog(`Title generated: ${JSON.stringify(titleResult)}`);
      
      // Generate TOC
      updateLog("Generating TOC...");
      const tocResult = await generateToc(
        mainkeyword,
        title,
        initResult.serviceanalysis
      );
      setToc(tocResult.toc);
      updateLog(`TOC generated: ${JSON.stringify(tocResult)}`);
      
      // Generate Intro
      updateLog("Generating intro...");
      const introResult = await generateIntro(
        mainkeyword,
        title,
        toc,
        initResult.serviceanalysis
      );
      setIntro(introResult.intro);
      updateLog(`Intro generated: ${JSON.stringify(introResult)}`);
      
      // Generate Body
      updateLog("Generating body...");
      const bodyResult = await generateBody(
        mainkeyword,
        title,
        toc,
        intro,
        initResult.serviceanalysis
      );
      setBody(bodyResult.body);
      updateLog(`Body generated: ${JSON.stringify(bodyResult)}`);
      
      // Generate Conclusion
      updateLog("Generating conclusion...");
      const conclusionResult = await generateConclusion(
        mainkeyword,
        title,
        tocResult.toc,
        introResult.intro,
        bodyResult.body,
        initResult.serviceanalysis
      );
      setConclusion(conclusionResult.conclusion);
      updateLog(`Conclusion generated: ${JSON.stringify(conclusionResult)}`);
      
      // Generate Image Prompt
      updateLog("Generating image prompts...");
      const imagePromptResult = await generateImagePrompt(
        {
          title: title,
          toc: [tocResult.toc],
          intro: introResult.intro,
          body: bodyResult.body,
          conclusion: conclusionResult.conclusion,
        },
        initResult.serviceanalysis
      );
      setUpdatedContent(imagePromptResult.updatedContent || "");
      setImagePrompts(imagePromptResult.imagePrompts);
      updateLog(`Image prompts generated: ${JSON.stringify(imagePromptResult.imagePrompts)}`);
      
      // Generate Images
      updateLog("Generating images...");
      const imagesResult = await generateImage(imagePromptResult.imagePrompts);
      setImages(imagesResult.images);
      updateLog(`Images generated: ${JSON.stringify(imagesResult.images)}`);
      
      // Save Final Result
      updateLog("Saving final result...");
      const finalResult: FinalResult = {
        mainKeyword:mainkeyword,
        persona,
        service_analysis: initResult.serviceanalysis || { industry_analysis: null, advantage_analysis: null, target_needs: null },
        content: {
          title: title,
          toc: [tocResult.toc],
          intro: introResult.intro,
          body: bodyResult.body,
          conclusion: conclusionResult.conclusion,
        },
        imagePrompts: imagePromptResult.imagePrompts,
        images: imagesResult.images,
        updatedContent: imagePromptResult.updatedContent || "",
      };
      const saveResult = await saveFinalResult(finalResult);
      updateLog(`Final result saved: ${JSON.stringify(saveResult)}`);
      
      updateLog("All steps completed.");
      console.log("All steps completed.");
    } catch (error) {
      updateLog(`Error during run all steps: ${error}`);
      console.error("Error during run all steps:", error);
    }
  };

  // Reset all states
  const handleResetStates = () => {
    setMainKeyword("");
    setPersonaServiceName("");
    setServiceType("");
    setServiceAdvantages("");
    setSubKeywordlist(null);
    setServiceAnalysis({
      industry_analysis: null,
      advantage_analysis: null,
      target_needs: null
    });
    setTitle("");
    setToc("");
    setIntro("");
    setBody("");
    setConclusion("");
    setUpdatedContent("");
    setImagePrompts([]);
    setImages([]);
    setDebugLogs([]);
    updateLog("States reset.");
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
            <div>
              <Label>Title</Label>
              <Input
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
              <Button onClick={handleSaveFinalResult}>Save Final Result</Button>
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
            <pre>Keyword: {mainkeyword}</pre>
            <pre>Persona Service Name: {personaServiceName}</pre>
            <pre>Service Type: {serviceType}</pre>
            <pre>Service Advantages: {serviceAdvantages}</pre>
            <pre>Service Analysis: {JSON.stringify(serviceAnalysis)}</pre>
            <pre>Title: {title}</pre>
            <pre>TOC: {toc}</pre>
            <pre>Intro: {intro}</pre>
            <pre>Body: {body}</pre>
            <pre>Conclusion: {conclusion}</pre>
            <pre>Updated Content: {updatedContent}</pre>
            <pre>Image Prompts: {imagePrompts.map((prompt)=> `${prompt.id} : ${prompt.prompt}\n`).join("")}</pre>
            <pre>Images: {images.map((image)=> `${image.id} : ${image.imageUrl}\n`).join("")}</pre>
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
