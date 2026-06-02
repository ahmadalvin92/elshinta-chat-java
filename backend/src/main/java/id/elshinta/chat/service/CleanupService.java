package id.elshinta.chat.service;

import id.elshinta.chat.repository.MessageRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class CleanupService {
    private final MessageRepository messages;
    private final FileStorageService files;

    public CleanupService(MessageRepository messages, FileStorageService files) {
        this.messages = messages;
        this.files = files;
    }

    @Transactional
    @Scheduled(cron = "0 15 2 * * *", zone = "Asia/Jakarta")
    public void cleanupOldMessages() {
        var expired = messages.findByCreatedAtBefore(LocalDateTime.now().minusDays(3));
        expired.forEach(message -> files.deleteByUrl(message.getFileUrl()));
        messages.deleteAll(expired);
    }
}

