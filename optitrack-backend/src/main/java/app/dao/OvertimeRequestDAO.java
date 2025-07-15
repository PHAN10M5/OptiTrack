package app.dao;

import app.model.OvertimeRequest;
import app.util.DatabaseConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class OvertimeRequestDAO {

    public OvertimeRequest save(OvertimeRequest request) throws SQLException {
        String sql = "INSERT INTO overtime_requests (employee_id, request_date_time, requested_hours, status, reason) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            pstmt.setLong(1, request.getEmployeeId());
            pstmt.setString(2, request.getRequestDateTime().toString());
            pstmt.setDouble(3, request.getRequestedHours());
            pstmt.setString(4, request.getStatus());
            pstmt.setString(5, request.getReason());

            int affectedRows = pstmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating overtime request failed, no rows affected.");
            }

            try (ResultSet generatedKeys = pstmt.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    request.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Creating overtime request failed, no ID obtained.");
                }
            }
            return request;
        }
    }

    public Optional<OvertimeRequest> findById(long id) throws SQLException {
        String sql = "SELECT id, employee_id, request_date_time, requested_hours, status, reason FROM overtime_requests WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            try (ResultSet rs = pstmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(new OvertimeRequest(
                            rs.getLong("id"),
                            rs.getLong("employee_id"),
                            LocalDateTime.parse(rs.getString("request_date_time")),
                            rs.getDouble("requested_hours"),
                            rs.getString("status"),
                            rs.getString("reason")
                    ));
                }
            }
        }
        return Optional.empty();
    }

    public List<OvertimeRequest> findByEmployeeId(long employeeId) throws SQLException {
        List<OvertimeRequest> requests = new ArrayList<>();
        String sql = "SELECT id, employee_id, request_date_time, requested_hours, status, reason FROM overtime_requests WHERE employee_id = ? ORDER BY request_date_time DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, employeeId);
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    requests.add(new OvertimeRequest(
                            rs.getLong("id"),
                            rs.getLong("employee_id"),
                            LocalDateTime.parse(rs.getString("request_date_time")),
                            rs.getDouble("requested_hours"),
                            rs.getString("status"),
                            rs.getString("reason")
                    ));
                }
            }
        }
        return requests;
    }

    public List<OvertimeRequest> findAll() throws SQLException {
        List<OvertimeRequest> requests = new ArrayList<>();
        String sql = "SELECT id, employee_id, request_date_time, requested_hours, status, reason FROM overtime_requests ORDER BY request_date_time DESC";
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {

            while (rs.next()) {
                requests.add(new OvertimeRequest(
                        rs.getLong("id"),
                        rs.getLong("employee_id"),
                        LocalDateTime.parse(rs.getString("request_date_time")),
                        rs.getDouble("requested_hours"),
                        rs.getString("status"),
                        rs.getString("reason")
                ));
            }
        }
        return requests;
    }

    public boolean update(OvertimeRequest request) throws SQLException {
        String sql = "UPDATE overtime_requests SET employee_id = ?, request_date_time = ?, requested_hours = ?, status = ?, reason = ? WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, request.getEmployeeId());
            pstmt.setString(2, request.getRequestDateTime().toString());
            pstmt.setDouble(3, request.getRequestedHours());
            pstmt.setString(4, request.getStatus());
            pstmt.setString(5, request.getReason());
            pstmt.setLong(6, request.getId());

            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }

    public boolean delete(long id) throws SQLException {
        String sql = "DELETE FROM overtime_requests WHERE id = ?";
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setLong(1, id);
            int affectedRows = pstmt.executeUpdate();
            return affectedRows > 0;
        }
    }
}
