package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.ProductModifier;

import java.util.List;

@Repository
public interface ProductModifierRepository extends JpaRepository<ProductModifier, Long>
{ List<ProductModifier> findByProductId(Long productId); }