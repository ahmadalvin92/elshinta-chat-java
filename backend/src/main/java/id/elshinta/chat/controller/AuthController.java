package id.elshinta.chat.controller;

import id.elshinta.chat.dto.Dto;
import id.elshinta.chat.entity.User;
import id.elshinta.chat.repository.DivisionRepository;
import id.elshinta.chat.repository.UserRepository;
import id.elshinta.chat.security.JwtService;
import id.elshinta.chat.service.MapperService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
@Transactional
public class AuthController {
    private final UserRepository users;
    private final DivisionRepository divisions;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final MapperService mapper;

    @Value("${app.internal-access-code}")
    private String accessCode;

    public AuthController(UserRepository users, DivisionRepository divisions, PasswordEncoder encoder,
                          AuthenticationManager authManager, JwtService jwtService, MapperService mapper) {
        this.users = users;
        this.divisions = divisions;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Dto.RegisterRequest request) {
        if (!accessCode.equals(request.accessCode())) {
            return ResponseEntity.badRequest().body("Kode akses internal tidak valid.");
        }
        if (users.existsByUsername(request.username())) {
            return ResponseEntity.badRequest().body("Username sudah digunakan.");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setUsername(request.username());
        user.setPassword(encoder.encode(request.password()));
        user.setDivision(divisions.findById(request.divisionId()).orElse(null));
        users.save(user);
        return ResponseEntity.ok(new Dto.AuthResponse(jwtService.generate(user), mapper.user(user)));
    }

    @PostMapping("/login")
    public Dto.AuthResponse login(@RequestBody Dto.LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        User user = users.findByUsername(request.username()).orElseThrow();
        user.setOnline(true);
        users.save(user);
        return new Dto.AuthResponse(jwtService.generate(user), mapper.user(user));
    }

    @PostMapping("/guest")
    public Dto.AuthResponse guest(@RequestBody Dto.GuestRequest request) {
        String fullName = request.fullName() == null ? "" : request.fullName().trim();
        if (fullName.length() < 2) {
            throw new IllegalArgumentException("Nama minimal 2 karakter.");
        }
        String username = "guest-" + fullName.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (username.equals("guest-")) {
            username = "guest-user";
        }
        String baseUsername = username;
        int suffix = 2;
        while (users.existsByUsername(username) && users.findByUsername(username).map(User::getFullName).filter(fullName::equalsIgnoreCase).isEmpty()) {
            username = baseUsername + "-" + suffix++;
        }
        String guestUsername = username;
        User user = users.findByUsername(guestUsername).orElseGet(() -> {
            User created = new User();
            created.setFullName(fullName);
            created.setUsername(guestUsername);
            created.setPassword(encoder.encode("guest-user-no-password"));
            created.setDivision(divisions.findByNameIgnoreCase("Newsroom").orElse(null));
            return created;
        });
        user.setFullName(fullName);
        user.setOnline(true);
        users.save(user);
        return new Dto.AuthResponse(jwtService.generate(user), mapper.user(user));
    }

    @PostMapping("/logout")
    public void logout(@RequestHeader("Authorization") String authorization) {
        String token = authorization.replace("Bearer ", "");
        users.findByUsername(jwtService.username(token)).ifPresent(user -> {
            user.setOnline(false);
            user.setLastSeen(LocalDateTime.now());
            users.save(user);
        });
    }
}
