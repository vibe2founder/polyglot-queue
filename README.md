# 🚀 Polyglot Queue

O **Polyglot Queue** é um Tradutor de Filas (Queue Translator) universal e nativo, construído para unificar o caos dos protocolos de mensageria em uma única interface elegante e eficiente.

Imagine poder rotear mensagens do **NATS** para o **Kafka**, do **Redis Streams** para o **RabbitMQ**, sem precisar de infraestruturas pesadas ou configurações complexas. O Polyglot Queue faz exatamente isso, utilizando implementações nativas e de alta performance.

---

## ✨ Funcionalidades

- 🔌 **Agnóstico a Protocolo**: Suporte nativo para Kafka, NATS, Redis Streams e RabbitMQ.
- 🔄 **Roteamento Inteligente**: Encaminhe mensagens entre diferentes brokers com facilidade.
- ⚡ **Performance Nativa**: Implementações focadas em baixo overhead e alta taxa de transferência.
- 🛠️ **Extensível**: Sistema de adaptadores que permite adicionar novos brokers em minutos.
- 🛡️ **Seguro & Confiável**: Suporte total para ACK/NACK e garantia de entrega.

---

## 🏗️ Como Funciona

O núcleo do projeto é o `QueueTranslator`, que gerencia diferentes adaptadores. Cada adaptador fala o "idioma" nativo do seu broker e o traduz para uma interface comum.

### Exemplo de Uso

```typescript
import { QueueTranslator } from './packages/core';
import { NatsAdapter } from './packages/nats-native';
import { KafkaAdapter } from './packages/kafka-native';

const translator = new QueueTranslator();

// Registra os brokers
await translator.register(new NatsAdapter({ url: 'nats://localhost:4222' }));
await translator.register(new KafkaAdapter({ brokers: ['localhost:9092'] }));

// Adiciona uma rota automática: NATS -> Kafka
await translator.addRoute('nats', 'order.created', 'kafka', 'processing.orders');
```

---

## 🛠️ Tecnologias Utilizadas

- **Runtime**: [Bun](https://bun.sh) (Performance extrema)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/) (Tipagem nominal semântica)
- **Protocolos**: TCP Nativo, RESP (Redis), Kafka Wire Protocol.

---

## 📝 Documentação e Relatórios

Para entender mais sobre a evolução do projeto e decisões técnicas:

- [📜 CHANGELOG.md](./CHANGELOG.md) - Histórico de todas as mudanças.
- [📊 Relatórios Técnicos](./reports/) - Detalhes profundos de implementação.

---

## 🚀 Como Testar

1. Certifique-se de ter o **Bun** instalado.
2. Clone o repositório.
3. Instale as dependências:
   ```bash
   bi # Alternativa para bun install via WSL
   ```
4. Execute os testes:
   ```bash
   bun test
   ```
