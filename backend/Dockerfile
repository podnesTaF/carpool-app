# Stage 1: Build the application using Maven
FROM maven:3.8.7-openjdk-17 AS build
WORKDIR /app

# Copy only pom.xml first to cache dependencies
COPY pom.xml .
# Download dependencies (caching them)
RUN mvn dependency:go-offline

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create a lightweight runtime image
FROM openjdk:17-jdk-alpine
WORKDIR /app

# Copy the jar file from the build stage
# Adjust 'your-app.jar' to match the actual jar file name produced in the target folder
COPY --from=build /app/target/your-app.jar your-app.jar

# Expose the port your application listens on
EXPOSE 8080

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app.jar"]
