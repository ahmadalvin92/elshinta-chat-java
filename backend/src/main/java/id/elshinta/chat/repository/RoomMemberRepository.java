package id.elshinta.chat.repository;

import id.elshinta.chat.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
}

