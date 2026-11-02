package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.ProductPrice;

import java.util.Optional;

@Repository
public interface ProductPriceRepository extends JpaRepository<ProductPrice, Long>
{
    Optional<ProductPrice> findByProductIdAndRegionId(Long productId, Long regionId);

    Optional<ProductPrice> findByProductCodeAndRegionCode(String productCode, String regionCode);
}