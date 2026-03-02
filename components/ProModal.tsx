import React, { useState } from "react";
import { ProData } from "../types";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProData) => void;
}

const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [temperature, setTemperature] = useState("");
  const [suctionCount, setSuctionCount] = useState("");
  const [stool, setStool] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      temperature: temperature.trim() || undefined,
      suctionCount: suctionCount.trim() || undefined,
      stool: stool.trim() || undefined,
      note: note.trim() || undefined,
      recordedAt: new Date(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-semibold text-slate-900">상태 기록 (PRO)</div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="text-[13px] text-slate-600 leading-relaxed">
            보호자 입력을 기반으로, 의료진에게 전달 가능한 요약 리포트(데모)를
            생성합니다.
          </div>

          <label className="block">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              체온
            </div>
            <input
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="예: 37.8"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              석션 횟수 (오늘)
            </div>
            <input
              value={suctionCount}
              onChange={(e) => setSuctionCount(e.target.value)}
              placeholder="예: 6"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              배변/설사 등
            </div>
            <input
              value={stool}
              onChange={(e) => setStool(e.target.value)}
              placeholder="예: 정상 / 묽음 / 혈변 의심"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>

          <label className="block">
            <div className="text-xs font-semibold text-slate-700 mb-1">
              추가 메모
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 밤에 알람이 2번 울렸고, 가래가 평소보다 진해요."
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </label>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            리포트 생성
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProModal;
