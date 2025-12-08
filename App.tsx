// src/App.tsx
import React, { useState, useEffect } from "react";
import { PatientData, DANGER_DATA, SAFE_DATA, ScreenName } from "./types";
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
  const [childName, setChildName] = useState<string>(() => pickRandomName());

  const handleRandomizeChild = () => {
    setChildName((prev) => pickRandomName(prev));
  };

  // 🔹 시뮬레이션 모드: 3단계 (danger / warning / safe)
  const [simulationMode, setSimulationMode] = useState<
    "danger" | "warning" | "safe"
  >("danger");

  const [patientData, setPatientData] = useState<PatientData>(DANGER_DATA);

  const [modalOpen, setModalOpen] = useState(false);

  // 🔹 SPO2 시뮬레이션 로직 (모드별)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (simulationMode === "danger") {
      // Danger Mode: 88 ↔ 89 반복 (응급 경고 느낌)
      setPatientData(DANGER_DATA);
      interval = setInterval(() => {
        setPatientData((prev) => ({
          ...prev,
          spo2: prev.spo2 === 88 ? 89 : 88,
        }));
      }, 2000);
    } else if (simulationMode === "warning") {
      // Warning Mode: 93~91 사이에서 왔다갔다 (주의 신호)
      const warningSequence = [93, 92, 91, 92, 93, 93];
      let step = 0;

      setPatientData((prev) => ({
        ...SAFE_DATA,
        spo2: warningSequence[0],
      }));

      interval = setInterval(() => {
        step = (step + 1) % warningSequence.length;
        setPatientData((prev) => ({
          ...prev,
          spo2: warningSequence[step],
        }));
      }, 1500);
    } else {
      // Safe Mode: 98~95 범위에서 안정적으로 오르내리는 패턴
      const sequence = [98, 97, 96, 95, 96, 97, 98];
      let step = 0;

      setPatientData({ ...SAFE_DATA, spo2: sequence[0] });

      interval = setInterval(() => {
        step = (step + 1) % sequence.length;
        setPatientData((prev) => ({
          ...prev,
          spo2: sequence[step],
        }));
      }, 1200);
    }

    return () => clearInterval(interval);
  }, [simulationMode]);

  //    화면 이동 없음 (위험도 배지만 변경)
  const togglePatientStatus = () => {
    setSimulationMode((prev) =>
      prev === "danger" ? "warning" : prev === "warning" ? "safe" : "danger"
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
    <Layout activeScreen={currentScreen} onNavigate={navigateTo}>
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
