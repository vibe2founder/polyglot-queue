# Benchmark Results - All Native Parsers

**Data**: 03/02/2026
**Runtime**: Bun v1.3.1
**Machine**: Windows (via WSL)
**Iterations**: 1,000,000 per test

---

## 📊 Summary Table

| Protocol | Best Case | Worst Case | Notes |
|----------|-----------|------------|-------|
| **Redis (RESP)** | 13.5M ops/s | 13.5M ops/s | Highly optimized text protocol |
| **NATS** | 11.1M ops/s | 2.4M ops/s | Control msgs fastest, large MSG slower |
| **RabbitMQ (AMQP)** | 1.8M ops/s | 735K ops/s | Binary frames, size-dependent |
| **Kafka** | 1.8M ops/s | 760K ops/s | Binary protocol, similar to AMQP |

---

## 🔴 Redis RESP Parser

| Command Type | Ops/sec |
|--------------|---------|
| Simple String | **13,481,981** |

---

## 🟢 NATS Parser

| Message Type | Ops/sec |
|--------------|---------|
| Simple MSG | 3,194,394 |
| PING | **11,158,553** |
| PONG | 10,929,544 |
| +OK | 10,862,565 |
| INFO (JSON) | 2,857,294 |
| MSG with Reply | 2,400,310 |

---

## 🐰 RabbitMQ/AMQP Parser

| Frame Type | Ops/sec |
|------------|---------|
| HEARTBEAT (0 bytes) | **1,822,392** |
| METHOD (32 bytes) | 1,784,197 |
| HEADER (64 bytes) | 1,804,770 |
| BODY (256 bytes) | 1,615,828 |
| BODY (1024 bytes) | 735,798 |

---

## ☕ Kafka Binary Parser

### Response Parsing
| Payload Size | Ops/sec |
|--------------|---------|
| 16 bytes | **1,827,252** |
| 64 bytes | 1,799,188 |
| 256 bytes | 1,366,870 |
| 1024 bytes | 760,447 |

### Request Encoding
| Request Type | Ops/sec |
|--------------|---------|
| ApiVersions | 882,649 |
| Metadata | 812,767 |
| Produce | 811,199 |

---

## 🏆 Key Insights

1. **Redis RESP é o campeão absoluto** - O protocolo de texto simples permite parsing ultrarrápido de 13.5M ops/s.
2. **NATS é excelente para controle** - Commands como PING/PONG atingem 11M ops/s.
3. **Protocolos binários (AMQP/Kafka)** - Mantêm performance consistente de ~1.8M ops/s para payloads pequenos.
4. **Performance degrada com tamanho** - Payloads maiores (1KB+) reduzem throughput em ~60%.
5. **Zero dependencies** - Todas as métricas foram atingidas sem bibliotecas externas.

---

*Gerado autonomamente pelo Antigravity Agent.*
