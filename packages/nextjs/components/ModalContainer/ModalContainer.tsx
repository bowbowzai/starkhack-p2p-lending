import React from "react";

const ModalContainer = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 bg-[#070817] flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-[#070817] rounded-lg p-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-white">
          &#x2716;
        </button>
        {children}
      </div>
    </div>
  );
};

export default ModalContainer;
