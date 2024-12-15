import React from 'react';
import { motion } from 'framer-motion';
import back_ground_image from '../images/back_ground.jpg'; 
import close from '../images/x1.png';

const QuestionScreen = ({ onClose }) => {
  const animation = {
    hidden: { opacity: 0, y: -100 }, 
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      className="absolute font-montserrat inset-0 bg-gray-700 flex flex-col bg-opacity-85 items-center justify-center z-40 rounded-b-3xl"
      initial="hidden"
      animate="visible"
      variants={animation} 
      transition={{ duration: 0.1 }} 
    >
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      <div className="relative text-white w-full text-center px-4">
        <h1 className="text-2xl font-bold">Вас приветствует сервис</h1>
        <h2 className="text-2xl font-bold">НейроЛемма</h2>
        <p className="mt-2 text-m">
        Выберите режим (слово или предложение), введите текст и выберите часть речи или слово для лемматизации. Если вы хотите обработать весь текст, просто выберите "Всё предложение". 
        </p>
      </div>
      <button onClick={onClose}>
        <img 
          src={close} 
          alt="Close" 
          className="absolute fixed bottom-7 mb-5 left-1/2 transform -translate-x-1/2 h-7 w-7 rounded-lg cursor-pointer mt-4" 
        />
      </button>
    </motion.div>
  );
};

export default QuestionScreen;
