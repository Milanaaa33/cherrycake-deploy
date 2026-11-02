package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.Discount;
import uz.itpu.cherrycake.model.enums.DiscountType;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<Discount, Long>
{
    Optional<Discount> findByCodeIgnoreCaseAndActiveTrue(String code);

    List<Discount> findByDiscountTypeAndActiveTrue(DiscountType discountType);
}