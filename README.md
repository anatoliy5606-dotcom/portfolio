# Анатолий Ермолаев — сайт промышленного консалтинга

Статический двуязычный сайт (RU / EN) без сборки и зависимостей. Одна страница + вложенные уровни: кейсы и документы открываются в модальных окнах.

```
portfolio/
├── index.html                 # русская версия
├── en/index.html              # английская версия
├── assets/
│   ├── css/style.css          # вся вёрстка и токены
│   ├── css/fonts.css          # @font-face (локальные шрифты)
│   ├── js/config.js           # КОНТАКТЫ — единственный файл для правки
│   ├── js/main.js             # меню, диалоги, анимации, подстановка контактов
│   ├── fonts/                 # Golos Text + JetBrains Mono (OFL), woff2
│   └── img/                   # сканы сертификатов (webp), favicon, og.jpg
└── README.md
```

## Локальный просмотр

```bash
cd portfolio
python3 -m http.server 8000
# http://localhost:8000
```

Можно открыть и просто файлом `index.html`, но локальный сервер корректнее повторяет продакшн.

## Контакты

Откройте `assets/js/config.js`:

```js
window.SITE_CONFIG = {
  linkedin: "https://www.linkedin.com/in/anatolii-ermolaev-ab0b1a236/",
  email: "",      // "hello@domain.ru"
  telegram: "",   // "https://t.me/username"
  phone: ""
};
```

Пустое значение = канал скрыт на сайте. Как только укажете `email`, кнопка «Написать на e-mail» появится в контактах и мобильном меню автоматически (ссылка `mailto:`). Для Telegram/WhatsApp кнопки добавляются в разметку по образцу существующих `data-contact`.

## Деплой

Сайт статический — подойдёт любой сервер/хостинг. Пример для nginx:

```nginx
server {
    listen 80;
    server_name example.ru www.example.ru;
    root /var/www/portfolio;
    index index.html;

    location / { try_files $uri $uri/ =404; }

    location ~* \.(css|js|woff2|webp|jpg|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml;
}
```

Скопируйте содержимое папки `portfolio/` в `root`. HTTPS — через certbot (`certbot --nginx`). Домен и DNS настраиваются на стороне регистратора; на одном сервере можно держать сколько угодно доменов через отдельные `server`-блоки.

Важно: `og:image` и `og:url` лучше указывать абсолютными URL после того, как появится домен. Сейчас в мета-тегах относительный путь — соцсети могут его не разрешить.

## Как править контент

- Тексты RU — `index.html`, EN — `en/index.html`. Страницы независимые: правки нужно вносить в обе.
- Секции размечены комментариями `<!-- HERO -->`, `<!-- CASES -->` и т. д.
- Кейсы: текст для модального окна лежит в `<template class="case-tpl">` внутри карточки. Заголовок и подпись окна задаются атрибутами `data-case-title` и `data-case-meta` на кнопке.
- Сертификаты: кнопка `.cred` открывает скан из `data-doc`; файлы — в `assets/img/cert-*.webp`.
- Цвета, шрифты, отступы — токены в начале `assets/css/style.css` (`:root`).
- Шрифты локальные: Golos Text (текст и заголовки) и JetBrains Mono (технические подписи), лицензия SIL OFL. Никаких внешних CDN — сайт работает без интернета.

## Что уже учтено

- Адаптив: 375 / 768 / 1024 / 1440 px, отдельная мобильная навигация.
- Доступность: skip-link, видимый фокус, aria-атрибуты, `inert` для фона при открытом меню, нативные `<dialog>`, `prefers-reduced-motion`.
- Производительность: без JS-фреймворков, ~20 КБ CSS/JS, локальные шрифты (только нужные подмножества), lazy-загрузка сканов только при открытии документа.
- SEO: заголовки, description, Open Graph, hreflang RU/EN, JSON-LD Person.
- Печать: упрощённая print-версия.

## Что стоит добавить дальше

1. Реальную форму заявки (Formspree / собственный endpoint / Telegram-бот) — сейчас канал связи LinkedIn и `mailto:`.
2. Абсолютные `og:url` и `og:image` после привязки домена; `sitemap.xml` и `robots.txt`.
3. Фото для hero (портрет) и, при желании, PDF-профиль для отправки клиентам.
4. Аналитику (Plausible / Яндекс.Метрика) и событие «клик по CTA».
