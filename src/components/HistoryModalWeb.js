import React, { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Импортируйте стили для toast

const HistoryModal = ({ isOpen, onClose, history, isLoading, setHistory }) => {
  const [filterType, setFilterType] = useState("all"); // Фильтр: "all" или конкретный вариант
  const [sortAscending, setSortAscending] = useState(true); // Сортировка по дате
  const [currentPage, setCurrentPage] = useState(1); // Текущая страница
  const itemsPerPage = 5; // Количество записей на странице

  if (!isOpen) return null;

  // Маппинг для преобразования типа лемматизации
  const lemmatizeTypeMapping = {
    NOUN: "Существительное",
    VERB: "Глагол",
    AUX: "Вспомогательный глагол",
    ADJ: "Прилагательное",
    PRON: "Местоимение",
    NUM: "Числительное",
    ANUM: "Порядковое числительное",
    PROPN: "Имя собственное",
    DET: "Детерминатив",
    PART: "Частица",
    ADV: "Наречие",
    ADVPRO: "Местоименное наречие",
    ADP: "Предлог",
    SYM: "Символ",
    CCONJ: "Сочинительный союз",
    SCONJ: "Подчинительный союз",
    INTJ: "Междометие",
    PRED: "Предикатив",
    PARENTH: "Вводное слово",
    COM: "COM",
    PUNCT: "Знак препинания",
  };

  // Функция для фильтрации на основе выбранного типа
  const filterHistory = () => {
    switch (filterType) {
      case "part_of_speech_specified":
        return history.filter(
          (item) =>
            item.lemmatize_type === 1 &&
            lemmatizeTypeMapping[item.selected_option]
        );
      case "part_of_speech_unspecified":
        return history.filter(
          (item) =>
            item.lemmatize_type === 1 &&
            !lemmatizeTypeMapping[item.selected_option]
        );
      case "whole_sentence":
        return history.filter(
          (item) =>
            item.lemmatize_type === 2 &&
            (item.selected_option === "All" || item.selected_option === "")
        );
      case "word_from_sentence":
        return history.filter(
          (item) =>
            item.lemmatize_type === 2 &&
            item.selected_option !== "All" &&
            item.selected_option !== ""
        );
      default:
        return history; // "all" — возвращаем все записи
    }
  };

  // Применяем фильтр и сортируем
  const filteredHistory = filterHistory();
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.date_of_create);
    const dateB = new Date(b.date_of_create);
    return sortAscending ? dateA - dateB : dateB - dateA;
  });

  // Пагинация
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);

  // Преобразование selected_option
  const transformSelectedOption = (item) => {
    if (item.lemmatize_type === 1) {
      return "Часть речи: " + (lemmatizeTypeMapping[item.selected_option] || "не указано");
    }

    if (item.lemmatize_type === 2) {
      return item.selected_option === "All" || item.selected_option === ""
        ? "Все предложение"
        : "Слово из предложения";
    }

    return item.selected_option;
  };

  // Функция для удаления истории
  const deleteHistoryRecord = async (historyId) => {
    try {
      const response = await fetch(`https://lemmaapp.ru/server1/history/${historyId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      
      if (response.status === 200) {
        setHistory((prevHistory) => prevHistory.filter((item) => item.id !== historyId));
        toast.success('Запись успешно удалена!', {
          position: "top-right", 
        });
      } else {
        toast.error(`Ошибка при удалении записи: ${responseData.detail || 'Неизвестная ошибка'}`, {
          position: "top-right", 
        });
      }
    } catch (error) {
      toast.error('Ошибка при удалении записи', {
        position: "top-right", 
      });
    }
  };
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
        <h2 className="text-xl font-bold mb-4">История</h2>

        {/* Фильтры и сортировка */}
        <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="all">Все</option>
            <option value="part_of_speech_specified">Часть речи указана</option>
            <option value="part_of_speech_unspecified">Часть речи не указана</option>
            <option value="whole_sentence">Все предложение</option>
            <option value="word_from_sentence">Слово из предложения</option>
          </select>

          <button
            onClick={() => setSortAscending(!sortAscending)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Сортировать по дате: {sortAscending ? "▲" : "▼"}
          </button>
        </div>

        {/* История */}
        {isLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : currentItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="border border-gray-300 p-2">Слово</th>
                  <th className="border border-gray-300 p-2">Тип лемматизации</th>
                  <th className="border border-gray-300 p-2">Результат</th>
                  <th className="border border-gray-300 p-2">Дата</th>
                  <th className="border border-gray-300 p-2">Удалить</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.id} className="odd:bg-white even:bg-gray-100 text-sm sm:text-base">
                    <td className="border border-gray-300 p-2">{item.word}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      {transformSelectedOption(item)}
                    </td>
                    <td className="border border-gray-300 p-2">{item.result}</td>
                    <td className="border border-gray-300 p-2">
                      {new Date(item.date_of_create).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => deleteHistoryRecord(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>История пуста.</p>
        )}

        {/* Пагинация */}
        <div className="flex justify-center items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className={`px-4 py-2 mx-1 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Назад
          </button>

          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-4 py-2 mx-1 rounded ${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`}
            >
              {index + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className={`px-4 py-2 mx-1 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            Вперед
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default HistoryModal;
