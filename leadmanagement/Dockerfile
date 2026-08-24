FROM eclipse-temurin:17-jre

#current working directory
WORKDIR /app

#copy files
COPY target/leadmanagement-0.0.1-SNAPSHOT.jar app.jar

#expose the port
EXPOSE 8081

#cmd
CMD ["java", "-jar", "app.jar"]