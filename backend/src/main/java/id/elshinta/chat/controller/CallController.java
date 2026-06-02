package id.elshinta.chat.controller;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calls")
public class CallController {
    private final UserRepository users;
    private final SimpMessagingTemplate broker;

    public CallController(UserRepository users, SimpMessagingTemplate broker) {
        this.users = users;
        this.broker = broker;
    }

    @PostMapping("/signal")
    public void signal(Authentication auth, @RequestBody Dto.CallSignal request) {
        var sender = users.findByUsername(auth.getName()).orElseThrow();
        var signal = new Dto.CallSignal(
                request.toUserId(),
                sender.getId(),
                sender.getFullName(),
                request.mode(),
                request.type(),
                request.payload()
        );
        broker.convertAndSend("/topic/calls/" + request.toUserId(), signal);
    }
}
