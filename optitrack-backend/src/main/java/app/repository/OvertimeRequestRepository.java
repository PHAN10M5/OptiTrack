package app.repository;

import app.model.OvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<OvertimeRequest, Long> {

    // ⭐ This method uses a correct naming convention that matches your entity's properties.
    List<OvertimeRequest> findByEmployee_IdAndStatus(Long employeeId, String status);

    // This method is already present in your service, but ensure it's in your repository as well.
    List<OvertimeRequest> findByStatus(String status);
}