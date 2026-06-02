package id.elshinta.chat.repository;

import id.elshinta.chat.entity.Division;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DivisionRepository extends JpaRepository<Division, Long> {
    Optional<Division> findByNameIgnoreCase(String name);
}

