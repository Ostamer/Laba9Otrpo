import axios from 'axios';

const adaptSelectedOption = (selectedOption) => {
  const mapping = {
    '-': '-',
    'Существительное': 'NOUN',
    'Глагол': 'VERB',
    'Вспомогательный глагол': 'AUX',
    'Прилагательное': 'ADJ',
    'Местоимение': 'PRON',
    'Числительное': 'NUM',
    'Порядковое числительное': 'ANUM',
    'Имя собственное': 'PROPN',
    'Детерминатив': 'DET',
    'Частица': 'PART',
    'Наречие': 'ADV',
    'Местоименное наречие': 'ADVPRO',
    'Предлог': 'ADP',
    'Символ': 'SYM',
    'Сочинительный союз': 'CCONJ',
    'Подчинительный союз': 'SCONJ',
    'Междометие': 'INTJ',
    'Предикатив': 'PRED',
    'Вводное слово': 'PARENTH',
    'COM': 'COM',
    'Знак препинания': 'PUNCT'
  };

  return mapping[selectedOption] || '-'; // Если selectedOption не найден, вернем 'X' как значение по умолчанию
};

export const fetchDataFromAPI = async (mode, selectedOption, inputValue, token) => {
  try {
    if (mode === 1) {
      selectedOption = adaptSelectedOption(selectedOption);
    }
    if (mode === 2) {
      if (selectedOption === "Всё предложение") {
        selectedOption = "All";
      }
    }

    const response = await axios.post('https://lemmaapp.ru/lemmatize', {
      mode: mode,
      selected_option: selectedOption,
      input_value: inputValue,
    });

    const result = response.data.lemma; // Получаем результат обработки
    console.log(token)
    if (token) {
      handleHisoryPost(inputValue, selectedOption, mode, result,token);
    }
    return result;
  } catch (error) {
    console.error('Ошибка при запросе:', error);
    throw new Error('Ошибка при запросе');
  }
};


const handleHisoryPost = async (inputValue, selectedOption, mode, result, token) => {
  try {
    console.log(token);
    var start_word = inputValue;
    if (mode === 2) {
      start_word = selectedOption === "All" ? inputValue : selectedOption;
    }

    const response = await fetch("https://lemmaapp.ru/server1/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Добавляем токен в заголовок
      },
      body: JSON.stringify({
        word: start_word,
        lemmatize_type: mode,
        result: result,
        selected_option: selectedOption,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.error("Ошибка записи истории:", data.detail || response.statusText);
    }
  } catch (error) {
    console.error("Ошибка при записи истории:", error);
    console.log({
      word: start_word,
      lemmatize_type: mode,
      result: result,
    });
  }
};


// authService.js

const API_BASE_URL = "https://lemmaapp.ru/server1";

// Функция авторизации пользователя
export const handleLogin = async (login, password, setIsLoggedIn, closeModal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.access_token);
      setIsLoggedIn(true);
      closeModal();
    } else {
      alert(data.detail || "Ошибка авторизации");
    }
  } catch (error) {
    console.error("Ошибка авторизации:", error);
  }
};

// Функция регистрации пользователя
export const handleRegister = async (name, surname, login, password, setModalMode) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, login, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Регистрация успешна! Теперь вы можете войти.");
      setModalMode("login");
    } else {
      alert(data.detail || "Ошибка регистрации");
    }
  } catch (error) {
    console.error("Ошибка регистрации:", error);
  }
};

// Получение истории пользователя
export const fetchHistory = async (setHistory, setIsLoggedIn) => {
  try {
    const token = localStorage.getItem("token");
    console.log(token);
    if (!token) {
      alert("Ошибка авторизации, не найден user_id");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (response.ok) {
      setHistory(data);
    } else {
      alert("Ошибка загрузки истории");
    }
  } catch (error) {
    console.error("Ошибка загрузки истории:", error);
  }
};

// Выход из аккаунта
export const handleLogout = (setIsLoggedIn, setHistory) => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  setHistory([]);
};
