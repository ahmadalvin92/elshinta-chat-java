package id.elshinta.chat.repository;

import id.elshinta.chat.entity.Room;
import id.elshinta.chat.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findFirstByType(RoomType type);
    boolean existsByNameIgnoreCaseAndType(String name, RoomType type);
    List<Room> findByActiveTrueOrderByNameAsc();
}
