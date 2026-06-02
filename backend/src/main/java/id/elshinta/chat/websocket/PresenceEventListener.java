package id.elshinta.chat.websocket;

import id.elshinta.chat.repository.UserRepository;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;

@Component
public class PresenceEventListener {
    private final UserRepository users;

    public PresenceEventListener(UserRepository users) {
        this.users = users;
    }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = accessor.getFirstNativeHeader("username");
        if (username != null) {
            users.findByUsername(username).ifPresent(user -> {
                user.setOnline(false);
                user.setLastSeen(LocalDateTime.now());
                users.save(user);
            });
        }
    }
}

