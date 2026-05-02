---
title: 'How to Design Systems That Handle Millions of Users'
description: 'A staged framework for scaling from a single server to a globally distributed architecture, with concrete decision checkpoints, capacity planning math, and observability triggers at every milestone.'
pubDate: 2026-05-01
tags: ['engineering', 'system-design']
draft: false
---

![How to Design Systems That Handle Millions of Users](https://composeo-article-images.s3.us-east-1.amazonaws.com/how-to-design-systems-that-handle-millions-of-users.webp)

How to design systems that handle millions of users is one of the most searched questions in backend engineering, and for good reason: most engineers have sat in a system design interview, or worse, a production incident, and realized they didn't have a clear mental model for what comes after "add more servers." Designing systems that support millions of users isn't a single architectural decision. It's a staged sequence of choices, each one unlocking the next order-of-magnitude of capacity. Get the sequence wrong and you either over-engineer too early and kill your velocity, or under-engineer and scramble when traffic spikes.

This article walks you through those stages from a single-server setup to a globally distributed architecture, with concrete decision checkpoints at every milestone. If you want to go deeper on any of the layers covered here, [Posts tagged "engineering", imlucas.dev](https://imlucas.dev/tags/engineering/) publishes detailed breakdowns on each one, from database sharding internals to observability strategy.

## The six-stage scaling map: a framework for scalable system design

The most common mistake engineers make is designing for 10 million users on day one. Over-engineering at an early stage kills development velocity, wastes infrastructure budget, and introduces complexity you're not equipped to operate yet. Premature sharding or microservices adoption often harm early-stage velocity more than traffic spikes do, a pattern well-documented in engineering postmortems across the industry. The staged model gives you a principled way to know when to invest in the next layer, not before.

The six stages progress like this: (1) single server, (2) separated database, (3) cached reads plus a load balancer, (4) CDN plus async queues, (5) sharded data with read replicas, (6) globally distributed with CQRS. Each stage is triggered by observable load thresholds, not arbitrary timelines or gut feelings. The transition from Stage 1 to Stage 2 happens when your database CPU crosses around 70%, within the generally accepted 70–85% warning band used in SRE practice, not when you hit a certain funding milestone.

The mechanism that makes this work in practice is the decision checkpoint: a set of defined metrics (CPU utilization, p95 latency, error rate) that tell you when your current architecture is approaching its ceiling. Reactive scaling, fixing things after they break in production, is avoidable if you build these checkpoints into your operational routine from the start. Teams that define thresholds in advance tend to scale more smoothly; teams that don't often end up doing architecture work under pressure.

## Stages 1 and 2: from a single server to a separated, cached setup (0 to ~10K users)

A single server is a legitimate starting point. It handles co-located compute, app logic, and database traffic efficiently at low scale, and it's the simplest possible thing to operate. The signals that it's time to move on are specific: database CPU exceeding 70%, p95 query latency crossing 500ms, or any moment the database and app server are actively competing for memory on the same instance. None of these are vague. They're measurable.

Moving the database to a dedicated host typically reduces resource contention significantly by eliminating the competition for CPU and memory that degrades performance on a shared instance. The next move is adding an in-memory cache like Redis to serve repeated reads without touching the database on every request. The 80/20 rule is reliable here: roughly 20% of your data (hot rows, frequently queried records) accounts for around 80% of read traffic. Caching those aggressively can cut database load by 60–80% before you ever touch horizontal scaling, a significant performance gain from a relatively contained infrastructure change.

Vertical scaling is cheap and fast to implement, but it has a hard ceiling. At some point, you've exhausted the cost-effective instance sizes and you're still seeing degradation under load. That's your checkpoint for Stage 3. The decision isn't "when do we feel ready to scale horizontally?" It's "when have we hit the ceiling of what a single, larger machine can cost-effectively deliver?" Those are very different questions, and the second one has a concrete answer.

## Stages 3 and 4: horizontal scale, load balancing, and async processing (10K to 500K users)

Stateless services are the prerequisite for horizontal scaling. Any session state, local file storage, or in-process caching that ties a request to a specific server has to move out before you can treat individual instances as disposable. Once your web tier is stateless, you can scale it horizontally behind a load balancer (AWS ELB, NGINX, HAProxy) and gain fault tolerance for the first time. This is the stage where you eliminate the single point of failure in your architecture.

A CDN offloads static assets to edge nodes, cutting origin server load by 50–80% for media-heavy applications. Simultaneously, read replicas on your database distribute the roughly 80% of traffic that's reads across multiple nodes while all writes still go to the primary. This combination handles the majority of scaling challenges in the 10K–500K user range without requiring sharding. In practice, many B2B SaaS products and typical web applications never need to go further than this, though the point at which sharding becomes necessary depends heavily on write volume and dataset size.

### Offloading async work: the queue decision

Inline synchronous processing becomes a serious bottleneck as concurrency grows. Image resizing, email sending, report generation: these operations have no business being in the critical request path. Offloading them to message queues (SQS, RabbitMQ, Kafka) decouples them entirely. The request returns immediately; a worker consumes the task asynchronously. A common heuristic: if any synchronous operation in your critical path consistently adds 100ms or more to request latency, it's worth evaluating as a queue candidate, though the right threshold depends on your specific SLOs.

## Stages 5 and 6: designing systems that handle millions of users at data scale (500K to 10M+)

At this scale, the database becomes the constraint again, but for different reasons than Stage 1. You're no longer fighting resource contention on a single host; you're fighting write throughput and dataset size. [Sharding vs partitioning vs replication](https://dev.to/devcorner/sharding-vs-partitioning-vs-replication-a-complete-guide-17b2) is a useful primer when deciding how to split data: sharding splits data horizontally across nodes by a partition key (user ID, region), enabling write scalability and massive dataset growth. Replication copies the full dataset for read scaling and high availability, but doesn't solve write bottlenecks. They're complementary tools, not alternatives.

[Distributed SQL databases like YugabyteDB and CockroachDB](https://www.yugabyte.com/blog/sharded-vs-distributed-resilience-high-availability/) automate both sharding and replication. They shard internally, replicate per shard, and maintain ACID guarantees across nodes. For most engineering teams at this scale, distributed SQL eliminates the operational complexity of manual sharding while delivering availability that manual approaches rarely match without substantial additional investment. A well-configured distributed SQL cluster with high replication factors can reach five-nines availability; achieving comparable uptime with hand-rolled sharding typically requires considerably more engineering overhead.

CQRS (Command Query Responsibility Segregation) separates the read and write paths entirely, letting you scale each independently. Write models handle mutations; read models serve queries from denormalized, precomputed views at high throughput. This pattern appears at Stage 6 when independent read scaling becomes a hard requirement, and it pairs naturally with event sourcing for temporal queries. Amazon and large e-commerce platforms use it precisely because the read-to-write ratio is so heavily skewed that treating both paths identically wastes resources on one end and bottlenecks the other.

Instagram's scaling history is the most instructive real-world reference here. They scaled from 14 million users with 3 engineers to 400 million daily active users by making a handful of deliberate choices: sharding PostgreSQL by user ID, running Cassandra clusters per continent for feed data to manage latency, and rewriting Python hot paths in Cython before adding hardware. The most transferable lesson is their sequencing: optimize code and queries first, add infrastructure second. Most teams reverse this and end up overprovisioning instead of profiling. For a deeper technical retrospective on how Instagram evolved its infrastructure, see this write-up on [how Instagram scaled its infrastructure](https://blog.bytebytego.com/p/how-instagram-scaled-its-infrastructure).

## Capacity planning for millions of users: turning user counts into resource estimates

Capacity planning for millions of users starts with a back-of-envelope calculation that converts user counts into infrastructure requirements. The core assumptions chain together:

1. Assume 1–10% of total users are daily active users (DAU).
2. Assume 1–5% of DAU are concurrently active during peak.
3. Multiply concurrent users by average requests per second per user to get peak RPS at the web tier.
4. Apply a downstream amplification factor of 2–4x for database queries per web request.

For 10 million total users, this typically yields 4,000–10,000 RPS at the API layer and 10,000–30,000 database operations per second.

Each tier has different resource constraints, and they require separate planning. The web tier is stateless and scales horizontally; target CPU below 70% per instance and provision for peak with 20–30% headroom. The API layer has roughly 3x amplification to the database, so it needs caching in front of it. The database layer is the hardest to scale: 10TB of data at 300K ops/sec requires a sharded setup with 5–20 nodes, tuned indexes, and hot data cached aggressively. For practical cache-tuning and optimization techniques when you reach this point, review this [guide to cache optimization strategies](https://redis.io/blog/guide-to-cache-optimization-strategies/).

The standard recommendation is to provision 20–50% above your estimated peak to absorb unexpected spikes. Traffic spikes can reach 10x average for event-driven products, and your capacity plan is a starting point, not a contract. Real-world tuning after profiling always surfaces application-specific constraints that estimates miss. Use load testing tools like k6 or JMeter to validate estimates before they become production surprises. For teams dealing with AI workloads and high-throughput inference, which carry distinct resource profiles from standard web services, [How Does a Large Language Model Actually Work? An Engineering Perspective, imlucas.dev](https://imlucas.dev/blog/how-does-a-large-language-model-actually-work/) covers layer-specific capacity planning in more depth.

## Observability and knowing when your architecture needs to evolve

Three metrics matter at every stage: latency (p95 and p99), throughput (RPS), and error rate. A common SLO target is error rate below 0.1%, though some organizations use 1% as a critical alert threshold depending on product context. What matters is that you define the threshold explicitly and treat it as a trigger. CPU and memory utilization are lagging indicators; by the time they spike, users are already seeing degraded performance. Instrument your system to track latency at the boundary of each tier (web, API, database, cache) so you know exactly which layer is the bottleneck before it becomes a production incident. Boundary-level instrumentation is the difference between a 30-minute diagnosis and a 3-hour war room.

Load testing should run continuously in staging, not once before launch. Simulate your estimated peak RPS, then push to 2–3x that figure to find where the architecture breaks. The failure mode matters as much as the threshold: does latency degrade gracefully, or does the system fall off a cliff at a specific concurrency level? Gradual degradation is acceptable engineering; cliff-edge failure is a design flaw that needs to be found in staging, not production.

Define decision checkpoints explicitly and document them as organizational examples calibrated to your workload, not universal rules. For instance: "When p95 latency on the API layer exceeds 200ms at peak load, we evaluate caching strategy." "When database CPU sustains above 70% for three consecutive hours, we evaluate read replicas." These function as triggers that kick off a structured architectural review. Teams that build this discipline into their operational playbook scale deliberately instead of reacting to outages.

## Build the foundation, then earn the next layer

Designing systems that handle millions of users is a staged discipline, not a one-time architectural leap. You don't need globally distributed architecture on day one; you need to know exactly when each layer becomes the constraint and what to reach for next. The six stages in this framework give you that map: start simple, instrument everything, and let your metrics drive the next architectural move rather than speculation about future scale. Apply that sequencing consistently and the path from a single server to a globally distributed system becomes a series of deliberate, well-timed decisions.

Each layer covered here has real depth beneath the surface: sharding internals, distributed SQL trade-offs, CQRS implementation patterns, observability stack design. [Hello World: Why I Started This Blog, imlucas.dev](https://imlucas.dev/hello-world/) publishes detailed breakdowns on all of it, written for engineers who are actually building these systems. If any section here left you wanting more specifics, that's where to go next.
