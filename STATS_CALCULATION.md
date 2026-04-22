# Statistics Calculation Guide

This document explains how the Profile & Analytics dashboard aggregates user statistics from the database through the backend API and renders them on the frontend.

## Overview

The stats system is a **read-only aggregation pipeline** that queries three database tables (`conversations`, `messages`, `cache_entries`) and produces a single JSON payload consumed by the frontend Profile page.

```
Database Tables
    │
    ├── conversations (user_id, id)
    ├── messages      (conversation_id, role, meta JSON)
    └── cache_entries (user_id, hit_count, cost)
                │
                ▼
        GET /api/v1/stats
                │
                ▼
        ChatStats JSON
                │
                ▼
        Profile Page Cards
```

---

## Data Sources

### `messages` Table (Primary Source)

Each assistant message stores a `meta` JSON blob with these keys:

| Key | Type | Source |
|-----|------|--------|
| `cache_hit` | boolean | `True` if served from cache, `False` if live API call |
| `response_time_ms` | int | Elapsed time from request to response |
| `cost` | float | API cost charged for this response |
| `original_cost` | float | Original cost of the cached response (for savings calc) |
| `tokens_used` | int | Number of tokens consumed |
| `model` | string | LLM model name (e.g. `gemini-flash-latest`) |
| `provider` | string | LLM provider (e.g. `gemini`, `openai`) |

### `cache_entries` Table (Fallback Source)

If no assistant messages exist yet (or metadata is missing), the endpoint falls back to the `cache_entries` table to read aggregated `cost` and `hit_count` values via `cache_service.get_user_cache_stats()`.

---

## Endpoint: `GET /api/v1/stats`

**File:** `backend/app/api/routes/messages.py`

### Step 1 — Count Conversations

```python
total_conversations = count(Conversation.id) WHERE user_id = current_user.id
```

Simply counts how many conversation rows belong to the authenticated user.

### Step 2 — Count User Messages (Queries)

```python
total_messages = count(Message.id)
  JOIN Conversation ON messages.conversation_id = conversations.id
  WHERE user_id = current_user.id
    AND role = "user"
```

Counts only **user** messages — this represents the total number of queries the user has sent.

### Step 3 — Load All Assistant Messages

```python
assistant_messages = SELECT * FROM messages
  JOIN conversations ON messages.conversation_id = conversations.id
  WHERE user_id = current_user.id
    AND role = "assistant"
```

All assistant messages are fetched into memory and iterated once. This is the core loop that derives every other metric.

### Step 4 — Per-Message Aggregation Loop

For each assistant message, extract `meta` JSON and bucket values into accumulator lists:

```python
for msg in assistant_messages:
    meta = msg.meta or {}

    # Response Time
    rt = meta.get("response_time_ms")
    if rt is numeric:
        response_times.append(rt)
        if meta["cache_hit"] is True:
            cache_hit_times.append(rt)
        else:
            live_api_times.append(rt)

    # Tokens
    tokens = meta.get("tokens_used")
    if tokens is numeric:
        if meta["cache_hit"] is True:
            total_tokens_saved += tokens
        else:
            total_tokens_used += tokens

    # Cost Savings (only on cache hits)
    if meta["cache_hit"] is True:
        total_cost_saved += float(meta.get("original_cost") or meta.get("cost") or 0)

    # Model usage counter
    model = meta.get("model")
    provider = meta.get("provider")
    if model and provider:
        model_usage[(provider, model)] += 1
```

### Step 5 — Compute Averages

```python
avg_response_time       = sum(response_times)    / len(response_times)    or 0
avg_cache_hit_time      = sum(cache_hit_times)   / len(cache_hit_times)   or 0
avg_live_api_time       = sum(live_api_times)    / len(live_api_times)    or 0
```

### Step 6 — Compute Cache Efficiency

```python
total_assistant = len(assistant_messages)
cache_hits      = len(cache_hit_times)
cache_hit_rate  = (cache_hits / total_assistant * 100) if total_assistant else 0
```

This is the **percentage of assistant responses that were served from cache** rather than calling a live LLM API.

### Step 7 — Fallback for Missing Metadata

