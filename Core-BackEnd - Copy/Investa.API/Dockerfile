# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and projects
COPY Investa.sln ./
COPY Investa.API/Investa.API.csproj Investa.API/
COPY Investa.Application/Investa.Application.csproj Investa.Application/
COPY Investa.Infrastructure/Investa.Infrastructure.csproj Investa.Infrastructure/
COPY Investa.Domain/Investa.Domain.csproj Investa.Domain/

# Restore
RUN dotnet restore "Investa.sln"

# Copy source
COPY . .

# Publish
RUN dotnet publish "Investa.API/Investa.API.csproj" -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

# Environment and ports
ENV ASPNETCORE_URLS="http://+:8080"
EXPOSE 8080

ENTRYPOINT ["dotnet", "Investa.API.dll"]
