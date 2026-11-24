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

- Bind related Spring settings with `@ConfigurationProperties` in `config.properties` and inject the typed bean into consumers. Reuse Spring Boot property beans for framework settings. Keep the same YAML keys and environment mappings when migrating existing settings.

---

## 4. RabbitMQ and Audit Logging

- Set `durable = true` for exchanges and queues.
- Use `RabbitAuditAspect` to record queue names and worker processing times in milliseconds. Keep timing logic centralized in the aspect.
- Preserve serialized RabbitMQ type IDs when moving message classes between packages. Map existing wire IDs to the relocated classes.
- Use the Jackson 3 converter and type mapper for Spring AMQP. Preserve wire names and the JSON shape when replacing the converter.

---

## 5. Java Imports

- Declare explicit imports at the top of each Java file and use simple names for external types and annotations throughout the Java source. Keep a fully qualified reference only when a name collision or framework syntax requires it.
- Remove unused imports after refactoring and omit imports for types in the same Java package.
- Preserve the nullability contract of framework overrides. When overriding a JSpecify `@NullMarked` method from an unmarked scope, annotate non-null parameters with `org.jspecify.annotations.NonNull` via an explicit import.
- For Spring AOP pointcuts that match annotations, bind the annotation to an explicitly typed advice parameter. When specifying `argNames`, list every formal parameter by its declared name and in declaration order, including the join point. Preserve single execution of shared advice when pointcuts overlap.

---

## 6. Record Lessons Learned

- After each correction or investigation that yields a reusable project lesson, add or update the relevant rule in this file. Keep the rule actionable and consolidate overlapping guidance.

### Constants and comments

- Declare Java static final constants in config/Constants.java, including values used by a single class. Keep class-specific JVM metadata such as serialVersionUID on the owning class. Group constants by purpose, use descriptive names, and reuse standard library constants for protocol headers and encodings. Centralize shared frontend values in shared/constants.js.
- Put deployment-dependent values in the established environment configuration. Preserve serialized names and values when replacing literals with constants.

### Readability and control flow

- Use clear names and straightforward code so readers can see what it does. Keep comments for non-obvious business rules, constraints, ordering dependencies, or compatibility decisions. Remove comments that restate the code or describe past edits.
- Minimize branching and nesting. Use guard clauses for invalid inputs or cases that need no work, and keep the main path easy to follow. Review nested `if`, `for`, and `while` blocks for duplicate checks or conditions that can be evaluated once.
- Keep loops and branches when they clearly express the behavior. Prefer a simple loop over a dense collection pipeline or a chain of ternaries. Extract a helper only when it names a meaningful operation or removes duplication. Preserve evaluation order, short-circuiting, and side effects when simplifying control flow.

### Dependency injection and logging

- Inject Spring dependencies through the constructor. Represent an optional dependency explicitly with `Optional<T>` when the service can operate without that bean.
- Log each operation's outcome once with relevant context. Omit decorative separators, repeated messages, and sensitive data such as OTPs or email contents.

### Email templates

- Store email layout and markup in UTF-8 HTML templates under apps/api/src/main/resources/templates/mail/. Load templates from the classpath and HTML-escape dynamic text when rendering.

### Response DTOs

- Choose Lombok annotations based on how each response is constructed and consumed. Use getters for read-only response DTOs and declare field visibility directly. Keep setters or value equality where code relies on them.
- Avoid pairing a class-level @Builder with explicit constructor annotations unless a caller, mapper, or deserializer needs those constructors. Before removing annotations, check direct construction, mapper targets, default values, and JSON property names.

### Backend package layout

- Place REST controllers and HTTP exception handlers in `web.rest` and `web.rest.errors`. Place JPA entities in `domain`, enums in `domain.enumeration`, and application events in `domain.event`.
- Keep repositories and their query projections in `repository` and `repository.projection`. Put service contracts in `service`, implementations in `service.impl`, and mappers, request and response DTOs, exceptions, and internal event listeners under the matching `service` subpackages.
- Keep bean configuration in `config`, JWT and authorization code in `security`, localization in `i18n`, and external adapters in the matching `integration` subpackages.

### JPA entity construction

- Declare entity field visibility directly. Keep a public or protected no-argument constructor for JPA, using the implicit constructor when it meets that contract.
- Keep builder and all-arguments constructor annotations when application code relies on the builder. Use setter mapping for simple entities created by MapStruct. Check existing construction sites and preserve field initializers when removing @Builder.Default.

### JPA column mappings

