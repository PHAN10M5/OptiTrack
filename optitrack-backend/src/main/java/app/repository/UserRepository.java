package app.repository;

import app.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // CORRECTED METHOD: Navigate through the 'employee' association to its 'id'
    Optional<User> findByEmployee_Id(Long employeeId);

    Optional<User> findByResetToken(String resetToken);

    // Custom query to update reset token and expiry date
    @Modifying
    @Query("UPDATE User u SET u.resetToken = :token, u.tokenExpiryDate = :expiry WHERE u.id = :id")
    int updateResetToken(@Param("id") Long id, @Param("token") String token, @Param("expiry") LocalDateTime expiry);

    // Custom query to update password and clear reset token
    @Modifying
    @Query("UPDATE User u SET u.passwordHash = :passwordHash, u.resetToken = NULL, u.tokenExpiryDate = NULL WHERE u.id = :id")
    int updatePasswordAndClearToken(@Param("id") Long id, @Param("passwordHash") String passwordHash);
}