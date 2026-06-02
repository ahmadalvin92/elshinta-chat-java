package id.elshinta.chat.repository;

import id.elshinta.chat.entity.Room;
import id.elshinta.chat.entity.RoomMember;
import id.elshinta.chat.entity.RoomType;
import id.elshinta.chat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    List<RoomMember> findByRoom(Room room);
    void deleteByRoom(Room room);

    @Query("select rm.room from RoomMember rm where rm.user = :user and rm.room.type = :type and rm.room.active = true")
    List<Room> findRoomsByUserAndType(@Param("user") User user, @Param("type") RoomType type);
}
