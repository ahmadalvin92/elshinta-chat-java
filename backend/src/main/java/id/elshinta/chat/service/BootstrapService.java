package id.elshinta.chat.service;

import id.elshinta.chat.entity.*;
import id.elshinta.chat.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BootstrapService implements CommandLineRunner {
    private final DivisionRepository divisions;
    private final UserRepository users;
    private final RoomRepository rooms;
    private final PasswordEncoder encoder;

    public BootstrapService(DivisionRepository divisions, UserRepository users, RoomRepository rooms, PasswordEncoder encoder) {
        this.divisions = divisions;
        this.users = users;
        this.rooms = rooms;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        List<String> defaults = List.of("IT Support", "Produksi", "Finance", "Marketing", "Newsroom");
        defaults.forEach(name -> divisions.findByNameIgnoreCase(name).orElseGet(() -> {
            Division division = new Division();
            division.setName(name);
            return divisions.save(division);
        }));

        rooms.findFirstByType(RoomType.GENERAL).orElseGet(() -> {
            Room room = new Room();
            room.setName("General");
            room.setType(RoomType.GENERAL);
            return rooms.save(room);
        });

        divisions.findAll().forEach(division -> {
            if (!rooms.existsByNameIgnoreCaseAndType(division.getName(), RoomType.DIVISION)) {
                Room room = new Room();
                room.setName(division.getName());
                room.setType(RoomType.DIVISION);
                room.setDivision(division);
                rooms.save(room);
            }
        });

        if (!users.existsByUsername("superadmin")) {
            User admin = new User();
            admin.setFullName("Super Admin Elshinta");
            admin.setUsername("superadmin");
            admin.setPassword(encoder.encode("ChangeMe123!"));
            admin.setRole(Role.SUPER_ADMIN);
            admin.setDivision(divisions.findByNameIgnoreCase("IT Support").orElse(null));
            users.save(admin);
        }
    }
}
