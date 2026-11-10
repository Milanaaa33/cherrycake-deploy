package com.cherrycake.catalog.repository;

import com.cherrycake.catalog.entity.Product;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findAllByOrderById();

    List<Product> findByCategoryIdOrderById(Long categoryId);
}
