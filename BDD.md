# BDD: One-Q-4-All International Lib

## Feature: Universal Message Routing
  As a distributed systems architect
  I want to route messages between different queuing systems
  So that I can integrate heterogeneous microservices without custom glue code

  ### Scenario: Routing from NATS to Kafka
    Given a NATS broker is registered as "primary-nats"
    And a Kafka broker is registered as "target-kafka"
    And a route is defined from "primary-nats/orders" to "target-kafka/processing-orders"
    When a message with payload '{"id": 1}' is published to NATS topic "orders"
    Then the message should be automatically translated and published to Kafka topic "processing-orders"
    And the original NATS message should be acknowledged

  ### Scenario: Failover and Reliability
    Given a route is configured between "source" and "destination"
    When the "destination" broker is temporarily unavailable
    And a message is received from "source"
    Then the system should attempt to route the message
    And if the publish fails, it should NACK the original message to trigger a retry

  ### Scenario: Multi-Target Routing
    Given a route from "redis/sensor-data" to "kafka/analytics"
    And a route from "redis/sensor-data" to "nats/realtime-dashboard"
    When a message is received on Redis stream "sensor-data"
    Then it should be published to BOTH Kafka "analytics" and NATS "realtime-dashboard"

## Feature: Native Performance (Zero-Dependency)
  As a developer focused on efficiency
  I want the library to use native TCP implementations
  So that I can minimize memory overhead and CPU cycles

  ### Scenario: Parsing High Throughput Redis Streams
    Given a stream of RESP encoded messages from a TCP socket
    When the RespParser receives fragmented chunks
    Then it should accurately reconstruct the data without using external libraries
    And it should handle arrays and bulk strings with O(n) complexity
