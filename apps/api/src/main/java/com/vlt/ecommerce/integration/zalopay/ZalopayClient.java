package com.vlt.ecommerce.integration.zalopay;

import java.net.URI;
import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vlt.ecommerce.config.properties.ZalopayProperties;
import com.vlt.ecommerce.service.exception.AppException;
import com.vlt.ecommerce.service.exception.ErrorCode;

@Component
public class ZalopayClient {
    private static final String SANDBOX_API = "https://sb-openapi.zalopay.vn";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final ZoneId VIETNAM_TIME = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter TRANSACTION_DATE = DateTimeFormatter.ofPattern("yyMMdd");
    private static final String APP_USER = "ecommerce-demo";
    private static final int SUCCESS = 1;
    private static final int FAILURE = 2;
    private static final int EXPIRED = -54;
    private static final int ORDER_NOT_FOUND = -101;
    private static final Duration SANDBOX_PAYMENT_WINDOW = Duration.ofMinutes(15);

    private final ZalopayProperties properties;
    private final ObjectMapper json;
    private final RestClient restClient;

    public ZalopayClient(ZalopayProperties properties, ObjectMapper json) {
        this.properties = properties;
        this.json = json;
        HttpClient client = HttpClient.newBuilder().connectTimeout(properties.timeout()).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(client);
        factory.setReadTimeout(properties.timeout());
        restClient = RestClient.builder().baseUrl(SANDBOX_API).requestFactory(factory).build();
    }

    public String newTransactionId() {
        Instant now = Instant.now();
        String date = now.atZone(VIETNAM_TIME).format(TRANSACTION_DATE);
        String timestamp = Long.toString(now.toEpochMilli(), Character.MAX_RADIX);
        return date + "_" + timestamp + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
    }

    public boolean paymentWindowElapsed(String transactionId) {
        String[] parts = transactionId.split("_", 3);
        if (parts.length != 3) return false;
        try {
            Instant issuedAt = Instant.ofEpochMilli(Long.parseLong(parts[1], Character.MAX_RADIX));
            return !Instant.now().isBefore(issuedAt.plus(SANDBOX_PAYMENT_WINDOW));
        } catch (NumberFormatException exception) {
            return false;
        }
    }

    public String createPayUrl(String transactionId, Long orderId, long amount) {
        String redirect = UriComponentsBuilder.fromUri(properties.redirectUrl())
                .queryParam("purchaseId", orderId)
                .build().toUriString();
        String embedded;
        try {
            embedded = json.writeValueAsString(Map.of(
                    "redirecturl", redirect,
                    "preferred_payment_method", List.of("zalopay_wallet")));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Cannot serialize Zalopay payment data", exception);
        }
        long time = Instant.now().toEpochMilli();
        String items = "[]";
        String input = "%s|%s|%s|%s|%s|%s|%s"
                .formatted(properties.appId(), transactionId, APP_USER, amount, time, embedded, items);
        Map<String, Object> body = new HashMap<>(Map.ofEntries(
                Map.entry("app_id", properties.appId()),
                Map.entry("app_trans_id", transactionId),
                Map.entry("app_user", APP_USER),
                Map.entry("amount", amount),
                Map.entry("app_time", time),
                Map.entry("embed_data", embedded),
                Map.entry("item", items),
                Map.entry("bank_code", ""),
                Map.entry("description", "Ecommerce sandbox payment"),
                Map.entry("mac", sign(properties.key1(), input))));
        if (properties.hasCallback()) body.put("callback_url", properties.callbackUrl().toString());
        try {
            CreateResult result = restClient.post().uri("/v2/create").contentType(MediaType.APPLICATION_JSON)
                    .body(body).retrieve().body(CreateResult.class);
            if (result != null && Integer.valueOf(SUCCESS).equals(result.code()) && isSandboxUrl(result.url())) {
                return result.url();
            }
        } catch (RestClientException exception) {
            throw new AppException(ErrorCode.ZALOPAY_GATEWAY_UNAVAILABLE);
        }
        throw new AppException(ErrorCode.ZALOPAY_GATEWAY_UNAVAILABLE);
    }

    public Optional<QueryResult> query(String transactionId) {
        if (!properties.configured()) return Optional.empty();
        String input = "%s|%s|%s".formatted(properties.appId(), transactionId, properties.key1());
        try {
            return Optional.ofNullable(restClient.post().uri("/v2/query").contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("app_id", properties.appId(), "app_trans_id", transactionId,
                            "mac", sign(properties.key1(), input)))
                    .retrieve().body(QueryResult.class));
        } catch (RestClientException exception) {
            return Optional.empty();
        }
    }

    public Optional<CallbackData> verifyCallback(String data, String signature, Integer type) {
        if (!properties.configured() || !Integer.valueOf(1).equals(type)) return Optional.empty();
        try {
            byte[] expected = HexFormat.of().parseHex(sign(properties.key2(), data));
            if (!MessageDigest.isEqual(expected, HexFormat.of().parseHex(signature))) return Optional.empty();
            CallbackData callback = json.readValue(data, CallbackData.class);
            return Optional.ofNullable(callback)
                    .filter(value -> Integer.valueOf(properties.appId()).equals(value.appId())
                            && value.transactionId() != null && value.amount() != null
                            && value.providerId() != null && value.providerId() > 0);
        } catch (IllegalArgumentException | JsonProcessingException exception) {
            return Optional.empty();
        }
    }

    private static String sign(String key, String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return HexFormat.of().formatHex(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Cannot initialize Zalopay HMAC", exception);
        }
    }

    private static boolean isSandboxUrl(String value) {
        if (value == null || value.length() > 2048) return false;
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme()) && uri.getUserInfo() == null
                    && "qcgateway.zalopay.vn".equalsIgnoreCase(uri.getHost());
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record CreateResult(@JsonProperty("return_code") Integer code, @JsonProperty("order_url") String url) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record QueryResult(
            @JsonProperty("return_code") Integer code,
            @JsonProperty("sub_return_code") Integer detail,
            Long amount,
            @JsonProperty("zp_trans_id") Long providerId
    ) {
        public boolean succeeded() {
            return Integer.valueOf(SUCCESS).equals(code) && providerId != null && providerId > 0;
        }

        public boolean expired() {
            return Integer.valueOf(FAILURE).equals(code) && Integer.valueOf(EXPIRED).equals(detail);
        }

        public boolean notFound() {
            return Integer.valueOf(FAILURE).equals(code) && Integer.valueOf(ORDER_NOT_FOUND).equals(detail);
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CallbackData(
            @JsonProperty("app_id") Integer appId,
            @JsonProperty("app_trans_id") String transactionId,
            Long amount,
            @JsonProperty("zp_trans_id") Long providerId
    ) {
    }
}
