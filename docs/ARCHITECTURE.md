# Elshinta Chat Internal Architecture

Elshinta Chat Internal is a LAN-first office chat application.

- Backend: Java 21, Spring Boot 3, Spring Security JWT, Spring WebSocket STOMP, Spring Data JPA, MySQL.
- Frontend: React, Vite, Tailwind CSS, React Router, Axios, STOMP over SockJS, Emoji Mart.
- Storage: local `media/` folder served by Spring Boot under `/media/**`.
- Cleanup: Spring scheduled task runs daily at `02:15 Asia/Jakarta` and deletes messages older than 3 days plus related image files.

## V2 Calls

Voice and video call buttons are present in the chat profile panel.

TODO: Implementasi WebRTC pada versi berikutnya.

