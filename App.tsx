// src/App.tsx
import React, { useState, useEffect } from "react";
import { PatientData, DANGER_DATA, SAFE_DATA, ScreenName } from "./types";
import Layout from "./components/Layout";
import Modal from "./components/Modal";
import EmrScreen from "./components/screens/EmrScreen";
import TriageScreen from "./components/screens/TriageScreen";
import VentilatorScreen from "./components/screens/VentilatorScreen";

const App: React.FC = () => {
  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("emr");

  // Main App State
  const [simulationMode, setSimulationMode] = useState<"danger" | "safe">(
    "danger"
  );
  const [patientData, setPatientData] = useState<PatientData>(DANGER_DATA);
  const [modalOpen, setModalOpen] = useState(false);

  // Simulation Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (simulationMode === "danger") {
      // Danger Mode: Fluctuate between 88 and 89
      setPatientData(DANGER_DATA);
      interval = setInterval(() => {
        setPatientData((prev) => ({
          ...prev,
          spo2: prev.spo2 === 88 ? 89 : 88,
        }));
      }, 2000);
    } else {
      // Safe Mode: Sequence 98 -> ... -> 96
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

  const togglePatientStatus = () => {
    setSimulationMode((prev) => (prev === "danger" ? "safe" : "danger"));
  };

  const navigateTo = (screen: ScreenName) => {
    if (screen === "pro") {
      setModalOpen(true);
      return;
    }
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "emr":
        return (
          <EmrScreen
            patientData={patientData}
            onToggleStatus={togglePatientStatus}
            onNavigate={navigateTo}
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
            onToggleStatus={togglePatientStatus}
            onNavigate={navigateTo}
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
