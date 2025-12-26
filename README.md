# Random User Profile API (Express + Axios)

Небольшой Express-проект, который:
- получает случайного пользователя из **RandomUser API**
- подтягивает информацию о стране пользователя из **REST Countries**
- (опционально) получает курсы валют через **ExchangeRate-API**
- (опционально) получает последние новости по стране через **NewsAPI**
- отдаёт всё одним JSON через endpoint: `GET /api/profile`

---

## Features

-Random profile (имя, пол, возраст, дата рождения, фото, страна/город, полный адрес)  
-Country info (столица, языки, валюта, флаг)  
-Exchange rates (USD и KZT относительно валюты страны) — если настроен ключ  
-News (до 5 статей по стране) — если настроен ключ  

---

## Tech Stack

- Node.js
- Express
- Axios
- dotenv


