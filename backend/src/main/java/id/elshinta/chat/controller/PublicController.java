package id.elshinta.chat.controller;

import id.elshinta.chat.entity.Division;
import id.elshinta.chat.repository.DivisionRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final DivisionRepository divisions;

    public PublicController(DivisionRepository divisions) {
        this.divisions = divisions;
    }

    @GetMapping("/divisions")
    public List<Division> divisions() {
        return divisions.findAll().stream().filter(Division::isActive).toList();
    }
}
