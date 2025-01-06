'use client'

import { useState } from "react";
import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveFeedback } from "../actions/others/saveFeedback";

export function Feedback( ) {
 
const [feedback, setFeedback] = useState(""); 

 const handleSaveFeedback = async () => {
    const result = await saveFeedback(feedback);
    setFeedback("");
  };

  return (
    <div className="h-full">
    <ResizablePanelGroup direction="horizontal">
    <ResizablePanel 
      defaultSize={20}  
      minSize={15}      
      maxSize={25}
      className="bg-gray-100 p-2 overflow-y-auto">
      <ul className="space-y-1 w-[150px]">
        <li>
        <a
          href="/title"
          className="block px-2 py-1 rounded-md hover:bg-gray-200  truncate"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          제목 생성
        </a>
        </li>
        <li>
        <a
          href="/feedback"
          className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
          style={{ backgroundColor: '#e5e7eb' }}
        >
          피드백
        </a>
        </li>
      </ul>
    </ResizablePanel>
       {/* 메인 피드백 영역 */}
       <ResizablePanel className="p-4 flex flex-col h-full">
          <h2 className="text-lg font-semibold mb-2">피드백</h2>
          <div className="flex-1 flex flex-col gap-4 h-full">
            <div className="flex-1">
              <Textarea
                className="h-full w-full !min-h-[200px] !h-[400px] resize-none border"
                placeholder={`더 나은 서비스를 위해 소중한 피드백 부탁드립니다!

피드백 예시
- 제목 생성성: '이 부분은 ~한 느낌이에요. ~하게 수정하면 좋을 것 같아요.''
- 사용성: '복사 붙여넣기가 잘 안 돼요. 개선 부탁드립니다.'`}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSaveFeedback}
              className="h-[50px] !bg-black !text-white"
            >
              피드백 전송
            </Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}


