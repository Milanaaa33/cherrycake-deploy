package uz.itpu.cherrycake.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uz.itpu.cherrycake.model.entity.Region;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegionRepository extends JpaRepository<Region, Long>
{
    Optional<Region> findByCodeIgnoreCase(String code);

    List<Region> findAllByActiveTrue();
}