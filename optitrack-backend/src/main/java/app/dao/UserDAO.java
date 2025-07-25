package app.dao;
import app.model.User;
import app.util.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {
    private DatabaseConnection DatabaseConnection;

    public UserDAO(DatabaseConnection DatabaseConnection){
        this.DatabaseConnection = DatabaseConnection;
    }

    public boolean createUser(User user) {
        String sql = "INSERT INTO users (email, password, salt, role, employeeId, isActive) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, user.getEmail());
            stmt.setString(2, user.getPassword());
            stmt.setString(3, user.getSalt());
            stmt.setString(4, user.getRole());
            stmt.setInt(5, user.getEmployeeId());
            stmt.setBoolean(6, user.isActive());

            int rowsAffected = stmt.executeUpdate();

            if (rowsAffected > 0) {
                ResultSet generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    user.setId(generatedKeys.getInt(1));
                }
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

}
