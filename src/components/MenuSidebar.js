import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import HistoryModal from './HistoryModalTg'; // Импортируем компонент модального окна истории
import { fetchHistory } from "./api";

const MenuSidebar = ({ isOpen, onClose }) => {
    const sidebarRef = useRef();
    const [user, setUser] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Состояние для открытия модального окна истории
    const [history, setHistory] = useState([]); // История запросов
    const [isLoading, setIsLoading] = useState(false); // Состояние загрузки

    useEffect(() => {
        const userData = window.userData;
        if (userData) {
            setUser(userData);
        } else {
            console.error('Нет данных о пользователе.');
        }
    }, [isOpen]);

    // Обработчик для открытия модального окна истории
    const handleHistoryClick = async () => {
        setIsLoading(true); // Устанавливаем флаг загрузки
        try {
            await fetchHistory(setHistory); // Получаем историю
            setIsHistoryOpen(true); // Открываем модальное окно
        } catch (error) {
            console.error("Ошибка при загрузке истории:", error);
        } finally {
            setIsLoading(false); // Сбрасываем флаг загрузки
        }
    };
    
    // Анимации для бокового меню
    const sidebarVariants = {
        hidden: { y: '100%' },
        visible: { y: 0 },
    };

    const avatarUrl = user?.photoUrl || null;

    return (
        <>
            <motion.div
                ref={sidebarRef}
                initial="hidden"
                animate={isOpen ? "visible" : "hidden"}
                variants={sidebarVariants}
                transition={{ type: 'spring', stiffness: 300, damping: 50 }}
                className="fixed bottom-0 left-0 w-full max-h-screen bg-black bg-opacity-90 backdrop-blur-md shadow-lg z-50 overflow-hidden"
                style={{ height: '65vh', minHeight: '300px' }}
            >
                <div className="flex justify-end py-3 px-6">
                    <button
                        onClick={onClose}
                        className="text-white text-2xl font-bold focus:outline-none"
                    >
                        ✕
                    </button>
                </div>

                <div className="font-montserrat px-4 text-white flex flex-col items-center justify-between" style={{ height: '85%' }}>
                    {/* Аватар пользователя */}
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Аватар пользователя"
                            className="rounded-full"
                            style={{ width: '40%', aspectRatio: '1/1', objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            className="rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white"
                            style={{ width: '40%', aspectRatio: '1/1' }}
                        >
                            Фото
                        </div>
                    )}

                    {/* Имя пользователя */}
                    <p
                        className="font-semibold text-center mt-4"
                        style={{ fontSize: 'clamp(1rem, 7.5vw, 2rem)' }}
                    >
                        {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.firstName || user?.lastName || "Фамилия Имя"}
                    </p>

                    {/* Кнопка для открытия истории */}
                    <div className="w-full px-6 mt-4">
                        <button
                            className="bg-white text-black w-full py-4 rounded-full text-xl font-bold hover:bg-gray-300 transition"
                            onClick={handleHistoryClick} // Открыть модальное окно истории
                        >
                            История
                        </button>
                    </div>

                    {/* Подписи и информация о разработчиках */}
                    <div className="w-full text-center text-sm opacity-75 pb-4">
                        <p>Разработано при поддержке НКРЯ</p>
                        <p>
                            Аналитик: <a href="https://vk.com/evgen_k45" target="_blank" className="underline">Evgeshkins</a> |
                            Разработчик: <a href="https://vk.com/sagadeev0" target="_blank" className="underline">Ostamer</a>
                        </p>
                        <p>Email: lemmatize@gmail.com</p>
                        <p>ТюмГУ 2024 год</p>
                    </div>
                </div>
            </motion.div>

            {/* Модальное окно истории */}
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                isLoading={isLoading}
            />
        </>
    );
};

export default MenuSidebar;
