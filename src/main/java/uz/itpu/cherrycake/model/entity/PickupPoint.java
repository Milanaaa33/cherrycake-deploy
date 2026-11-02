package uz.itpu.cherrycake.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pickup_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PickupPoint
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "region_id", nullable = false)
    private Region region;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "working_hours", nullable = false, length = 100)
    private String workingHours;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}