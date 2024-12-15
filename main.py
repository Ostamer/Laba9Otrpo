import asyncio
import json
import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.websocket import WebSocketHandler
import redis.asyncio as aioredis
from dotenv import load_dotenv

# Загрузка переменных из файла .env
load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')  # Хост Redis
REDIS_PORT = os.getenv('REDIS_PORT')  # Порт Redis
CHAT_CHANNEL = os.getenv('CHAT_CHANNEL')  # Канал для чатов в Redis
SERVER_HOST = os.getenv('SERVER_HOST')  # Хост для сервера Tornado
SERVER_PORT = os.getenv('SERVER_PORT')  # Порт для сервера Tornado

redis = None

# Класс для обработки WebSocket подключений
class ChatWebSocketHandler(WebSocketHandler):
    clients = set()

    # Метод при подключении нового пользователя и написания приветсвенного сообщения
    def open(self):
        self.set_nodelay(True)
        ChatWebSocketHandler.clients.add(self)
        self.write_message({"type": "info", "message": "Добро пожаловать на мой первый сервер"})
        self.update_clients()

    # Метод для обработки сообщений и отправки в редис
    def on_message(self, message):
        data = json.loads(message)
        if "message" in data:
            asyncio.create_task(redis.publish(CHAT_CHANNEL, json.dumps(data)))

    # Метод для отключения пользователя при выходе
    def on_close(self):
        ChatWebSocketHandler.clients.remove(self)
        self.update_clients()

    # Для обхода Cors заголовков
    def check_origin(self, origin):
        return True

    # Метод для отправки начального сообщения всем пользователям
    @classmethod
    def send_to_clients(cls, message):
        for client in cls.clients:
            client.write_message(message)

    # Информация о кол-во поключенных клиентов
    def update_clients(self):
        users = len(ChatWebSocketHandler.clients)
        info_message = json.dumps({"type": "info", "users": users})
        for client in ChatWebSocketHandler.clients:
            client.write_message(info_message)


# Класс для обработки HTTP запросов
class MainHandler(RequestHandler):
    def get(self):
        self.write("<h1>Сервер запущен!!!!</h1>"
                   "<h2>Как дела?<h2>")


# Функция подписки на канал Redis для получения сообщений
async def redis_subscriber():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHAT_CHANNEL)

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"].decode("utf-8"))
            ChatWebSocketHandler.send_to_clients(data)

# Функция для создания приложения Tornado и прописывание маршрутов приложения
def make_app():
    return Application([
        (r"/", MainHandler),
        (r"/ws", ChatWebSocketHandler),
    ])

# Логика запуска всех программ
async def main():
    global redis
    redis = aioredis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}")

    asyncio.create_task(redis_subscriber())

    app = make_app()
    app.listen(SERVER_PORT, address=SERVER_HOST)
    print(f"Сервер запущен на адресе http://{SERVER_HOST}:{SERVER_PORT}")
    await asyncio.Event().wait()

# Запуск скрипта
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nСервер заглушен")
