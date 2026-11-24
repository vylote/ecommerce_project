package com.vlt.ecommerce.config;

import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

public final class Constants {

    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    public static final long ACCESS_COOKIE_MAX_AGE_SECONDS = Duration.ofDays(1).toSeconds();
    public static final long REFRESH_COOKIE_MAX_AGE_SECONDS = Duration.ofDays(7).toSeconds();

    public static final String SESSION_ID_CLAIM = "sessionId";
    public static final String USER_ID_CLAIM = "userId";
    public static final String ROLES_CLAIM = "roles";
    public static final String JWT_BLACKLIST_PREFIX = "jwt:blacklist:";
    public static final String AUTHORIZATION_CACHE_STATE_KEY = "authorization:{rbac}:state";
    public static final String USER_AUTHORIZATION_CACHE_PREFIX = "authorization:{rbac}:user:";
    public static final String ROLE_PERMISSION_CACHE_PREFIX = "authorization:{rbac}:role:";
    public static final Duration AUTHORIZATION_CACHE_TTL = Duration.ofMinutes(15);
    public static final int AUTHORIZATION_CACHE_LOCK_COUNT = 32;
    private static final String AUTHORIZATION_REDIS_INSTANCE_SCRIPT = """
            local runId = redis.call('INFO', 'server'):match('run_id:([%da-f]+)')
            if not runId then return redis.error_reply('Missing Redis run ID') end
            """;
    public static final String AUTHORIZATION_STABLE_GENERATION_SCRIPT = AUTHORIZATION_REDIS_INSTANCE_SCRIPT + """
            if redis.call('HLEN', KEYS[1]) > 1 then return nil end
            local generation = redis.call('HGET', KEYS[1], 'generation')
            if not generation then
                generation = ARGV[1]
                redis.call('HSET', KEYS[1], 'generation', generation)
            end
            return runId .. ':' .. generation
            """;
    public static final String AUTHORIZATION_WRITE_CACHE_SCRIPT = AUTHORIZATION_REDIS_INSTANCE_SCRIPT + """
            if redis.call('HLEN', KEYS[1]) ~= 1 then return 0 end
            if runId .. ':' .. redis.call('HGET', KEYS[1], 'generation') ~= ARGV[1] then return 0 end
            redis.call('SET', KEYS[2], ARGV[2], 'PX', ARGV[3])
            return 1
            """;
    public static final String AUTHORIZATION_FINISH_MUTATION_SCRIPT = """
            for i = 2, #KEYS do redis.call('DEL', KEYS[i]) end
            redis.call('HSET', KEYS[1], 'generation', ARGV[2])
            return redis.call('HDEL', KEYS[1], ARGV[1])
            """;
    public static final String EMAIL_OTP_KEY_PREFIX = "EMAIL_OTP:";
    public static final Duration EMAIL_OTP_TTL = Duration.ofMinutes(5);

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_BUYER = "ROLE_BUYER";
    public static final String ROLE_SELLER = "ROLE_SELLER";
    public static final Set<String> SYSTEM_ROLES = Set.of(ROLE_ADMIN, ROLE_SELLER, ROLE_BUYER);

    public static final String NOTIFICATION_FANOUT_EXCHANGE = "notification.fanout.exchange";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String NOTIFICATION_EMAIL_QUEUE = "notification.email.queue";
    public static final String NOTIFICATION_SMS_QUEUE = "notification.sms.queue";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.routing.key";
    public static final String ORDER_DELAY_EXCHANGE = "order.delay.exchange";
    public static final String ORDER_DELAY_QUEUE = "order.delay.queue";
    public static final String ORDER_DELAY_ROUTING_KEY = "order.delay.routing.key";
    public static final String ORDER_CANCEL_EXCHANGE = "order.cancel.exchange";
    public static final String ORDER_CANCEL_QUEUE = "order.cancel.queue";
    public static final String ORDER_CANCEL_ROUTING_KEY = "order.cancel.routing.key";

    public static final String ANALYTICS_PERIOD_DAY = "DAY";
    public static final String ANALYTICS_PERIOD_WEEK = "WEEK";
    public static final String ANALYTICS_PERIOD_MONTH = "MONTH";

    public static final String ACCOUNT_PASSWORD_REGEX =
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$!%*?&])[A-Za-z\\d@#$!%*?&]+$";
    public static final String VIETNAMESE_MOBILE_PHONE_REGEX =
            "^(0|\\+84)(3|5|7|8|9)[0-9]{8}$";

    public static final int MIN_REVIEW_STARS = 1;
    public static final int MAX_REVIEW_STARS = 5;

    public static final String VIETNAMESE_LANGUAGE = "vi";
    public static final Locale VIETNAMESE_LOCALE = Locale.forLanguageTag(VIETNAMESE_LANGUAGE);
    public static final String DEFAULT_LANGUAGE = VIETNAMESE_LANGUAGE;
    public static final Locale DEFAULT_LOCALE = Locale.forLanguageTag(DEFAULT_LANGUAGE);
    public static final String ENGLISH_LANGUAGE = Locale.ENGLISH.getLanguage();
    public static final String ALTERNATE_LANGUAGE_HEADER = "X-Lang";

    public static final Pattern EMAIL_TEMPLATE_PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{([a-zA-Z]+)}}");
    public static final Pattern EMAIL_TEMPLATE_REFERENCE_SECTION_PATTERN =
            Pattern.compile("(?s)<!-- refId:start -->.*?<!-- refId:end -->");

    public static final String CHROME_USER_AGENT_TOKEN = "chrome";

    private Constants() {
    }
}
