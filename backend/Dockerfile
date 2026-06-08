# syntax=docker/dockerfile:1

# build.gradle uses Java 21, and gradle-wrapper.properties pins Gradle 8.12.
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace

COPY gradlew build.gradle settings.gradle ./
COPY gradle ./gradle

RUN chmod +x ./gradlew
RUN ./gradlew --version
RUN ./gradlew dependencies --no-daemon

COPY src ./src

RUN ./gradlew clean build -Pspring.profiles.active=test --no-daemon \
    && JAR_FILE="$(find build/libs -type f -name '*.jar' ! -name '*-plain.jar' | head -n 1)" \
    && cp "$JAR_FILE" app.jar

FROM eclipse-temurin:21-jre-alpine AS run
WORKDIR /app

RUN addgroup -S spring \
    && adduser -S spring -G spring \
    && mkdir -p /app/uploads \
    && chown -R spring:spring /app

USER spring

ENV UPLOAD_PATH=/app/uploads/
EXPOSE 8080

COPY --from=build /workspace/app.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
