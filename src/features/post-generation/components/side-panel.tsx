'use client'

import { useState } from "react";
import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export function SidePanel( ) {
 
  return (
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={15}
          className="p-2 overflow-y-auto"
        >
          <ul className="space-y-1">
            <li>
              <a
                href="/title"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                제목 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/trafficcontent"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                정보성글 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/brandcontent"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                브랜딩글 ㅊㅊ
              </a>
            </li>
            <li>
              <a
                href="/mypage"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                마이페이지
              </a>
            </li>
            <li>
              <a
                href="/feedback"
                className="block px-2 py-1 rounded-md hover:bg-gray-200 truncate"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                피드백
              </a>
            </li>
          </ul>
        </ResizablePanel>
  );
}


