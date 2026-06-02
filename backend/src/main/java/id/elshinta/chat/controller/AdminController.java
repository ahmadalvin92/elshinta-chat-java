package id.elshinta.chat.controller;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.entity.*;
import id.elshinta.chat.repository.*;
import id.elshinta.chat.service.MapperService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Transactional
public class AdminController {
    private final DivisionRepository divisions;
    private final UserRepository users;
    private final RoomRepository rooms;
    private final AnnouncementRepository announcements;
    private final MapperService mapper;
    private final PasswordEncoder encoder;
    private final SimpMessagingTemplate broker;

    public AdminController(DivisionRepository divisions, UserRepository users, RoomRepository rooms,
                           AnnouncementRepository announcements, MapperService mapper, PasswordEncoder encoder,
                           SimpMessagingTemplate broker) {
        this.divisions = divisions;
        this.users = users;
        this.rooms = rooms;
        this.announcements = announcements;
        this.mapper = mapper;
        this.encoder = encoder;
        this.broker = broker;
    }

    @GetMapping("/dashboard")
    public Dto.DashboardResponse dashboard() {
        return new Dto.DashboardResponse(users.count(), rooms.count(), users.countByOnlineTrue(), announcements.count());
    }

    @GetMapping("/divisions")
    public List<Division> divisions() {
        return divisions.findAll();
    }

    @PostMapping("/divisions")
    public Division createDivision(@RequestBody Dto.DivisionRequest request) {
        Division division = new Division();
        division.setName(request.name());
        division.setActive(request.active());
        return divisions.save(division);
    }

    @PutMapping("/divisions/{id}")
    public Division updateDivision(@PathVariable Long id, @RequestBody Dto.DivisionRequest request) {
        Division division = divisions.findById(id).orElseThrow();
        division.setName(request.name());
        division.setActive(request.active());
        return divisions.save(division);
    }

    @DeleteMapping("/divisions/{id}")
    public void deleteDivision(@PathVariable Long id) {
        divisions.deleteById(id);
    }

    @GetMapping("/users")
    public List<Dto.UserResponse> users() {
        return users.findAll().stream().map(mapper::user).toList();
    }

    @PutMapping("/users/{id}")
    public Dto.UserResponse updateUser(@PathVariable Long id, @RequestBody Dto.AdminUserRequest request) {
        User user = users.findById(id).orElseThrow();
        user.setFullName(request.fullName());
        user.setDivision(divisions.findById(request.divisionId()).orElse(null));
        user.setRole(request.role());
        user.setEnabled(request.enabled());
        return mapper.user(users.save(user));
    }

    @PostMapping("/users/{id}/reset-password")
    public void resetPassword(@PathVariable Long id, @RequestBody Dto.ResetPasswordRequest request) {
        User user = users.findById(id).orElseThrow();
        user.setPassword(encoder.encode(request.newPassword()));
        users.save(user);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        users.deleteById(id);
    }

    @GetMapping("/rooms")
    public List<Dto.RoomResponse> rooms() {
        return rooms.findAll().stream().map(mapper::room).toList();
    }

    @PostMapping("/rooms")
    public Dto.RoomResponse createRoom(@RequestBody Dto.RoomRequest request) {
        Room room = new Room();
        room.setName(request.name());
        room.setType(request.type());
        room.setDivision(request.divisionId() == null ? null : divisions.findById(request.divisionId()).orElse(null));
        return mapper.room(rooms.save(room));
    }

    @PutMapping("/rooms/{id}")
    public Dto.RoomResponse updateRoom(@PathVariable Long id, @RequestBody Dto.RoomRequest request) {
        Room room = rooms.findById(id).orElseThrow();
        room.setName(request.name());
        room.setType(request.type());
        room.setDivision(request.divisionId() == null ? null : divisions.findById(request.divisionId()).orElse(null));
        return mapper.room(rooms.save(room));
    }

    @DeleteMapping("/rooms/{id}")
    public void deleteRoom(@PathVariable Long id) {
        rooms.deleteById(id);
    }

    @PostMapping("/announcements")
    public Announcement announce(Authentication auth, @RequestBody Dto.AnnouncementRequest request) {
        Announcement announcement = new Announcement();
        announcement.setTitle(request.title());
        announcement.setBody(request.body());
        announcement.setCreatedBy(users.findByUsername(auth.getName()).orElseThrow());
        Announcement saved = announcements.save(announcement);
        broker.convertAndSend("/topic/announcements", saved);
        return saved;
    }
}
