import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const HistoryModal = ({ isOpen, onClose, history, isLoading }) => {
  const modalRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Закрыть при клике вне модального окна
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Добавить обработчик события, только если модальное окно открыто
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Удалить обработчик события при закрытии модального окна
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const modalVariants = {
    hidden: { y: "100%" },
    visible: { y: 0 },
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < history.length - 1 ? prevIndex + 1 : prevIndex
    );
  };

  const currentItem = history[currentIndex];

  return (
    <motion.div
      initial="hidden"
      animate={isOpen ? "visible" : "hidden"}
      variants={modalVariants}
      transition={{ type: "spring", stiffness: 300, damping: 50 }}
      className="fixed bottom-0 left-0 w-full max-h-screen bg-black bg-opacity-90 backdrop-blur-md shadow-lg z-50 overflow-hidden"
      style={{ height: "65vh", minHeight: "300px" }}
    >
      <div ref={modalRef} className="relative h-full flex flex-col">
        {/* Кнопка закрытия */}
        <div className="flex justify-end py-2 px-6">
          <button
            onClick={onClose}
            className="text-white text-2xl font-bold focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="px-6 py-6 text-white flex flex-col items-center justify-between gap-8 font-montserrat">
          {isLoading ? (
            <div className="flex justify-center items-center mt-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : history.length > 0 ? (
            <>
              {/* Дата */}
              <p className="text-gray-200 text-center text-xl">
                {new Date(currentItem.date_of_create).toLocaleString()}
              </p>

              {/* Тип */}
              <p className="text-gray-200 text-xl text-center ">
                Тип: {currentItem.lemmatize_type}
              </p>

              {/* Слово и результат */}
              <div className="text-center flex flex-col items-center">
                <p className="text-white text-2xl font-montserrat font-semibold mb-1">
                  {currentItem.word}
                </p>
                <div className="text-gray-500 text-6xl">↓</div>
                <p className="text-white text-2xl font-montserrat font-semibold mt-1">{currentItem.result}</p>
              </div>

              {/* Навигация */}
              <div className="flex justify-between items-center w-full mt-4 mb-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="w-1/3 py-2 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  ← Назад
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === history.length - 1}
                  className="w-1/3 py-2 bg-gray-700 text-white rounded font-semibold hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Вперёд →
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-400">История пуста.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryModal;
