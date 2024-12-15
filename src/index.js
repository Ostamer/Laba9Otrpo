import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./css/index.css";
import '@fontsource/montserrat';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/700-italic.css';
import { init, retrieveLaunchParams, mockTelegramEnv } from '@telegram-apps/sdk-react';

const initializeTelegramSDK = async () => {
  try {
    console.log("Инициализация окружения Telegram");
    init();
    const { initDataRaw, initData } = retrieveLaunchParams();
    const user = initData.user;  // Данные пользователя уже объект

    // Сохраняем данные в глобальную переменную
    window.userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl, // если есть
    };

    console.log("ID пользователя:", user.id);
    console.log("Имя пользователя:", user.first_name);
    console.log("Логин пользователя:", user.username);
    console.log("Язык пользователя:", user.language_code);
    console.log("Премиум-подписка:", user.is_premium);
    console.log("Разрешено отправлять сообщения в личку:", user.allows_write_to_pm);
  } catch (error) {
    console.error('Ошибка при инициализации Telegram:', error);

    const initDataRaw = new URLSearchParams([
      ['user', JSON.stringify({
        id: 99281932,
        first_name: 'Andrew',
        last_name: 'Rogue',
        username: 'rogue',
        language_code: 'en',
        is_premium: true,
        allows_write_to_pm: true,
      })],
      ['hash', '89d6079ad6762351f38c6dbbc41bb53048019256a9443988af7a48bcad16ba31'],
      ['auth_date', '1716922846'],
      ['start_param', 'debug'],
      ['chat_type', 'sender'],
      ['chat_instance', '8428209589180549439'],
    ]).toString();

    mockTelegramEnv({
      themeParams: {
        accentTextColor: '#6ab2f2',
        bgColor: '#17212b',
        buttonColor: '#5288c1',
        buttonTextColor: '#ffffff',
        destructiveTextColor: '#ec3942',
        headerBgColor: '#fcb69f',
        hintColor: '#708499',
        linkColor: '#6ab3f3',
        secondaryBgColor: '#232e3c',
        sectionBgColor: '#17212b',
        sectionHeaderTextColor: '#6ab3f3',
        subtitleTextColor: '#708499',
        textColor: '#f5f5f5',
      },
      version: '7.2',
      platform: 'tdesktop',
    });

    console.log('Mock Telegram environment initialized');
  }
};

initializeTelegramSDK();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
