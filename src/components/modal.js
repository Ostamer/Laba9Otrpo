import React from "react";

const Modal = ({ isOpen, closeModal, modalMode, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-[90%] sm:w-[70%] md:w-[50%] lg:w-[40%] xl:w-[30%] h-auto p-6 sm:p-8 rounded-lg shadow-lg relative overflow-hidden">
        {/* Кнопка закрытия */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-2xl sm:text-3xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>

        {/* Заголовок */}
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">
            {modalMode === "login" ? "Авторизация" : "Регистрация"}
          </h2>
        </div>

        {/* Контейнер для содержимого */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
