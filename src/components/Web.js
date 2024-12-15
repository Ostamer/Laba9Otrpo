import React, { useState, useEffect } from "react";
import {
  fetchDataFromAPI,
} from "./api";
import { fetchHistory } from "./api";
import question_icon from "../images/question.png";
import menu_icon from "../images/menu.png";
import logo_icon from "../images/logo.png";
import swap_arrows_icon from "../images/swap_arrow.png";
import button_icon from "../images/button2.png";
import Modal from "../components/modal";
import HistoryModal from "../components/HistoryModalWeb";
import { toast } from 'react-toastify';


function Web() {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [result, setResult] = useState("");
  const [isRotating, setIsRotating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("login");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false); // Флаг загрузки истории
  const [selectedFile, setSelectedFile] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setDownloadUrl(null); // Убираем предыдущую ссылку на скачивание
    setError(null); // Убираем предыдущие ошибки
  };

  const handleClear = () =>{
    setInputValue("");
    setSelectedOption("");
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError("Выберите файл перед загрузкой.");
      return;
    }

    if (!selectedFile.name.endsWith(".conllu")) {
      setError("Поддерживаются только файлы в формате .conllu.");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("https://lemmaapp.ru/process_conllu", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }

      const result = await response.json();

      // Создаем Blob для скачивания файла
      const blob = new Blob([result.updated_file], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      setError("Ошибка при обработке файла. Пожалуйста, попробуйте снова.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSwapClick = () => {
    if (!isProcessing) {
      setMode((prev) => (prev === 1 ? 2 : 1));
      setSelectedOption("");
    }
  };

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const partsOfSpeech = [
    "-",
    "Существительное",
    "Глагол",
    "Вспомогательный глагол",
    "Прилагательное",
    "Местоимение",
    "Числительное",
    "Порядковое числительное",
    "Имя собственное",
    "Детерминатив",
    "Частица",
    "Наречие",
    "Местоименное наречие",
    "Предлог",
    "Символ",
    "Сочинительный союз",
    "Подчинительный союз",
    "Междометие",
    "Предикатив",
    "Вводное слово",
    "COM",
    "Знак препинания",
  ];

  const options =
    mode === 1
      ? partsOfSpeech
      : [...inputValue.split(" ").filter(Boolean), "Всё предложение"];

    const handleButtonClick = async () => {
      try {
          // Проверка: inputValue не пустая строка и содержит только буквы русского алфавита
          if (!inputValue.trim()) {
              toast.error("Поле ввода не должно быть пустым", {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  theme: "colored",
              });
              return; // Прерываем выполнение функции, если строка пустая
          }
  
          if (!/^[А-Яа-яЁё\s]+$/.test(inputValue.trim())) {
              toast.error("Поле ввода должно содержать только буквы русского алфавита", {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  theme: "colored",
              });
              return; // Прерываем выполнение функции, если найдены недопустимые символы
          }
  
          // Условие для проверки: mode = 1, input_value более одного слова и selected_option не в разрешенном списке
          const invalidOptions = [
              'Числительное', 'Частица', 'Составной предлог', 'Сочинительный союз',
              'Подчинительный союз', 'Междометие', 'Вводное слово'
          ];
  
          if (mode === 1 && inputValue.trim().split(' ').length > 1 && !invalidOptions.includes(selectedOption)) {
              // Показываем toast с предупреждением, если условие не выполняется
              toast.error("Для выбранной части речи можно ввести только одно слово", {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  theme: "colored",
              });
              return; // Прерываем выполнение функции, если условие не выполнено
          }
  
          setIsProcessing(true);
          setIsRotating(true);
          const token = localStorage.getItem("token");
  
          const data = await fetchDataFromAPI(mode, selectedOption, inputValue, token);
          console.log(selectedOption);
          setResult(data);
      } catch (error) {
          setResult("Ошибка при запросе");
      } finally {
          setIsProcessing(false);
          setIsRotating(false);
      }
  };
    

  const openModal = (mode) => {
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSwitchForm = () => {
    setModalMode((prevMode) => (prevMode === "login" ? "register" : "login"));
  };
  // Функция авторизации пользователя
  const handleLogin = async (login, password) => {
    const controller = new AbortController(); // Создаем AbortController
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Таймер на 5 секунд для прерывания запроса
  
    try {
      const response = await fetch("https://lemmaapp.ru/server1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, password }),  // Параметры передаются в теле запроса в формате JSON
        signal: controller.signal  // Передаем сигнал для AbortController
      });
  
      clearTimeout(timeoutId);  // Очищаем таймер, если запрос завершился вовремя
  
      const data = await response.json();
  
      if (response.ok) {
        localStorage.setItem("token", data.access_token);  // Сохраняем токен в localStorage
        setIsLoggedIn(true);
        closeModal();
        // Уведомление об успешном входе
        toast.success("Авторизация прошла успешно!", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      } else {
        // Уведомление об ошибке
        toast.error(data.detail || "Ошибка авторизации", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Уведомление о тайм-ауте запроса
        toast.error("Сервер не отвечает. Попробуйте снова позже.", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      } else {
        // Уведомление об ошибке при запросе
        console.error("Ошибка авторизации:", error);
        toast.error("Произошла ошибка при авторизации", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      }
    }
  };
  
  // Функция регистрации пользователя
  const handleRegister = async (name, surname, login, password) => {
    const controller = new AbortController(); // Создаем AbortController
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Таймер на 5 секунд для прерывания запроса

    try {
      const response = await fetch("https://lemmaapp.ru/server1/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, surname, login, password }),
        signal: controller.signal  // Передаем сигнал для AbortController
      });

      clearTimeout(timeoutId);  // Очищаем таймер, если запрос завершился вовремя

      const data = await response.json();

      if (response.ok) {
        // Уведомление об успешной регистрации
        toast.success("Регистрация успешна! Теперь вы можете войти.", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
        setModalMode("login"); // Переключаемся на форму входа
      } else {
        // Проверяем на специфическую ошибку
        if (data.detail === "Пользователь с таким логином уже существует") {
          toast.error("Пользователь с таким логином уже существует. Выберите другой логин.", {
            position: "top-right", 
            autoClose: 5000,
            theme: "colored",
          });
        } else {
          toast.error(data.detail || "Ошибка регистрации", {
            position: "top-right", 
            autoClose: 5000,
            theme: "colored",
          });
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Уведомление о тайм-ауте запроса
        toast.error("Сервер не отвечает. Попробуйте снова позже.", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      } else {
        // Уведомление об ошибке при регистрации
        console.error("Ошибка регистрации:", error);
        toast.error("Произошла ошибка при регистрации", {
          position: "top-right", 
          autoClose: 5000,
          theme: "colored",
        });
      }
    }
  };


  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setHistory([]);
  };

  const openHistoryModal = async () => {
    setIsHistoryModalOpen(true); // Открываем окно сразу
    setIsHistoryLoading(true); // Устанавливаем флаг загрузки
    try {
      await fetchHistory(setHistory);
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
    } finally {
      setIsHistoryLoading(false); // Сбрасываем флаг загрузки
    }
  };

  const closeHistoryModal = () => {
    setIsHistoryModalOpen(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <header className="bg-white border-b shadow-sm w-full">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center lg:w-[80%] w-full">
          <div className="flex items-center gap-2">
            <img src={logo_icon} alt="logo" className="w-20 md:w-28 h-auto" />
            <p className="font-montserrat font-bold text-xl md:text-2xl ml-2 hidden sm:block">
              НейроЛемма
            </p>
          </div>
          <nav className="space-x-4 text-gray-1000 text-xl md:text-2xl flex items-center gap-2 md:gap-5">
            {isLoggedIn ? (
              <>
                <button onClick={openHistoryModal} className="hover:text-gray-700">
                  История
                </button>
                <button onClick={handleLogout} className="hover:text-gray-700">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openModal("login")} className="hover:text-gray-700">
                  Вход
                </button>
                <button onClick={() => openModal("register")} className="hover:text-gray-700">
                  Регистрация
                </button>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Модальное окно истории */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={closeHistoryModal}
        history={history}
        isLoading={isHistoryLoading} // Передаем флаг загрузки
        setHistory={setHistory} // Функция для обновления истории, если нужно
      />

      {/* Модальное окно */}
      <Modal isOpen={isModalOpen} closeModal={closeModal} modalMode={modalMode}>
        {modalMode === "login" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const login = e.target.login.value;
              const password = e.target.password.value;
              handleLogin(login, password);
            }}
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="login">
                Логин
              </label>
              <input
                type="text"
                id="login"
                name="login"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleSwitchForm}
                className="text-blue-500 hover:underline"
              >
                Регистрация
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Войти
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value;
              const surname = e.target.surname.value;
              const login = e.target.login.value;
              const password = e.target.password.value;
              handleRegister(name, surname, login, password);
            }}
          >
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Имя
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="surname">
                Фамилия
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="login">
                Логин
              </label>
              <input
                type="text"
                id="login"
                name="login"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Пароль
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                required
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleSwitchForm}
                className="text-blue-500 hover:underline"
              >
                Вход
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        )}
      </Modal>
 

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 lg:py-12 text-center lg:w-[80%] w-full">
        <div className="flex flex-col pb-4 border-b border-gray-300">
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 mb-4">Лемматизация слов</h2>
          <p className="text-gray-600 text-xl lg:text-2xl mb-8">Сгенерируйте лемму для вашего текста</p>
        </div>

        <div className="py-5 px-2 mb-16 shadow-sm flex flex-col lg:flex-row items-center gap-24 border-b border-gray-300">
          {/* Левая панель */}
          <div className="flex flex-col mb-8 w-full lg:w-1/2 gap-12">
            <div className="flex flex-col items-center gap-4 mt-8">
              <p className="font-montserrat text-2xl lg:text-3xl font-semibold text-black">
                Выберите режим
              </p>
              <div className="flex items-center gap-8 lg:gap-12">
                <button
                  onClick={() => setMode(1)}
                  disabled={isProcessing} // Блокируем кнопку, если идет лемматизация
                  className={`${
                    mode === 1
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } px-4 py-2 lg:px-6 lg:py-2 rounded-3xl font-semibold text-lg lg:text-2xl shadow-md hover:bg-blue-600 transition-colors`}
                >
                  Слово
                </button>
                <button
                  onClick={handleSwapClick}
                  disabled={isProcessing} // Блокируем кнопку, если идет лемматизация
                  className="flex items-center justify-center bg-gray-200 p-2 rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <img src={swap_arrows_icon} alt="swap" className="w-4 h-4 lg:w-6 lg:h-6 min-w-4 min-h-4 lg:min-w-6 lg:min-h-6" />
                </button>
                <button
                  onClick={() => setMode(2)}
                  disabled={isProcessing} // Блокируем кнопку, если идет лемматизация
                  className={`${
                    mode === 2
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700"
                  } px-4 py-2 lg:px-6 lg:py-2 rounded-3xl font-semibold text-lg lg:text-2xl shadow-md hover:bg-blue-600 transition-colors`}
                >
                  Предложение
                </button>
              </div>
            </div>

            <div className="mt-6 max-w-xl w-full mx-auto flex flex-col gap-16">
              <div className="w-full flex-col gap-12">
                <p className="font-montserrat font-bold text-2xl lg:text-3xl mb-2 text-black">
                  {mode === 1 ? "Ваше слово" : "Ваше предложение"}
                </p>
                <div className="w-full bg-white text-black py-4 rounded-xl flex items-center px-4 lg:px-6 shadow-md border border-gray-300">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Введите слово или предложение"
                    className="w-full bg-transparent outline-none text-lg lg:text-2xl"
                  />
                </div>
              </div>

              <div className="">
                <p className="font-montserrat font-bold text-2xl lg:text-3xl mb-2 text-black">
                  {mode === 1 ? "Часть речи" : "Выбранное слово"}
                </p>
                <div className="w-full bg-white text-black py-4 rounded-xl shadow-md flex items-center px-4 lg:px-6 border border-gray-300">
                  <select
                    value={selectedOption}
                    onChange={handleSelectChange}
                    className="w-full bg-transparent border-none outline-none text-lg lg:text-2xl"
                  >
                    <option value="" disabled>
                      {mode === 1
                        ? "Не выбрана часть речи"
                        : "Не выбрано слово"}
                    </option>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 max-w-xl w-full mx-auto flex justify-center gap-20">
              <button
                onClick={handleButtonClick}
                className={`bg-green-500 text-white px-6 lg:px-8 py-3 rounded-3xl font-semibold text-lg lg:text-2xl shadow-md hover:bg-green-600 transition-colors ${
                  isRotating ? "animate-spin" : ""
                }`}
              >
                Обработать
              </button>
              <button
                onClick={handleClear}
                disabled={isProcessing}
                className={`bg-gray-500 text-white px-6 lg:px-8 py-3 rounded-3xl font-semibold text-lg lg:text-2xl shadow-md hover:bg-gray-700 transition-colors`}
              >
                Очистить
              </button>
            </div>
            

            <div className="mt-6 mb-4 max-w-xl w-full mx-auto">
              <p className="font-montserrat font-bold text-2xl lg:text-3xl mb-2 text-black">
                Результат
              </p>
              <div className="w-full bg-white text-black py-4 rounded-xl flex items-center px-4 lg:px-6 shadow-md border border-gray-300">
                <input
                  type="text"
                  value={result}
                  readOnly
                  placeholder="Лемматизированный результат"
                  className="w-full bg-transparent outline-none text-xl lg:text-2xl"
                />
              </div>
            </div>
          </div>

          {/* Правая панель с загрузкой файла */}
          <div className="w-full mb-6 lg:w-1/2">
            <div className="w-full">
              <p className="font-montserrat font-bold text-2xl lg:text-3xl mb-2 text-black">
                Или загрузите файл
              </p>
              <label className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-6 lg:py-8 cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors">
                <input
                  type="file"
                  accept=".conllu"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <span className="text-blue-500 font-semibold text-lg lg:text-3xl">
                  Нажмите, чтобы выбрать файл
                </span>
                <span className="text-gray-500 text-sm lg:text-xl mt-2">
                  Поддерживаемые форматы: .conllu
                </span>
              </label>

              {selectedFile && (
                <p className="mt-2 text-sm text-gray-700">
                  Выбранный файл: {selectedFile.name}
                </p>
              )}

              <button
                onClick={handleFileUpload}
                className="mt-4 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Загрузка..." : "Отправить"}
              </button>

              {error && (
                <p className="mt-4 text-red-500">
                  {error}
                </p>
              )}

              {downloadUrl && (
                <div className="mt-6">
                  <p className="text-green-500 font-bold">
                    Файл успешно обработан! Скачайте его ниже:
                  </p>
                  <a
                    href={downloadUrl}
                    download={`processed_${selectedFile.name}`}
                    className="text-blue-500 underline font-bold mt-2"
                  >
                    Скачать обработанный файл
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row justify-between mt-10 items-center">
        {/* Левый блок с инструкциями */}
        <div className="lg:w-1/2 w-full lg:pr-4 mb-8 lg:mb-0">
          <h3 className="text-3xl md:text-3xl lg:text-3xl font-bold text-black mb-6">Инструкция по лемматизации</h3>
          <p className="text-lg md:text-xl lg:text-2xl text-black mb-8 leading-6 md:leading-8 lg:leading-10">
            Лемматизация — это процесс преобразования слова в его начальную (нормальную) форму, называемую леммой. Например, для глагола "бегал" леммой будет "бегать". Используйте этот инструмент для обработки как отдельных слов, так и целых предложений.
          </p>
        </div>

        {/* Правый блок с дополнительной информацией */}
        <div className="lg:w-1/2 w-full lg:pl-4">
          <h3 className="text-3xl md:text-3xl lg:text-3xl font-bold text-black mb-6">Как использовать</h3>
          <p className="text-lg md:text-xl lg:text-2xl text-black mb-8 leading-6 md:leading-8 lg:leading-10">
            Выберите режим (слово или предложение), введите текст и выберите часть речи или слово для лемматизации. Если вы хотите обработать весь текст, просто выберите "Всё предложение". Также можно загрузить файл с текстом в формате .conllu для обработки.
          </p>
        </div>
      </div>

      </main>

      {/* Footer */}
      <footer className="py-4 bg-gray-700 mt-12 w-full">
        <div className="flex flex-col justify-center text-white text-center text-base md:text-m lg:text-xl">
          <p>Разработано при поддержке НКРЯ</p>
          <p>
            Аналитик: <a href="https://vk.com/evgen_k45" target="_blank" className="underline">Evgeshkins</a> |
            Разработчик: <a href="https://vk.com/sagadeev0" target="_blank" className="underline">Ostamer</a>
          </p>
          <p>Email: lemmatize@gmail.com</p>
          <p>ТюмГУ 2024 год</p>
        </div>
      </footer>

    </div>
  );
}

export default Web;
