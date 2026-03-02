import React, { useState, useEffect } from "react";
import {
  PatientData,
  DANGER_DATA,
  SAFE_DATA,
  ScreenName,
  ProData,
} from "./types";

import Layout from "./components/Layout";
import EmrScreen from "./components/screens/EmrScreen";
import TriageScreen from "./components/screens/TriageScreen";
import VentilatorScreen from "./components/screens/VentilatorScreen";
import ReportScreen from "./components/screens/ReportScreen";
import ProModal from "./components/ProModal";

/* ------------------------------
   랜덤 환아 이름 생성
-------------------------------- */
const CHILD_NAMES = [
  "민준",
  "서연",
  "도윤",
  "지우",
  "하준",
  "하린",
  "은우",
  "지아",
  "시우",
  "유진",
];

const pickRandomName = () => {
  const idx = Math.floor(Math.random() * CHILD_NAMES.length);
  return CHILD_NAMES[idx];
};

/* ------------------------------
   메인 App
-------------------------------- */
const App: React.FC = () => {
  /* 화면 상태 */
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("emr");

  /* 환아 이름 */
  const [childName, setChildName] = useState<string>(pickRandomName());

  /* 시뮬레이션 상태 */
  const [simulationMode, setSimulationMode] = useState<"danger" | "safe">(
    "safe",
  );

  /* 환자 데이터 */
  const [patientData, setPatientData] = useState<PatientData>(SAFE_DATA);

  /* PRO 모달 상태 */
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  /* PRO 입력 결과 */
  const [proData, setProData] = useState<ProData | null>(null);

  /* ------------------------------
     시뮬레이션 상태 변경 반영
  -------------------------------- */
  useEffect(() => {
    if (simulationMode === "danger") {
      setPatientData(DANGER_DATA);
    } else {
      setPatientData(SAFE_DATA);
    }
  }, [simulationMode]);

  /* ------------------------------
     환자 상태 토글
  -------------------------------- */
  const togglePatientStatus = () => {
    setSimulationMode((prev) => (prev === "safe" ? "danger" : "safe"));
  };

  /* ------------------------------
     환아 이름 랜덤 변경
  -------------------------------- */
  const handleRandomizeChild = () => {
    setChildName(pickRandomName());
  };

  /* ------------------------------
     화면 이동 로직
  -------------------------------- */
  const navigateTo = (screen: ScreenName) => {
    if (screen === "pro") {
      setModalOpen(true);
      return;
    }
    setCurrentScreen(screen);
  };

  /* ------------------------------
     화면 렌더링
  -------------------------------- */
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

      case "report":
        return proData ? (
          <ReportScreen
            patientData={patientData}
            childName={childName}
            proData={proData}
            onBack={() => navigateTo("emr")}
          />
        ) : (
          <EmrScreen
            patientData={patientData}
            childName={childName}
            onToggleStatus={togglePatientStatus}
            onNavigate={navigateTo}
            onRandomizeChild={handleRandomizeChild}
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

  /* ------------------------------
     최종 렌더링
  -------------------------------- */
  return (
    <Layout activeScreen={currentScreen} onNavigate={navigateTo}>
      {renderScreen()}

      {/* PRO 입력 모달 */}
      <ProModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => {
          setProData(data);
          setModalOpen(false);
          setCurrentScreen("report");
        }}
      />
    </Layout>
  );
};

export default App;
