// index.tsx (루트 엔트리)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// 콘솔에 찍어서 엔트리 실행 여부 확인
console.log("index.tsx 실행됨");

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("#root 엘리먼트를 찾을 수 없습니다.");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
