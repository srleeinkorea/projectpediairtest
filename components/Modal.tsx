import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-11/12 max-w-sm transform transition-all scale-100">
        <h4 className="text-lg font-bold text-gray-800 mb-3">{title}</h4>
        <p className="text-gray-700 whitespace-pre-line text-sm">{message}</p>
        <button 
          onClick={onClose} 
          className="mt-5 w-full py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default Modal;