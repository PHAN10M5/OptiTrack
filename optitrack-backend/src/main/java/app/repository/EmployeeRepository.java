package app.repository; // Or app.dao if you prefer

import app.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; // Import Optional if you want to use it for custom queries

@Repository // Marks this as a Spring Data JPA repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // JpaRepository provides: save(), findById(), findAll(), deleteById(), etc.

    // You can define custom query methods here. Spring Data JPA will implement them automatically
    // based on method names.
    Optional<Employee> findByFirstNameAndLastName(String firstName, String lastName);

    Optional<Employee> findByEmail(String email);

    // If you need to count employees, or other specific queries
    long count();
    // List<Employee> findByDepartment(String department);
}
