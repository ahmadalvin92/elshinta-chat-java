package id.elshinta.chat.dto;

import id.elshinta.chat.entity.MessageType;
import id.elshinta.chat.entity.Role;
import id.elshinta.chat.entity.RoomType;

import java.time.LocalDateTime;

public class Dto {
    public record LoginRequest(String username, String password) {}
    public record RegisterRequest(String fullName, String username, String password, Long divisionId, String accessCode) {}
    public record AuthResponse(String token, UserResponse user) {}
    public record UserResponse(Long id, String fullName, String username, Role role, String division, String avatarUrl,
                               boolean enabled, boolean online, LocalDateTime lastSeen, String statusMessage) {}
    public record DivisionRequest(String name, boolean active) {}
    public record RoomRequest(String name, RoomType type, Long divisionId) {}
    public record RoomResponse(Long id, String name, RoomType type, String division, boolean active) {}
    public record MessageRequest(Long roomId, String content, MessageType type) {}
    public record MessageResponse(Long id, Long roomId, UserResponse sender, MessageType type, String content,
                                  String fileUrl, String originalFileName, LocalDateTime createdAt) {}
    public record ProfileRequest(String fullName, Long divisionId, String statusMessage) {}
    public record PasswordRequest(String oldPassword, String newPassword) {}
    public record AdminUserRequest(String fullName, Long divisionId, Role role, boolean enabled) {}
    public record ResetPasswordRequest(String newPassword) {}
    public record AnnouncementRequest(String title, String body) {}
    public record DashboardResponse(long totalUser, long totalRoom, long userOnline, long totalAnnouncement) {}
}

