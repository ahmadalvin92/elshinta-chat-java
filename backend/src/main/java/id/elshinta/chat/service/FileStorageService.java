package id.elshinta.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> IMAGE_TYPES = Set.of("image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif");
    private final Path root;

    public FileStorageService(@Value("${app.upload-dir}") String uploadDir) throws IOException {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root.resolve("avatars"));
        Files.createDirectories(root.resolve("chat-images"));
    }

    public String saveImage(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File maksimal 5 MB.");
        }
        if (!IMAGE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File harus berupa gambar.");
        }
        String original = file.getOriginalFilename() == null ? "image.png" : file.getOriginalFilename();
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : ".png";
        String filename = UUID.randomUUID() + ext.toLowerCase();
        Path dir = root.resolve(folder).normalize();
        Files.createDirectories(dir);
        Path destination = dir.resolve(filename);
        file.transferTo(destination);
        return "/media/" + folder + "/" + filename;
    }

    public void deleteByUrl(String url) {
        if (url == null || !url.startsWith("/media/")) return;
        try {
            Files.deleteIfExists(root.resolve(url.substring("/media/".length())).normalize());
        } catch (IOException ignored) {
        }
    }
}