If `total_cost_saved` is still `0` (e.g. no messages with cost metadata), query `cache_entries` directly:

```python
cache_stats = cache_service.get_user_cache_stats(db, current_user.id)
total_cost_saved = cache_stats.get("total_cost_saved", 0)
```

### Step 8 — Build Response JSON

```json
{
  "totalConversations": <int>,
  "totalMessages": <int>,
  "cacheHitRate": <float>,
  "totalCostSaved": <float>,
  "averageResponseTime": <float>,
  "averageResponseTimeCacheHit": <float>,
  "averageResponseTimeLive": <float>,
  "totalTokensUsed": <int>,
  "totalTokensSaved": <int>,
  "topModels": [
    {"model": "...", "provider": "...", "usage": <int>}
  ]
}
```

---

## Frontend Type Mapping

**File:** `frontend/src/lib/types/chat.ts`

| JSON Key | TS Property | Card on Profile Page |
|----------|-------------|----------------------|
| `totalCostSaved` | `totalCostSaved` | **Total Savings** (DollarSign) |
| `cacheHitRate` | `cacheHitRate` | **Cache Efficiency** (Zap) |
| `totalMessages` | `totalMessages` | **Usage Volume** (MessageSquare) |
| `averageResponseTimeCacheHit` | `averageResponseTimeCacheHit` | **Performance — Cache Hit** (Clock) |
| `averageResponseTimeLive` | `averageResponseTimeLive` | **Performance — Live API** (Clock) |
| `totalTokensUsed` | `totalTokensUsed` | **Tokens Consumed** (Hash) |
| `totalTokensSaved` | `totalTokensSaved` | **Tokens Saved** (Layers) |

---

## Metric Formulas at a Glance

### Total Savings
```
total_cost_saved = Σ(original_cost) for all assistant messages WHERE cache_hit = True
```
Represents the API cost the user avoided by hitting the cache.

### Cache Efficiency
```
cache_hit_rate = (cache_hits / total_assistant_messages) × 100
```
Higher is better. 73% means ~3 out of 4 queries were served from cache.

### Usage Volume
```
total_messages = count(user messages)
```
Total number of queries the user has sent.

### Performance
```
avg_cache_hit_time = mean(response_time_ms) WHERE cache_hit = True
avg_live_api_time  = mean(response_time_ms) WHERE cache_hit = False
```
Side-by-side comparison showing how much faster cached responses are vs live API calls.

### Tokens Consumed
```
total_tokens_used = Σ(tokens_used) WHERE cache_hit = False
```
Tokens actually billed by the LLM provider.

### Tokens Saved
```
total_tokens_saved = Σ(tokens_used) WHERE cache_hit = True
```
Tokens that would have been billed but were served from cache instead.

---

## Example Walkthrough

Assume a user has sent **4 messages** with these assistant responses:

| Msg | Cache? | Response Time | Cost | Tokens |
|-----|--------|---------------|------|--------|
| 1 | ❌ Live | 1200 ms | $0.002 | 150 |
| 2 | ✅ Hit  | 12 ms   | $0.000 | 200 |
| 3 | ❌ Live | 1500 ms | $0.003 | 180 |
| 4 | ✅ Hit  | 8 ms    | $0.000 | 220 |

**Calculations:**

- `totalConversations` = 1
- `totalMessages` = 4
- `cacheHitRate` = (2 hits / 4 total) × 100 = **50.0%**
- `totalCostSaved` = $0.002 + $0.003 = **$0.005**
- `avgResponseTimeCacheHit` = (12 + 8) / 2 = **10 ms**
- `avgResponseTimeLive` = (1200 + 1500) / 2 = **1350 ms**
- `totalTokensUsed` = 150 + 180 = **330**
- `totalTokensSaved` = 200 + 220 = **420**

---

## Notes

- Stats are **computed on every request** (no caching layer on the backend). React Query on the frontend caches the result for 5 minutes (`staleTime`).
- If a user has **zero assistant messages**, all averages return `0` and `cacheHitRate` returns `0%`.
- Cost and token metadata are only populated when the backend stores them in `Message.meta` during `send_message()` or `regenerate_message()`.