- Declare the existing physical column name explicitly with @Column(name = "...") for every basic persistent field, including identifiers and version fields. Keep other column attributes intact and verify names against the schema before modifying mappings.
- Use @JoinColumn or @JoinTable for owning relationships and mappedBy for inverse relationships.

### SOLID and mapper ownership

- Give controllers, services, repositories, and mappers clear responsibilities. Keep business orchestration in services, keep interfaces focused on caller needs, honor interface contracts in implementations, and depend on stable abstractions at module boundaries. Extend through composition where behavior genuinely varies.
- Put pure entity and DTO conversion in stateless Spring-managed mappers under service.mapper. Reuse existing mapper beans through constructor injection and use MapStruct for direct field mappings. Use custom mapper methods for transformations that need explicit control. Keep data access, authorization, and business decisions in services.

- Resolve the authenticated user through CurrentUserProvider. Read the email or user ID directly when the caller only needs identity. Load the User entity when business logic needs it. Resolve identity from the current security context on each call and keep authorization decisions with their owners.

### ACID and transaction boundaries

- Define transaction boundaries at the service use case. Commit related writes atomically and check rollback behavior when exceptions are caught, checked, or translated.
- Preserve consistency with database constraints and domain invariants. Use database-enforced uniqueness, optimistic locking, or targeted pessimistic locking where concurrent operations can violate invariants. Choose isolation based on the actual race or read consistency requirement.
- Persist durable state before acknowledging success. Coordinate external side effects with the commit, and use an outbox with idempotent consumers when delivery must survive a process failure.

### Backend service contracts

- Group related service inputs into an immutable parameter object when positional arguments become hard to distinguish or evolve. Use a record for a data-only input and add a builder when named fields improve the call site. Keep short, clear signatures simple.

- Keep one interface for the related use cases of a service, including operations called by controllers and other beans. Use a separate interface when it defines a distinct responsibility or integration boundary.
- For standalone services called by other beans, such as application services or integration adapters, define an interface for the operations their callers need and provide a Spring-managed implementation.
- Keep methods used solely inside an implementation private. Check callers and Spring proxy behavior before narrowing visibility, especially for transaction, security, and async annotations.
- Name contract operations after what callers need and keep provider-specific identifiers and parsing inside the implementation.

---

## 7. Tests and Builds

- Do not add or run tests, compile source code, or run builds. Use source inspection and Git diff checks for verification.

---

## 8. React Component Architecture

Apply these conventions when creating, extracting, refactoring, or reviewing React components and hooks in `apps/web`. Paths below are relative to `apps/web/src/`.

### Placement and dependencies

- Organize the React source using the JHipster React layout under `apps/web/src/app/`. The Vite entry point is `app/main.jsx`. `app/App.jsx` composes app providers and the browser router. Register routes in `app/routes/AppRoutes.jsx`.
- Keep Redux configuration and slices in `app/config/store/` and the Axios client in `app/config/api.js`. Place translations, their provider, and the language hook in `i18n/`.
- Keep route pages and user workflows in `app/modules/`. The account module owns authentication and profile pages, and the storefront module owns the home page and catalog. Keep workflow-specific forms, tables, and filters beside their owning pages.
- Put reusable entity-specific code in `app/entities/`, such as product cards and image selection or order status charts. Pages and modules compose this code. Keep entity code independent of page-specific workflows.
- Put shared UI primitives in `app/shared/ui/`. Look for existing controls, including `FormInput`, `FormSelect`, `Dialog`, `TextField`, and `QuantityStepper`, before creating another. Put cross-module compositions in `app/shared/components/` and hooks in `app/shared/hooks/`.
- Keep domain logic and validation with their owner. Use shared code for behavior and presentation that multiple modules reuse.

### Designing the component API

- Give each component one responsibility. Pass data down and report interactions through callbacks such as `onChange`, `onSubmit`, and `onClose`. Keep API calls, Redux dispatch, routing, and business copy outside presentational controls.
- Share repeated design through small controls with sensible defaults. For example, `FormSelect` owns the select styling. The caller supplies its value, options as children, change handler, and width through `className`. Forward native attributes, accessibility attributes, and refs to the underlying element.
- Prefer composition for content that varies. A dialog can receive a title, body, and actions. A create/edit form can share fields and validation while its caller supplies initial values, the submit callback, and the action label.
- Look for two or three concrete uses before introducing an abstraction. If an API grows beyond roughly seven custom props or accumulates mode flags, reconsider its responsibilities. Keep Tailwind and daisyUI variants together and reuse the existing class-composition pattern.
- Associate labels with inputs, connect hints and errors with `aria-describedby`, and set `aria-invalid` for invalid fields. Give icon-only buttons an accessible name. Data views should handle loading, failure, and empty results.

