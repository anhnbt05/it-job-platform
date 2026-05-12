package com.itjob.jobservice.config.observability;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class HttpRequestLoggingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    @Value("${spring.application.name}")
    private String serviceName;

    @Value("${app.observability.log-file:}")
    private String logFilePath;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return request.getRequestURI().contains("/actuator");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startedAt = System.nanoTime();
        int status = HttpServletResponse.SC_OK;

        try {
            filterChain.doFilter(request, response);
            status = response.getStatus();
        } catch (IOException | ServletException exception) {
            status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
            throw exception;
        } catch (RuntimeException exception) {
            status = HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
            throw exception;
        } finally {
            writeLog(request, status, startedAt);
        }
    }

    private void writeLog(HttpServletRequest request, int status, long startedAt) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("timestamp", OffsetDateTime.now(ZoneOffset.UTC).toString());
        payload.put("service", serviceName);
        payload.put("event", "http_request");
        payload.put("method", request.getMethod());
        payload.put("path", request.getRequestURI());
        payload.put("status", status);
        payload.put("durationMs", TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt));

        if (StringUtils.hasText(request.getQueryString())) {
            payload.put("query", request.getQueryString());
        }

        if (StringUtils.hasText(request.getHeader("X-Request-Id"))) {
            payload.put("requestId", request.getHeader("X-Request-Id"));
        }

        if (StringUtils.hasText(request.getHeader("X-User-Id"))) {
            payload.put("userId", request.getHeader("X-User-Id"));
        }

        String forwardedFor = request.getHeader("X-Forwarded-For");
        payload.put("remoteAddress", StringUtils.hasText(forwardedFor) ? forwardedFor : request.getRemoteAddr());

        try {
            String line = objectMapper.writeValueAsString(payload);
            System.out.println(line);
            appendToFile(line);
        } catch (JsonProcessingException exception) {
            String fallback = "{\"service\":\"" + serviceName + "\",\"event\":\"http_request\",\"status\":" + status + "}";
            System.out.println(fallback);
            appendToFile(fallback);
        }
    }

    private void appendToFile(String line) {
        if (!StringUtils.hasText(logFilePath)) {
            return;
        }

        try {
            Path path = Paths.get(logFilePath).toAbsolutePath().normalize();
            if (path.getParent() != null) {
                Files.createDirectories(path.getParent());
            }

            Files.writeString(
                    path,
                    line + System.lineSeparator(),
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
            );
        } catch (IOException ignored) {
        }
    }
}
