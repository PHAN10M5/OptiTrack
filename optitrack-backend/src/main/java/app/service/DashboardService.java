package app.service;

import app.model.Employee;
import app.model.OvertimeRequest;
import app.model.Punch;
import app.repository.EmployeeRepository;
import app.repository.OvertimeRequestRepository;
import app.repository.PunchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Optional;
import java.time.ZoneId;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final OvertimeRequestRepository overtimeRequestRepository;
    private final PunchRepository punchRepository;
    private final ReportService reportService;

    public DashboardService(EmployeeRepository employeeRepository,
                            PunchRepository punchRepository,
                            OvertimeRequestRepository overtimeRequestRepository,
                            ReportService reportService) {
        this.employeeRepository = employeeRepository;
        this.punchRepository = punchRepository;
        this.overtimeRequestRepository = overtimeRequestRepository;
        this.reportService = reportService;
    }

    // --- Admin Dashboard Stats (Existing Method) ---
    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalEmployees", employeeRepository.count());
        stats.put("pendingOvertimeRequests", overtimeRequestRepository.findByStatus("PENDING").size());

        long clockedInEmployees = employeeRepository.findAll().stream()
                .filter(employee -> punchRepository.findTopByEmployee_IdOrderByTimestampDesc(employee.getId())
                        .map(lastPunch -> "IN".equals(lastPunch.getPunchType()))
                        .orElse(false))
                .count();
        stats.put("employeesClockedIn", clockedInEmployees);

        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        List<Punch> punchesToday = punchRepository.findByTimestampBetween(startOfDay, endOfDay);
        Map<Long, List<Punch>> punchesByEmployee = punchesToday.stream()
                .collect(Collectors.groupingBy(punch -> punch.getEmployee().getId()));

        double totalHoursAcrossAllEmployeesToday = punchesByEmployee.entrySet().stream()
                .mapToDouble(entry -> reportService.getTodaysHours(entry.getKey()))
                .sum();
        stats.put("totalHoursAcrossAllEmployeesToday", String.format("%.2f", totalHoursAcrossAllEmployeesToday));

        return stats;
    }

    // --- Employee Dashboard Stats (Existing Method) ---
    public Map<String, Object> getEmployeeDashboardStats(Long employeeId) {
        Map<String, Object> stats = new HashMap<>();

        Optional<Employee> optionalEmployee = employeeRepository.findById(employeeId);
        if (optionalEmployee.isEmpty()) {
            throw new IllegalArgumentException("Employee with ID " + employeeId + " not found.");
        }
        Employee employee = optionalEmployee.get();

        stats.put("employeeId", employee.getId());
        stats.put("employeeFullName", employee.getFirstName() + " " + employee.getLastName());
        stats.put("department", employee.getDepartment());
        stats.put("role", "Employee");

        stats.put("todayHours", String.format("%.2f", reportService.getTodaysHours(employeeId)));
        stats.put("weeklyHours", String.format("%.2f", reportService.getWeeklyHours(employeeId)));

        Optional<Punch> lastPunchOptional = punchRepository.findTopByEmployee_IdOrderByTimestampDesc(employeeId);

        if (lastPunchOptional.isPresent()) {
            Punch lastPunch = lastPunchOptional.get();

            // DEBUG logs
            System.out.println("Last punch timestamp: " + lastPunch.getTimestamp());
            System.out.println("Last punch type: " + lastPunch.getPunchType());

            LocalDate punchDate = lastPunch.getTimestamp().toLocalDate();
            LocalDate today = LocalDate.now();

            System.out.println("Punch date: " + punchDate);
            System.out.println("Today: " + today);

            if (punchDate.isEqual(today)) {
                if (lastPunch.getPunchType().equalsIgnoreCase("IN")) {
                    stats.put("currentStatus", "Clocked In");
                } else {
                    stats.put("currentStatus", "Clocked Out");
                }
            } else {
                stats.put("currentStatus", "Not Clocked In");
            }

            stats.put("lastPunchTime", lastPunch.getTimestamp());
        } else {
            stats.put("currentStatus", "Not Clocked In");
            stats.put("lastPunchTime", null);
        }

        List<Punch> allEmployeePunches = punchRepository.findByEmployee_IdOrderByTimestampDesc(employeeId);
        List<Map<String, Object>> recentPunches = allEmployeePunches.stream()
                .limit(5)
                .map(punch -> {
                    Map<String, Object> punchMap = new HashMap<>();
                    punchMap.put("id", punch.getId());
                    punchMap.put("timestamp", punch.getTimestamp());
                    punchMap.put("punchType", punch.getPunchType());
                    return punchMap;
                })
                .collect(Collectors.toList());
        stats.put("recentPunches", recentPunches);

        long pendingEmployeeOvertime = overtimeRequestRepository
                .findByEmployee_IdAndStatus(employeeId, "PENDING")
                .size();
        stats.put("pendingEmployeeOvertimeRequests", pendingEmployeeOvertime);

        return stats;
    }


    // --- NEW: Get Recent Activity for Admin Dashboard ---
    /**
     * Retrieves a list of recent punch activities across all employees for the admin dashboard.
     *
     * @param limit The maximum number of recent punches to retrieve.
     * @return A list of Maps, each representing a recent punch with simplified employee info.
     */
    public List<Map<String, Object>> getRecentAdminActivity(int limit) {
        // This will fetch all punches ordered by timestamp descending and limit them.
        // You might need to add `findTopNByOrderByTimestampDesc` or similar to PunchRepository
        // if `findAllByOrderByTimestampDesc` is too broad for very large datasets.
        // For now, let's assume `findAllByOrderByTimestampDesc` is sufficient, and we'll limit it.
        List<Punch> recentPunches = punchRepository.findAllByOrderByTimestampDesc();

        return recentPunches.stream()
                .limit(limit)
                .map(punch -> {
                    Map<String, Object> activityMap = new HashMap<>();
                    activityMap.put("id", punch.getId());
                    // Include employee's full name
                    activityMap.put("employeeName", punch.getEmployee().getFirstName() + " " + punch.getEmployee().getLastName());
                    activityMap.put("punchType", punch.getPunchType());
                    activityMap.put("timestamp", punch.getTimestamp());
                    return activityMap;
                })
                .collect(Collectors.toList());
    }
}