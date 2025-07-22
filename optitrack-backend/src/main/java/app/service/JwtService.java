package app.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority; // Import for authorities
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors; // For stream operations

@Service
public class JwtService {

    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    // --- Token Generation ---

    // This method now collects roles from UserDetails and adds them as a claim
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        // Collect roles (authorities) from UserDetails and add them as a "roles" claim
        String roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        claims.put("roles", roles); // Store roles as a comma-separated string or array
        // If your UserDetails implementation has an employee ID, you can add it here too:
        // if (userDetails instanceof CustomUserDetails) {
        //     claims.put("employeeId", ((CustomUserDetails) userDetails).getEmployeeId());
        // }
        return generateToken(claims, userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 hours validity
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // --- Token Validation & Extraction ---

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token); // This implicitly calls extractAllClaims
        boolean isUsernameMatch = username.equals(userDetails.getUsername());
        boolean notExpired = !isTokenExpired(token);

        System.out.println("JWTService: Token Validation - Extracted Username: " + username + ", UserDetails Username: " + userDetails.getUsername());
        System.out.println("JWTService: Token Validation - Username Match: " + isUsernameMatch);
        System.out.println("JWTService: Token Validation - Is Token Expired: " + !notExpired + " (Expires at: " + extractExpiration(token) + ", Current Time: " + new Date() + ")");

        return isUsernameMatch && notExpired;
    }

    private boolean isTokenExpired(String token) {
        Date expiration = extractExpiration(token);
        System.out.println("JWTService: Token Expiration Time: " + expiration);
        boolean expired = expiration.before(new Date());
        if (expired) {
            System.out.println("JWTService: TOKEN IS EXPIRED!");
        }
        return expired;
    }

    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            System.out.println("JWTService: Extracted Subject (Username): " + username);
            return username;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("JWTService Error: Token is expired while extracting username. " + e.getMessage());
            return null; // Or throw a specific exception if preferred
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.err.println("JWTService Error: Invalid JWT signature while extracting username. This means the key is wrong or token tampered. " + e.getMessage());
            return null; // Or throw
        } catch (Exception e) {
            System.err.println("JWTService Error: General error extracting username from token: " + e.getMessage());
            return null; // Or throw
        }
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractRoles(String token) {
        return extractClaim(token, claims -> claims.get("roles", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts
                    .parserBuilder()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            System.out.println("JWTService: Successfully extracted all claims from token.");
            return claims;
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            System.err.println("JWTService Error: Token is expired. " + e.getMessage());
            throw e; // Re-throw to be caught by extractUsername or isTokenExpired
        } catch (io.jsonwebtoken.security.SignatureException e) {
            System.err.println("JWTService Error: Invalid JWT signature. Key mismatch or token tampered! " + e.getMessage());
            throw e; // Re-throw to be caught by extractUsername or isTokenExpired
        } catch (Exception e) {
            System.err.println("JWTService Error: Failed to parse JWT claims. Token might be malformed or invalid. " + e.getMessage());
            throw new RuntimeException("Failed to parse JWT claims", e); // Wrap and re-throw
        }
    }

    // --- Secret Key Management ---

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}