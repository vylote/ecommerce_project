# AGENTS / PROJECT CODING GUIDELINES

These guidelines apply to developers and AI coding agents working on Ecommerce Marketplace.

---

## 1. Emoji and Icon Rules

- For icons and logos in Markdown documentation, use badges from [Shields.io](https://shields.io/badges/static-badge). Prefer the `flat-square` style, provide descriptive alt text, and use text headings.
- Keep application code and UI free of emojis and icons.
  - Keep `log.info`, `log.warn`, `log.error`, and `console.log` messages plain text.
  - Keep push notifications, toasts, and notification center messages concise and plain text.
  - Use plain text in comments, function names, and template strings.
- Use standard log tags in square brackets.
  - `[INFO]`, `[WARN]`, `[ERROR]`
  - `[RABBITMQ INCOMING]`, `[RABBITMQ ACK SUCCESS]`, `[RABBITMQ FAILED]`
  - `[EMAIL OTP]`, `[EMAIL NOTIFICATION]`, `[SMS GATEWAY]`, `[ORDER EXPIRATION]`

---

## 2. Centralized Maven Version Management

Declare dependency and plugin versions in the `<properties>` section of `apps/api/pom.xml`. Reference these properties from dependency and plugin declarations.

```xml
<!-- Declare versions in properties -->
<properties>
    <flyway.version>12.10.0</flyway.version>
    <cloudinary.version>1.39.0</cloudinary.version>
    <spring-boot-starter-aop.version>3.4.2</spring-boot-starter-aop.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
        <version>${flyway.version}</version>
    </dependency>
</dependencies>
```

---

## 3. Centralized Environment Configuration

- Use a single `.env` file at the repository root for the backend, frontend, and realtime gateway.
- Keep environment configuration out of subdirectory files such as `apps/api/.env` and `apps/web/.env`.
- Use environment variable placeholders such as `${ENV_VAR:default_value}` in `application.yaml`. Keep SMTP credentials, Cloudinary credentials, database passwords, and JWT secrets in environment variables.

---

## 4. RabbitMQ and Audit Logging

- Set `durable = true` for exchanges and queues.
- Use `RabbitAuditAspect` to record queue names and worker processing times in milliseconds. Keep timing logic centralized in the aspect.
