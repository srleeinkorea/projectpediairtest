// src/App.tsx
import React, { useState, useEffect } from "react";
import {
  PatientData,
  DANGER_DATA,
  SAFE_DATA,
  ScreenName,
} from "./types";
import Layout from "./components/Layout";
import Modal from "./components/Modal";
import EmrScreen from "./components/screens/EmrScreen";
import TriageScreen from "./components/screens/TriageScreen";
import VentilatorScreen from "./components/screens/VentilatorScreen";

// 아기 이름 후보
const CHILD_NAME_CANDIDATES = [
  "수빈이",
  "민성이",
  "지우",
  "하린이",
  "도윤이",
  "유진이",
  "서준이",
  "예린이",
];

// 현재 이름(exclude)과 다른 랜덤 이름 뽑기
const pickRandomName = (exclude?: string) => {
  if (CHILD_NAME_CANDIDATES.length === 0) return "우리 아이";

  let name =
    CHILD_NAME_CANDIDATES[
      Math.floor(Math.random() * CHILD_NAME_CANDIDATES.length)
    ];

  if (exclude && CHILD_NAME_CANDIDATES.length > 1) {
    while (name === exclude) {
      name =
        CHILD_NAME_CANDIDATES[
          Math.floor(Math.random() * CHILD_NAME_CANDIDATES.length)
        ];
    }
  }
  return name;
};

const App: React.FC = () => {
  // 네비게이션 상태
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("emr");

  // 현재 아기 이름
  const [childName, setChildName] = useState<string>(() =>
    pickRandomName(),
  );

  // 플러스 버튼 눌렀을 때 이름만 랜덤 변경
  const handleRandomizeChild = () => {
    setChildName((prev) => pickRandomName(prev));
  };

  // 메인 시뮬레이션 상태
  const [simulationMode, setSimulationMode] =
    useState<"danger" | "safe">("danger");
  const [patientData, setPatientData] =
    useState<PatientData>(DANGER_DATA);
  const [modalOpen, setModalOpen] = useState(false);

  // SPO2 시뮬레이션 로직
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (simulationMode === "danger") {
      // Danger Mode: 88 ↔ 89 반복
      setPatientData(DANGER_DATA);
      interval = setInterval(() => {
        setPatientData((prev) => ({
          ...prev,
          spo2: prev.spo2 === 88 ? 89 : 88,
        }));
      }, 2000);
    } else {
      // Safe Mode: 98 → 93 → 96 등 시퀀스
      const sequence = [98, 97, 96, 94, 93, 93, 93, 94, 95, 96];
      let step = 0;
      setPatientData({ ...SAFE_DATA, spo2: 98 });

      interval = setInterval(() => {
        if (step < sequence.length) {
          setPatientData((prev) => ({
            ...prev,
            spo2: sequence[step],
          }));
          step++;
        } else {
          setPatientData((prev) => ({
            ...prev,
            spo2: prev.spo2 === 96 ? 97 : 96,
          }));
        }
      }, 1200);
    }

    return () => clearInterval(interval);
  }, [simulationMode]);

  // 위험/안전 토글 (EmrScreen에서 호출)
  const togglePatientStatus = () => {
    setSimulationMode((prev) =>
      prev === "danger" ? "safe" : "danger",
    );
  };

  // 화면 전환
  const navigateTo = (screen: ScreenName) => {
    if (screen === "pro") {
      setModalOpen(true); // PRO는 모달로 처리
      return;
    }
    setCurrentScreen(screen);
  };

  // 현재 화면 렌더링
  const renderScreen = () => {
    switch (currentScreen) {
      case "emr":
        return (
          <EmrScreen
            patientData={patientData}
            childName={childName}
            onToggleStatus={togglePatientStatus}
            onNavigate={navigateTo}
            onRandomizeChild={handleRandomizeChild}
          />
        );
      case "triage":
        return (
          <TriageScreen
            patientData={patientData}
            onBack={() => navigateTo("emr")}
            onNavigate={navigateTo}
          />
        );
      case "ventilator":
        return (
          <VentilatorScreen
            patientData={patientData}
            onBack={() => navigateTo("emr")}
          />
        );
      default:
        return (
          <EmrScreen
            patientData={patientData}
            childName={childName}
            onToggleStatus={togglePatientStatus}
            onNavigate={navigateTo}
            onRandomizeChild={handleRandomizeChild}
          />
        );
    }
  };

  return (
    <Layout
      activeScreen={currentScreen}
      onNavigate={navigateTo}
    >
      {renderScreen()}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="상태 기록 (PRO)"
        message="체온, 석션 횟수, 배변 양상 등을 기록하여 의료진과 공유합니다. (준비 중)"
      />
    </Layout>
  );
};

export default App;
