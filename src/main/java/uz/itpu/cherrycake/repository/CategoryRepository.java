package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.Category;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>
{
    Optional<Category> findByCode(String code);

    List<Category> findAllByOrderByDisplayOrderAsc();
}