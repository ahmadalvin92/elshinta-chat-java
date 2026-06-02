package id.elshinta.chat.service;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.entity.Message;
import id.elshinta.chat.entity.Room;
import id.elshinta.chat.entity.User;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    public Dto.UserResponse user(User user) {
        return new Dto.UserResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getRole(),
                user.getDivision() == null ? null : user.getDivision().getName(),
                user.getAvatarUrl(),
                user.isEnabled(),
                user.isOnline(),
                user.getLastSeen(),
                user.getStatusMessage()
        );
    }

    public Dto.RoomResponse room(Room room) {
        return new Dto.RoomResponse(room.getId(), room.getName(), room.getType(),
                room.getDivision() == null ? null : room.getDivision().getName(), room.isActive());
    }

    public Dto.MessageResponse message(Message message) {
        return new Dto.MessageResponse(message.getId(), message.getRoom().getId(), user(message.getSender()),
                message.getType(), message.getContent(), message.getFileUrl(), message.getOriginalFileName(), message.getCreatedAt());
    }
}

