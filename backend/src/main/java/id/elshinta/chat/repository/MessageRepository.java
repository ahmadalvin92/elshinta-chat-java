package id.elshinta.chat.repository;

import id.elshinta.chat.entity.Message;
import id.elshinta.chat.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findTop80ByRoomOrderByCreatedAtDesc(Room room);
    List<Message> findByCreatedAtBefore(LocalDateTime cutoff);
}

