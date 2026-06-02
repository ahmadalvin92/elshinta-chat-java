# ELSHINTA CHAT INTERNAL

Stay Connected. Inside the Office.

Elshinta Chat Internal adalah aplikasi komunikasi internal kantor berbasis LAN. Backend dan frontend dapat dijalankan di alamat IP komputer server kantor sehingga perangkat lain dalam jaringan lokal bisa mengakses aplikasi tanpa internet.

## Struktur

```text
elshinta-chat-java/
backend/
frontend/
docs/
README.md
```

## Setup Java

Install Java 21, lalu cek:

```bash
java -version
```

## Setup Maven

Install Maven 3.9+, lalu cek:

```bash
mvn -version
```

## Setup MySQL

Buat database dan user:

```sql
CREATE DATABASE elshinta_chat;
CREATE USER 'elshinta'@'%' IDENTIFIED BY 'password-kuat';
GRANT ALL PRIVILEGES ON elshinta_chat.* TO 'elshinta'@'%';
FLUSH PRIVILEGES;
```

## Setup Backend

```bash
cd backend
export DB_URL="jdbc:mysql://localhost:3306/elshinta_chat?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Jakarta"
export DB_USERNAME="elshinta"
export DB_PASSWORD="password-kuat"
export JWT_SECRET="ganti-dengan-secret-minimal-32-karakter"
export INTERNAL_ACCESS_CODE="ELSHINTA-INTERNAL-2026"
mvn spring-boot:run
```

Backend berjalan di:

```text
http://localhost:8080
```

Default super admin:

```text
username: superadmin
password: ChangeMe123!
```

Segera ganti password setelah login pertama.

## Setup Frontend

```bash
cd frontend
npm install
echo 'VITE_API_BASE_URL=http://localhost:8080' > .env
npm run dev
```

Frontend berjalan di:

```text
http://localhost:5173
```

## Setup WebSocket

Endpoint WebSocket:

```text
http://localhost:8080/ws
```

Frontend memakai STOMP over SockJS dan subscribe ke:

```text
/topic/rooms/{roomId}
/topic/announcements
```

## Setup LAN Access

Cari IP komputer server:

```bash
ipconfig getifaddr en0
```

Jalankan backend agar listen semua interface:

```bash
cd backend
export SERVER_ADDRESS=0.0.0.0
mvn spring-boot:run
```

Jalankan frontend:

```bash
cd frontend
echo 'VITE_API_BASE_URL=http://192.168.x.x:8080' > .env
npm run dev -- --host 0.0.0.0
```

Akses dari komputer lain di jaringan kantor:

```text
Backend:  http://192.168.x.x:8080
Frontend: http://192.168.x.x:5173
```

Pastikan firewall komputer server mengizinkan port `8080` dan `5173`.

## Setup Build Production

Backend:

```bash
cd backend
mvn clean package
java -jar target/elshinta-chat-internal-0.0.1-SNAPSHOT.jar
```

Frontend:

```bash
cd frontend
npm install
npm run build
npm run preview -- --host 0.0.0.0
```

## Setup Deployment Ke Server Kantor

1. Install Java 21, Maven, Node.js LTS, dan MySQL di server kantor.
2. Clone repository ke server.
3. Siapkan database MySQL dan environment backend.
4. Jalankan backend sebagai service systemd pada port `8080`.
5. Build frontend dan sajikan `frontend/dist` melalui Nginx atau jalankan `npm run preview`.
6. Arahkan `VITE_API_BASE_URL` ke IP/domain server kantor.
7. Buka port firewall `8080` untuk API/WebSocket dan port frontend yang dipakai.

## Fitur Utama

- Register dengan nama lengkap, username, password, divisi, dan kode akses internal.
- Login, logout, profile, edit profile, upload avatar, change password.
- Online/offline status dan last seen.
- Room umum, room divisi, room custom, dan fondasi direct message.
- Chat realtime WebSocket, emoji, upload gambar, preview gambar, timestamp, modern chat bubble.
- Role `SUPER_ADMIN`, `ADMIN`, dan `USER`.
- Admin dashboard, master divisi, manage user, manage room, announcement.
- File lokal di folder `media/`.
- Auto cleanup pesan dan gambar setelah 3 hari.
- Tombol voice/video call untuk V2.

## Git

```bash
git add .
git commit -m "Initial Elshinta Chat Internal fullstack app"
git push -u origin main
```

