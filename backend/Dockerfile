# ==============================================================================
# Multi-Stage Dockerfile for TOTC LMS ASP.NET Core 9 Web API
# Compliant with CIS Docker Benchmarks (Alpine Linux, non-root user, multi-stage)
# ==============================================================================

# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy project files for caching package restore
COPY ["src/Elearning.Domain/Elearning.Domain.csproj", "src/Elearning.Domain/"]
COPY ["src/Elearning.Application/Elearning.Application.csproj", "src/Elearning.Application/"]
COPY ["src/Elearning.Infrastructure/Elearning.Infrastructure.csproj", "src/Elearning.Infrastructure/"]
COPY ["src/Elearning.API/Elearning.API.csproj", "src/Elearning.API/"]

RUN dotnet restore "src/Elearning.API/Elearning.API.csproj"

# Copy full backend source code
COPY src/ src/

# Build and publish in Release mode
WORKDIR "/src/src/Elearning.API"
RUN dotnet publish "Elearning.API.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# Stage 2: Hardened Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app

# Install curl for container healthcheck
RUN apk add --no-cache curl

# Copy published application from build stage
COPY --from=build /app/publish .

# Create non-root directories for media and database
RUN mkdir -p /app/wwwroot/uploads /app/data && \
    chown -R app:app /app

# Switch to non-root user (UID 1654 default in .NET 9 Alpine images)
USER app

# Environment variables
ENV ASPNETCORE_URLS=http://+:5000 \
    DOTNET_RUNNING_IN_CONTAINER=true \
    ASPNETCORE_ENVIRONMENT=Production

# Expose Web API port
EXPOSE 5000

# Container liveness health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:5000/health/live || exit 1

ENTRYPOINT ["dotnet", "Elearning.API.dll"]
