package id.elshinta.chat.controller;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.repository.DivisionRepository;
import id.elshinta.chat.repository.UserRepository;
import id.elshinta.chat.service.FileStorageService;
import id.elshinta.chat.service.MapperService;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

@RestController
@RequestMapping("/api/profile")
@Transactional
public class ProfileController {
    private final UserRepository users;
    private final DivisionRepository divisions;
    private final MapperService mapper;
    private final PasswordEncoder encoder;
    private final FileStorageService files;

    public ProfileController(UserRepository users, DivisionRepository divisions, MapperService mapper, PasswordEncoder encoder, FileStorageService files) {
        this.users = users;
        this.divisions = divisions;
        this.mapper = mapper;
        this.encoder = encoder;
        this.files = files;
    }

    @GetMapping
    public Dto.UserResponse me(Authentication auth) {
        return mapper.user(users.findByUsername(auth.getName()).orElseThrow());
    }

    @PutMapping
    public Dto.UserResponse update(Authentication auth, @RequestBody Dto.ProfileRequest request) {
        var user = users.findByUsername(auth.getName()).orElseThrow();
        user.setFullName(request.fullName());
        user.setStatusMessage(request.statusMessage());
        user.setDivision(divisions.findById(request.divisionId()).orElse(null));
        return mapper.user(users.save(user));
    }

    @PostMapping("/avatar")
    public Dto.UserResponse avatar(Authentication auth, @RequestParam MultipartFile avatar) throws IOException {
        var user = users.findByUsername(auth.getName()).orElseThrow();
        files.deleteByUrl(user.getAvatarUrl());
        user.setAvatarUrl(files.saveImage(avatar, "avatars"));
        return mapper.user(users.save(user));
    }

    @PostMapping("/password")
    public void password(Authentication auth, @RequestBody Dto.PasswordRequest request) {
        var user = users.findByUsername(auth.getName()).orElseThrow();
        if (!encoder.matches(request.oldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Password lama tidak sesuai.");
        }
        user.setPassword(encoder.encode(request.newPassword()));
        users.save(user);
    }
}
