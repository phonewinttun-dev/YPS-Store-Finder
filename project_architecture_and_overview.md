# 🏥 PROJECT Development & Architecture Guide

Welcome to the {{PROJECT_NAME}} development team! This guide details our system architecture, project layout, and standard implementation patterns to help you build cohesive and clean features using our **Feature-based Organization**.

---

## **🏗️ Architecture Overview**

Our projects follow a strict **Feature-based Organization**. Instead of grouping code by technical layers (e.g., all controllers in one folder, all services in another), we group all logical components of a business concern into a **Business Feature** directory.

The application follows a clean, direct request-to-persistence flow:

```
Request (Client) ──> Controller (Domain Feature) ──> Service (Business Logic) ──> Database (EF Core / AppDbContext)
```

---

### **High-Level Project Structure**

The solution is divided into the following projects and clients:

| Project / Directory                 | Type / Framework                        | Purpose                                                                                                         |
| :---------------------------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **`{{PROJECT_NAME}}.Api`**          | ASP.NET Core {{DOTNET_VERSION}} Web API | Exposes RESTful endpoints, handles auth middleware, hosts SignalR/real-time hubs, and serves API documentation. |
| **`{{PROJECT_NAME}}.Domain`**       | C# Class Library                        | Contains all business logic (Services), Controllers, DTOs, Realtime hubs, and Security extensions.              |
| **`{{PROJECT_NAME}}.Database`**     | C# Class Library                        | EF Core context (`AppDbContext`) and scaffolded entity models (prefixed with `Tbl` or custom prefix).           |
| **`{{PROJECT_NAME}}.Shared`**       | C# Class Library                        | Contains shared helpers, like pagination models and the standard `Result`/`Result<T>` pattern classes.          |
| **`{{PROJECT_NAME}}.Domain.Tests`** | xUnit Test Project                      | Unit tests mirroring the `{{PROJECT_NAME}}.Domain` feature folder structure.                                    |
| **`{{PROJECT_NAME}}.WebApp`**       | Blazor Web Assembly                     | Main web client application.                                                                                    |
| **`{{PROJECT_NAME}}.Mobile`**       | Flutter                                 | Cross-platform mobile client application.                                                                       |

---

## **📂 Deep Dive: Feature-based Organization**

Every business module (e.g., {{EXAMPLE_FEATURE_1}}, {{EXAMPLE_FEATURE_2}}) has dedicated folders inside `{{PROJECT_NAME}}.Domain`.

### **Anatomy of a Feature**

For any feature (e.g., `Features/{{EXAMPLE_FEATURE_1}}`), the code is organized across:

1. **`ACST.Api/Controllers/`**
   - **`[FeatureName]sController.cs`**: The API Controller exposing the REST endpoints. It receives requests, delegates processing to the service, and maps responses using the Result Pattern.
2. **`ACST.Domain/Features/[FeatureName]/`**
   - **`[FeatureName]Service.cs`** (and optional `I[FeatureName]Service.cs`): The business service class containing the feature logic (CRUD, validations, logic operations).
3. **`ACST.Domain/DTOs/[FeatureName]/`**
   - **`[FeatureName]DTO.cs`**: Request and Response data transfer objects (DTOs) for the feature endpoints.

> [!IMPORTANT]
> **Controllers live in `ACST.Api/Controllers/`**, exposing RESTful API endpoints and delegating business logic to services in `ACST.Domain`.

### **Current Features Registry**

Here is the list of feature modules currently in the domain:
{{FEATURES_LIST}}

---

## **🔄 Service Registration & Dependency Injection**

All domain features are registered in a single entry point: `{{PROJECT_NAME}}.Domain/FeatureManager.cs`.

To register a new service, add it inside the `AddDomain` (or similar registration) extension method:

```csharp
public static void AddDomain(this WebApplicationBuilder builder)
{
    // Database and external configs
    builder.Services.AddDbContext<AppDbContext>(...);

    // Feature Service Registrations
    builder.Services.AddScoped<I{{EXAMPLE_FEATURE_1}}Service, {{EXAMPLE_FEATURE_1}}Service>();
    // ...
}
```

---

## **🛡️ The Result Pattern**

We do not throw business exceptions or return raw database entities. Instead, services wrap all operational outputs in a `Result` or `Result<T>` structure (from `{{PROJECT_NAME}}.Shared`).

### **Standard Service Signature**

```csharp
public async Task<Result<{{EXAMPLE_FEATURE_1}}Dto>> Create{{EXAMPLE_FEATURE_1}}Async(Create{{EXAMPLE_FEATURE_1}}Request request)
{
    // Validation & check existing records
    if (await _context.Tbl{{EXAMPLE_FEATURE_1}}s.AnyAsync(...))
    {
        return Result.Failure<{{EXAMPLE_FEATURE_1}}Dto>("Record already exists.");
    }

    var entity = new Tbl{{EXAMPLE_FEATURE_1}} { /* map fields */ };
    _context.Tbl{{EXAMPLE_FEATURE_1}}s.Add(entity);
    await _context.SaveChangesAsync();

    return Result.Success(entity.ToDto());
}
```

### **Controller Translation Pattern**

```csharp
[HttpPost]
public async Task<IActionResult> Create(Create{{EXAMPLE_FEATURE_1}}Request request)
{
    var result = await _{{EXAMPLE_FEATURE_1_LOWER}}Service.Create{{EXAMPLE_FEATURE_1}}Async(request);
    return result.IsSuccess ? Ok(result) : BadRequest(result);
}
```

---

## **💾 Database & Models**

- **Scaffolded Entities**: DB tables map to C# classes prefixed with `Tbl` under `{{PROJECT_NAME}}.Database/Models/` (e.g. `Tbl{{EXAMPLE_FEATURE_1}}`).
- **Dual-Provider Setup**:
  - **Local Development**: {{LOCAL_DATABASE_PROVIDER}} configuration.
  - **Production**: {{PROD_DATABASE_PROVIDER}} configuration.
- **Seeding**: Setup and seeding process for the database.

---

## **🧪 Automated Testing Guidance**

We test business features using xUnit unit tests located in `{{PROJECT_NAME}}.Domain.Tests/`.

- Test classes mirror the folder structure under `Features/` (e.g. `{{PROJECT_NAME}}.Domain.Tests/{{EXAMPLE_FEATURE_1}}/{{EXAMPLE_FEATURE_1}}ServiceTests.cs`).
- Tests utilize a test database helper (e.g., in-memory SQLite) ensuring database commands execute in a clean environment for each run.

```sh
# Run all unit tests
dotnet test {{PROJECT_NAME}}.Domain.Tests
```

---

## **💡 Coding Conventions**

1. **One Feature, One Directory**: Keep all logic, services, and controllers for a feature grouped in its domain folder.
2. **DTO Isolation**: Put request/response models in `{{PROJECT_NAME}}.Domain/DTOs/[FeatureName]/` to preserve modularity.
3. **No CQRS/Mediator**: Keep features simple. Use direct `Controller ──> Service ──> DbContext` interactions.
4. **JWT Auth** (don't implement yet): Protect endpoints using `[Authorize(Roles = "...")]`.
5. **Real-time** (optional): Hook events to real-time hubs (e.g., SignalR) for push notifications.

---
