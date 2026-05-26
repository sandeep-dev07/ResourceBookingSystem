@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-8.0.492.9-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
cd /d e:\ResourceBookingSystem\springboot-service
C:\Tools\apache-maven-3.9.9\bin\mvn.cmd spring-boot:run
