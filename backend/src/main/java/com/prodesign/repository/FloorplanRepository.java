package com.prodesign.repository;

import com.prodesign.model.Floorplan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FloorplanRepository extends JpaRepository<Floorplan, String> {
}