### State, effects, and React 19

- Keep field values and dialog visibility local. Lift state to the nearest common owner when siblings share it. Use React Router search parameters for shareable filters, search terms, and pagination. Use Redux Toolkit for application-wide state or drafts that span routes.
- Put feature requests and mutations in feature hooks or API functions. Trigger user-initiated work from event handlers or form actions. For route data, use loaders where a data router is available. Reserve effects for external synchronization, including socket subscriptions with cleanup.
- Calculate derived values during render. Use a key when a different record should start a fresh form. Define components at module scope and use stable record IDs as keys for editable or sortable lists.
- In React 19, function components can receive `ref` as a prop and provide context with `<SomeContext value={value}>`. Use `use()` to read context or a stable promise with a Suspense boundary. Route pages can supply document metadata with `<title>` and `<meta>`.
- For action-based forms, use `useActionState` for submission results and pending state, or `useFormStatus` in a child of the submitting form. Use `useOptimistic` when an action benefits from immediate feedback. Add memoization when profiling identifies a cost.

- For reloadable queries with a stable request callback, reuse `app/shared/hooks/useReloadableRequest.js` to derive loading state and cancel stale requests. Reset dependent pagination in the event handler that changes the filter. Resolve hook dependency warnings in the code.

### Naming and review

- Use `PascalCase.jsx` for components, `useXxx.js` for hooks without JSX, and `camelCase.js` for utilities. Keep component-specific styles nearby. Follow the surrounding module's export convention and preserve existing callers when extracting code.
- Use relative imports with the current Vite configuration. Name new route components with a `Page` suffix where it fits the feature. When lazy-loading a route, provide a Suspense fallback.
- During review, check ownership, existing primitives, prop defaults, native event and ref forwarding, URL behavior, and accessible states against the actual callers.

- When refactoring web UI, scan across features for repeated markup, utility classes, formatting, event handlers, and request lifecycles. Extract shared markup into a prop-driven component, pure calculations into helpers, and stateful logic into hooks. Migrate matching callers and preserve their defaults, routing, accessibility, and error handling. Check that the duplicated implementation is gone before adding another abstraction.

## Backend validation and localization

- Return API error messages in English, including authentication, framework errors, and Bean Validation. Keep the request locale for other localized content.
- Assign each business domain its own 1,000-number range in ErrorCode. Reserve 1000 for success and keep every error number unique within the range of its owning domain. Reuse the same code across callers for the same failure. Keep frontend consumers in sync when changing an existing number. Reserve generic codes for boundary failures without reliable domain context.
- Return the same invalid-credentials response for unknown login identifiers and incorrect passwords.


- Write all new agent rules and skills in English. Before changing validation, trace the controller or service entry point to `@Valid` or `validator.validate(...)` and follow the error handler to the returned response.
- Check existing constraints, their `ConstraintValidator` implementations, and regexes in `Constants`. Where available, look in `handler/annotation` and `handler/validator` for `@NotNullWithArgs`, `@PatternWithArgs`, and `@MaxWithArgs`. Use standard Jakarta constraints when they express the rule directly.
- Use bundle keys for user-facing validation messages. Keep the default Vietnamese bundle and both VI/EN bundles under `i18n/` in sync. For standard constraints use named attributes such as `{value}` and `{max}`. For argument-aware validators, pass a localizable field name via `args` and match the validator's argument order in both translations. For example, if supported, `@MaxWithArgs(args = "description", value = 500)` supplies the field at `{0}` and the limit at `{1}`.
- Check omitted fields, explicit nulls, empty strings, whitespace, and both sides of a boundary. Pair optional format or range constraints with a required constraint where appropriate. Use `@GroupSequence` when the returned error depends on validation order.
- Check existing string utilities before adding helpers. Use Spring's `StringUtils.hasText()` for non-whitespace text. Keep format checks on DTOs and data-dependent checks in the owning service, such as matching an identity number to a customer and session.
- For business errors reuse this project's `AppException` and `ErrorCode` (the equivalents of `ApplicationException` and `ApplicationExceptionCode`). Write the message for each code in English.
- Report the entry point, reused constraints or helpers, and input cases reviewed. Distinguish source inspection from runtime verification.
