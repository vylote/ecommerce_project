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
- Preserve serialized RabbitMQ type IDs when moving message classes between packages. Map existing wire IDs to the relocated classes.

---

## 5. Java Imports

- Declare explicit imports at the top of each Java file and use simple names for external types and annotations throughout the Java source. Keep a fully qualified reference only when a name collision or framework syntax requires it.
- Preserve the nullability contract of framework overrides. When overriding a JSpecify `@NullMarked` method from an unmarked scope, annotate non-null parameters with `org.jspecify.annotations.NonNull` via an explicit import.
- For Spring AOP pointcuts that match annotations, bind the annotation to an explicitly typed advice parameter. When specifying `argNames`, list every formal parameter by its declared name and in declaration order, including the join point. Preserve single execution of shared advice when pointcuts overlap.

---

## 6. Record Lessons Learned

- After each correction or investigation that yields a reusable project lesson, add or update the relevant rule in this file. Keep the rule actionable and consolidate overlapping guidance.

### Constants and comments

- Keep values used by one class private and close to their usage. Put shared constants in the backend `config/Constants.java` or the web `shared/constants.js`. Use descriptive names to identify their purpose. Reuse standard constants for protocol headers and encodings.
- Put deployment-dependent values in the established environment configuration. Preserve serialized names and values when replacing literals with constants.
- Keep comments that explain constraints, ordering, compatibility, or business intent. Remove comments that repeat the code or describe an old edit.

### Backend package layout

- Place REST controllers and HTTP exception handlers in `web.rest` and `web.rest.errors`. Place JPA entities in `domain`, enums in `domain.enumeration`, and application events in `domain.event`.
- Keep repositories and their query projections in `repository` and `repository.projection`. Put service contracts in `service`, implementations in `service.impl`, and mappers, request and response DTOs, exceptions, and internal event listeners under the matching `service` subpackages.
- Keep bean configuration in `config`, JWT and authorization code in `security`, localization in `i18n`, and external adapters in the matching `integration` subpackages.

### Backend service contracts

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

- `main.jsx` mounts React and provides the Redux store. `App.jsx` composes application providers and the browser router. Register routes in `routes/AppRoutes.jsx` and keep each route page in its owning `features/<feature>/` directory.
- Pages compose layouts and feature components, read route state, and handle navigation. Place domain-specific forms, cards, tables, filters, and sections beside the page or in the feature's `components/` directory. Keep specialized controls local when sharing would require page-specific branches.
- Check both existing shared UI locations before adding a primitive. `shared/components/ui/` contains `FormInput`, `FormSelect`, and their shared styles. `shared/ui/` contains controls such as `Dialog`, `TextField`, and `QuantityStepper`. Extend the closest existing control. Place cross-feature compositions such as `Pagination` and `AuthLayout` in `shared/components/`.
- Feature code may depend on shared code. Keep shared UI independent of features and pages. When features need the same behavior, extract the reusable part or expose a narrow feature entry point. Avoid deep imports into another feature's internals.
- Keep domain logic and validation with the feature. Use `shared/hooks/` for cross-feature hooks, `shared/utils/api.js` for the Axios instance, `shared/i18n/` for translations, and `store/slice/` for Redux slices registered in `store/index.js`.

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

- For reloadable queries with a stable request callback, reuse `shared/hooks/useReloadableRequest.js` to derive loading state and cancel stale requests. Reset dependent pagination in the event handler that changes the filter. Resolve hook dependency warnings in the code.

### Naming and review

- Use `PascalCase.jsx` for components, `useXxx.js` for hooks without JSX, and `camelCase.js` for utilities. Keep component-specific styles nearby. Follow the surrounding module's export convention and preserve existing callers when extracting code.
- Use relative imports with the current Vite configuration. Name new route components with a `Page` suffix where it fits the feature. When lazy-loading a route, provide a Suspense fallback.
- During review, check ownership, existing primitives, prop defaults, native event and ref forwarding, URL behavior, and accessible states against the actual callers.

- When refactoring web UI, scan across features for repeated markup, utility classes, formatting, event handlers, and request lifecycles. Extract shared markup into a prop-driven component, pure calculations into helpers, and stateful logic into hooks. Migrate matching callers and preserve their defaults, routing, accessibility, and error handling. Check that the duplicated implementation is gone before adding another abstraction.
