package id.elshinta.chat.controller;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.entity.Message;
import id.elshinta.chat.entity.MessageType;
import id.elshinta.chat.entity.Room;
import id.elshinta.chat.entity.RoomMember;
import id.elshinta.chat.entity.RoomType;
import id.elshinta.chat.entity.User;
import id.elshinta.chat.repository.MessageRepository;
import id.elshinta.chat.repository.RoomMemberRepository;
import id.elshinta.chat.repository.RoomRepository;
import id.elshinta.chat.repository.UserRepository;
import id.elshinta.chat.service.FileStorageService;
import id.elshinta.chat.service.MapperService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@Transactional
public class ChatController {
    private final RoomRepository rooms;
    private final RoomMemberRepository roomMembers;
    private final MessageRepository messages;
    private final UserRepository users;
    private final MapperService mapper;
    private final FileStorageService files;
    private final SimpMessagingTemplate broker;

    public ChatController(RoomRepository rooms, RoomMemberRepository roomMembers, MessageRepository messages, UserRepository users, MapperService mapper,
                          FileStorageService files, SimpMessagingTemplate broker) {
        this.rooms = rooms;
        this.roomMembers = roomMembers;
        this.messages = messages;
        this.users = users;
        this.mapper = mapper;
        this.files = files;
        this.broker = broker;
    }

    @GetMapping("/rooms")
    public List<Dto.RoomResponse> rooms() {
        return rooms.findByActiveTrueOrderByNameAsc().stream()
                .sorted(Comparator.comparingInt((Room room) -> roomWeight(room.getType())).thenComparing(Room::getName))
                .map(mapper::room)
                .toList();
    }

    private int roomWeight(RoomType type) {
        return switch (type) {
            case GENERAL -> 0;
            case DIVISION -> 1;
            case CUSTOM -> 2;
            case DIRECT -> 3;
        };
    }

    @GetMapping("/rooms/{roomId}/messages")
    public List<Dto.MessageResponse> messages(@PathVariable Long roomId) {
        var room = rooms.findById(roomId).orElseThrow();
        return messages.findTop80ByRoomOrderByCreatedAtDesc(room).stream()
                .sorted(Comparator.comparing(Message::getCreatedAt))
                .map(mapper::message)
                .toList();
    }

    @PostMapping("/messages")
    public Dto.MessageResponse send(Authentication auth, @RequestBody Dto.MessageRequest request) {
        var message = new Message();
        message.setRoom(rooms.findById(request.roomId()).orElseThrow());
        message.setSender(users.findByUsername(auth.getName()).orElseThrow());
        message.setType(request.type() == null ? MessageType.TEXT : request.type());
        message.setContent(request.content());
        var response = mapper.message(messages.save(message));
        broker.convertAndSend("/topic/rooms/" + request.roomId(), response);
        return response;
    }

    @PostMapping("/rooms/{roomId}/images")
    public Dto.MessageResponse upload(Authentication auth, @PathVariable Long roomId, @RequestParam MultipartFile image) throws IOException {
        var message = new Message();
        message.setRoom(rooms.findById(roomId).orElseThrow());
        message.setSender(users.findByUsername(auth.getName()).orElseThrow());
        message.setType(MessageType.IMAGE);
        message.setFileUrl(files.saveImage(image, "chat-images"));
        message.setOriginalFileName(image.getOriginalFilename());
        var response = mapper.message(messages.save(message));
        broker.convertAndSend("/topic/rooms/" + roomId, response);
        return response;
    }

    @GetMapping("/users")
    public List<Dto.UserResponse> users() {
        return users.findAll().stream()
                .filter(User::isEnabled)
                .sorted(Comparator.comparing(User::isOnline).reversed().thenComparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .map(mapper::user)
                .toList();
    }

    @PostMapping("/direct/{userId}")
    public Dto.RoomResponse direct(Authentication auth, @PathVariable Long userId) {
        var current = users.findByUsername(auth.getName()).orElseThrow();
        var target = users.findById(userId).orElseThrow();
        var currentRooms = roomMembers.findRoomsByUserAndType(current, RoomType.DIRECT);
        var targetRoomIds = roomMembers.findRoomsByUserAndType(target, RoomType.DIRECT).stream().map(Room::getId).toList();
        var existing = currentRooms.stream()
                .filter(room -> targetRoomIds.contains(room.getId()))
                .findFirst();
        if (existing.isPresent()) {
            return mapper.room(existing.get());
        }
        Room room = new Room();
        room.setName(current.getFullName() + " & " + target.getFullName());
        room.setType(RoomType.DIRECT);
        room = rooms.save(room);
        RoomMember first = new RoomMember();
        first.setRoom(room);
        first.setUser(current);
        RoomMember second = new RoomMember();
        second.setRoom(room);
        second.setUser(target);
        roomMembers.save(first);
        roomMembers.save(second);
        return mapper.room(room);
    }

    @DeleteMapping("/rooms/{roomId}")
    public void deleteRoom(Authentication auth, @PathVariable Long roomId) {
        var current = users.findByUsername(auth.getName()).orElseThrow();
        Room room = rooms.findById(roomId).orElseThrow();
        if (room.getType() != RoomType.DIRECT && room.getType() != RoomType.CUSTOM) {
            throw new IllegalArgumentException("Hanya DM dan room custom yang bisa dihapus dari chat.");
        }
        boolean member = roomMembers.findByRoom(room).stream().anyMatch(item -> item.getUser().getId().equals(current.getId()));
        boolean admin = current.getRole() == id.elshinta.chat.entity.Role.ADMIN || current.getRole() == id.elshinta.chat.entity.Role.SUPER_ADMIN;
        if (!member && !admin) {
            throw new IllegalArgumentException("Tidak punya akses menghapus room ini.");
        }
        messages.findByRoom(room).forEach(message -> files.deleteByUrl(message.getFileUrl()));
        messages.deleteByRoom(room);
        roomMembers.deleteByRoom(room);
        rooms.delete(room);
        broker.convertAndSend("/topic/rooms/deleted", roomId);
    }
}
