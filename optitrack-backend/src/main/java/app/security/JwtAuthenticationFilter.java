package app.security;

import app.service.UserService;
import app.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userService;

    public JwtAuthenticationFilter(JwtService jwtService, UserService userService) {
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        System.out.println("\n--- JWT Filter Start for URI: " + request.getRequestURI() + " ---");

        // --- Step 1: Check for Authorization Header and Bearer Token ---
        // If no token, simply pass the request along.
        // This allows unauthenticated requests (like initial login) to proceed to other filters/handlers,
        // which the user confirmed is working fine.
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("JWT Filter: No Bearer token found in Authorization header. Proceeding unauthenticated.");
            filterChain.doFilter(request, response);
            System.out.println("--- JWT Filter End for URI: " + request.getRequestURI() + " (No Token) ---\n");
            return;
        }

        // --- Step 2: Extract JWT ---
        jwt = authHeader.substring(7); // "Bearer " is 7 characters long
        System.out.println("JWT Filter: Extracted JWT.");

        // --- Step 3: Check if authentication already exists in SecurityContext ---
        // This prevents unnecessary re-authentication if another filter has already done so.
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            System.out.println("JWT Filter: User already authenticated in SecurityContextHolder: " + SecurityContextHolder.getContext().getAuthentication().getName() + ". Skipping further JWT processing.");
            filterChain.doFilter(request, response);
            System.out.println("--- JWT Filter End for URI: " + request.getRequestURI() + " (Already Authenticated) ---\n");
            return;
        }

        // --- Step 4: Attempt JWT Authentication ---
        try {
            userEmail = jwtService.extractUsername(jwt); // Extract username (email) from token
            System.out.println("JWT Filter: Extracted username from JWT: " + userEmail);

            if (userEmail != null) {
                UserDetails userDetails = null;
                try {
                    // Load user details from your UserService
                    userDetails = this.userService.loadUserByUsername(userEmail);
                    System.out.println("JWT Filter: UserDetails loaded for: " + userDetails.getUsername() + ". Authorities: " + userDetails.getAuthorities());
                } catch (UsernameNotFoundException e) {
                    System.err.println("JWT Filter Error: User '" + userEmail + "' not found via UserService. This token might be for a deleted user. " + e.getMessage());
                    // Do not set authentication; let the request proceed to hit authorization checks, which will deny it.
                    filterChain.doFilter(request, response);
                    System.out.println("--- JWT Filter End for URI: " + request.getRequestURI() + " (User Not Found) ---\n");
                    return;
                } catch (Exception e) {
                    System.err.println("JWT Filter Error: Unexpected error loading UserDetails for '" + userEmail + "': " + e.getMessage());
                    filterChain.doFilter(request, response);
                    System.out.println("--- JWT Filter End for URI: " + request.getRequestURI() + " (UserDetails Load Error) ---\n");
                    return;
                }

                // Validate the token and user details
                if (userDetails != null && jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null, // Credentials are null after initial validation
                            userDetails.getAuthorities() // Use authorities from UserDetails
                    );
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // ⭐ CRITICAL: Set the Authentication object in the SecurityContextHolder ⭐
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    System.out.println("JWT Filter: Successfully set Authentication in SecurityContextHolder for: " + userDetails.getUsername());

                    // --- Diagnostic: Immediately re-check if it's set ---
                    if (SecurityContextHolder.getContext().getAuthentication() != null) {
                        System.out.println("JWT Filter Diagnostic: Authentication is PRESENT immediately after setting for " + SecurityContextHolder.getContext().getAuthentication().getName());
                    } else {
                        System.err.println("JWT Filter Diagnostic: Authentication IS NOT PRESENT immediately after setting. CRITICAL ERROR: Context was not set or was immediately cleared.");
                    }
                } else {
                    System.out.println("JWT Filter: Token invalid for user " + userEmail + " (might be expired/invalid signature/malformed). Not setting authentication.");
                    // Let the filter chain continue; it will eventually hit an AuthenticationEntryPoint or be denied by authorization rules.
                }
            } else {
                System.out.println("JWT Filter: Username could not be extracted from token. Proceeding unauthenticated.");
            }
        } catch (Exception e) {
            // Catch any general unexpected errors during token parsing/validation (e.g., malformed JWT, signature error)
            System.err.println("JWT Filter Error: General exception during JWT processing: " + e.getMessage());
            // Let the filter chain continue; it will eventually hit an AuthenticationEntryPoint or be denied by authorization rules.
        }

        filterChain.doFilter(request, response); // Continue the filter chain
        System.out.println("--- JWT Filter End for URI: " + request.getRequestURI() + " (Filter Chain Continued) ---\n");
    }
}