import asyncio
import json
import os
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler
from tornado.websocket import WebSocketHandler
import redis.asyncio as aioredis
from dotenv import load_dotenv
import tornado.web

# Загрузка переменных из файла .env
load_dotenv()

REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
CHAT_CHANNEL = os.getenv('CHAT_CHANNEL')
SERVER_HOST = os.getenv('SERVER_HOST')
SERVER_PORT = os.getenv('SERVER_PORT')

redis = None

# Класс для обработки WebSocket подключений
class ChatWebSocketHandler(WebSocketHandler):
    clients = set()

    def open(self):
        self.set_nodelay(True)
        ChatWebSocketHandler.clients.add(self)
        self.write_message({"type": "info", "message": "Добро пожаловать на сервер!"})
        self.update_clients()

    def on_message(self, message):
        try:
            data = json.loads(message)
            if "message" in data:
                message_data = {
                    "type": "message",
                    "message": data["message"]
                }
                asyncio.create_task(redis.publish(CHAT_CHANNEL, json.dumps(message_data)))  # Отправка в Redis
                print(f"Получено сообщение: {data}")
        except Exception as e:
            print(f"Ошибка при обработке сообщения: {e}")

    def on_close(self):
        ChatWebSocketHandler.clients.remove(self)
        self.update_clients()

    def check_origin(self, origin):
        return True

    @classmethod
    def send_to_clients(cls, message):
        for client in cls.clients:
            client.write_message(json.dumps(message))  # Отправка сообщений всем клиентам

    def update_clients(self):
        users = len(ChatWebSocketHandler.clients)
        info_message = {"type": "info", "users": users}
        for client in ChatWebSocketHandler.clients:
            client.write_message(json.dumps(info_message))


# Класс для обработки HTTP запросов и рендеринга HTML страницы
class MainHandler(RequestHandler):
    def get(self):
        self.render("index.html")  # Возвращаем HTML файл

# Функция подписки на канал Redis для получения сообщений
async def redis_subscriber():
    pubsub = redis.pubsub()
    await pubsub.subscribe(CHAT_CHANNEL)

    async for message in pubsub.listen():
        if message["type"] == "message":
            data = json.loads(message["data"].decode("utf-8"))
            print(f"Получено сообщение от Redis: {data}")
            ChatWebSocketHandler.send_to_clients(data)  # Отправка сообщений всем пользователям


# Функция для создания приложения Tornado
def make_app():
    return Application([
        (r"/", MainHandler),
        (r"/ws", ChatWebSocketHandler),
    ])


# Главная функция для запуска сервера
async def main():
    global redis
    redis = aioredis.from_url(f"redis://{REDIS_HOST}:{REDIS_PORT}")

    asyncio.create_task(redis_subscriber())

    app = make_app()
    app.listen(SERVER_PORT, address=SERVER_HOST)
    print(f"Сервер запущен на адресе http://{SERVER_HOST}:{SERVER_PORT}")
    await asyncio.Event().wait()

# Запуск приложения
if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nСервер заглушен")
