---
layout: post
title: "Running Google ADK Agents on AWS Bedrock via LiteLLM in Production: A Practical Guide to the Gotchas"
date: 2026-03-05 22:20:00.000000000 +02:00
tags:
- Google ADK
- AWS Bedrock
- LiteLLM
- AI Agents
- Python
- Production
- Observability
---

{:refdef: style="text-align: center;"}
[![post image]({{ "/assets/2026-03-05-Running-Google-ADK-Agents-on-AWS-Bedrock-via-LiteLLM.jpeg" | absolute_url }}){: loading="lazy"}](/)
{: refdef}

---

It was supposed to be one of those focused days, the kind where you block off a few hours for deep work and knowledge transfer (set your MS Teams status to "Do Not Disturb" and hope for the best).\
Suvi. R. - One of the engineers on the team was going to walk me through the current [identity state management](https://gemini.google.com/share/48065527603e) logic. The kind of knowledge transfer session you actually look forward to, because it means you'll finish the day understanding something you didn't before.

### What's Identity State Management?

Quick context for why this matters: in a multi-agent system, every agent needs to know *who* it's talking about before the conversation starts.
Think of it like a hospital - you get there and provide the receptionist with your medical aid number, file number or ID, before you actually see the doctor. The back office pulls your full profile: name, date of birth, allergies, medical history, what products you're covered for. The doctor never asks "what's your name?" - they already have the complete file.

That's what identity state management does for our agents. A single identifier comes in, the system resolves it into a full customer profile - accounts, products, contact details, access boundaries - and stamps it into the agent's session state before the first message is even sent. Every tool the agent calls gets this identity for free. No duplicate API lookups, no inconsistent data, no "which customer are we talking about?" mid-conversation.

The boundaries are the part that matters most.
Back to the hospital: the paediatric ward checks the patient file and says, "This patient is 45 years old. We only treat children. You shall not pass (*channelling Gandalf*)!!!"

<p style="text-align: center;">
  <img src="{{ '/assets/you-shall-not-pass.jpeg' | absolute_url }}" alt="You shall not pass" loading="lazy">
</p>
The orthopaedic ward says, "No surgical history on file. Not our patient." Each ward knows what kind of patients it handles, and it enforces that at the door — not halfway through a consultation. Show up at the wrong ward? You're turned away at the door before you ever see a doctor.

One lookup, shared everywhere, enforced at the gate. But enough about hospitals - you and I aren't doctors anyways. Well, not the useful kind. We're the kind that debug pod restarts at midnight and call it "practice".

Further reading on identity state management in Agentic AI: https://gemini.google.com/share/48065527603e

---

Anyways back to the issue - before the session, I figured I'd spin up the service and poke around in ADK Web - get a feel for the flow, have something concrete to reference before we go into our session. The responsible thing to do. The *"I'll just do a quick sanity check first"* thing to do. *Famous last words.*

**Memo to self:** Don't Shave the Yak. I own two t-shirts (shoutout OfferZen) that say exactly that, and I still almost always forget this lesson.

<p style="text-align: center;">
  <img src="{{ '/assets/yak-shaving.jpeg' | absolute_url }}" alt="Yak Shaving" loading="lazy">
</p>

Started the service, opened ADK Web, fired off a test request, and was immediately greeted by this:

```bash
litellm.BadRequestError: BedrockException - {"message":"The provided model identifier is invalid."}
```

*Oh well.* Probably a config thing. Two minutes, tops - right? Then I'd be ready for the walkthrough.

Ten minutes later I was still in the logs, slowly losing faith in myself, computers, and the general concept of software. The region was set. I could see it right there in the environment - `AI_REGION_NAME=eu-central-1`. And in `app/config/llm_config.py`, there it was in black and white:

```python
litellm.aws_region_name = self.settings.ai_region_name  # eu-central-1
```

*Configured. Clearly. Obviously. Correctly.*

And yet - LiteLLM was somehow, inexplicably, defiantly routing every single request to `us-west-2`. Not `eu-central-1`. Not even close. `us-west-2` is on the other side of the planet and was somehow being used instead. The `eu.anthropic.*` model IDs don't exist in `us-west-2` - obviously, which is why the error said "invalid model identifier" instead of "wrong region" - a red herring disguised as an error message.

At this point the knowledge transfer session was a distant memory. I was reading LiteLLM's source code at 11 AM on a Thursday, which is not where I expected to be - that's when I knew I'd probably have a late night. No overtime pay, of course. Just the satisfaction of knowing why my config was being ignored. *The things we do for free.*

Had to take a step back and go through the dreaded traceback - that's when it hit me: let me have a look-see in the LiteLLM source code.
That's where I found it - [`converse_handler.py:Line 190`](https://github.com/BerriAI/litellm/blob/5183a6e85046962af3ba21740c232042981012b6/litellm/llms/bedrock/chat/converse_handler.py#L190): the module-level attribute we'd been setting so confidently?
Never read. Not once. Not by anything in the Bedrock Converse handler. A decorative assignment that compiled successfully, emitted no warnings, and did absolutely nothing.

*The config was right. The config was also completely ignored.*

What started as a five-minute prep turned into a full rabbit hole - LiteLLM internals, IRSA credential rotation, ADK tool declaration quirks, and a Vertex AI telemetry mismatch (another curveball). The walkthrough session had to wait. The engineer was more patient about the delay than the situation probably deserved.

This post documents some of the curveballs we encountered, the root causes, and the fixes. If you're running Google ADK agents on AWS Bedrock via LiteLLM, these gotchas will save you hours of debugging and days of intermittent failures in production. If you're just curious about the internals of this stack, it's a peek behind the curtain at how these frameworks interact - and sometimes don't - in real-world scenarios.

<!-- ### Listen & Watch

If you prefer audio or video, here are AI-generated reviews of this post courtesy of [Google NotebookLM](https://notebooklm.google.com/).

#### Video Overview

<div style="position: relative; width: 100%; max-width: 100%; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <video style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" controls preload="none">
    <source src="https://github.com/mmphego/mmphego.github.io/releases/download/media-2026-03-05/ADK_on_Bedrock__7_Gotchas.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

#### Audio Overview: Deep dive

A lively conversation between two hosts, unpacking and connecting topics in your sources

<audio style="width: 100%; max-width: 100%;" controls preload="none">
  <source src="https://github.com/mmphego/mmphego.github.io/releases/download/media-2026-03-05/Google_ADK_and_Bedrock_Production_Gotchas.m4a" type="audio/mp4">
  Your browser does not support the audio element.
</audio>

#### Audio Overview: Audio Debate

A thoughtful debate between two hosts, illuminating different perspectives on your sources

<audio style="width: 100%; max-width: 100%;" controls preload="none">
  <source src="https://github.com/mmphego/mmphego.github.io/releases/download/media-2026-03-05/Patching_Google_ADK_for_AWS_Bedrock.m4a" type="audio/mp4">
  Your browser does not support the audio element.
</audio>
--- -->

## TL;DR

- `litellm.aws_region_name = "..."` is a no-op - the Bedrock handler never reads it. Include `aws_region_name` in your model config dict so it's passed explicitly at every call site.
- Use the `bedrock/` prefix with the full regional model ID: `bedrock/eu.anthropic.claude-sonnet-4-5-20250929-v1:0`
- Set `litellm.modify_params = True` at startup - without it, multi-turn agentic conversations will fail when Bedrock receives consecutive `user` or `tool` message blocks.
- In EKS with IRSA, credentials expire mid-request and LiteLLM won't auto-refresh. Patch it.
- Google ADK's `_function_declaration_to_tool_param` will crash on tools with no parameters. Patch that too.
- Google ADK spans arrive empty in Langfuse - `openinference-instrumentation-google-adk` doesn't populate the attributes downstream exporters expect. A multi-layer extraction workaround exists.
- ADK's eval framework writes results to the read-only `agents_dir`. In K8s, that's a `PermissionError`. Patch the storage managers to redirect to a writable path - [upstream fix is planned](https://github.com/google/adk-python/issues/3887).
- In multi-agent systems, the context window fills silently - large system prompts + unchecked tool outputs + conversation history = `ContextWindowExceededError` at 1M+ tokens. Truncate tool outputs and monitor token usage per turn.

---

## The Setup - And Why Google ADK

We built a multi-agent service with 30+ domain specialists coordinating through Google ADK, with AWS Bedrock as the approved LLM platform *for various reasons above our tax bracket*. But Google ADK defaults to Gemini and Vertex AI, so enter [LiteLLM](https://www.litellm.ai/) as the bridge.

We chose Google ADK specifically for three reasons. Our Enterprise Arch head, after reviewing the options, said he liked it more too - which was either a genuine endorsement of our technical judgement or a sign that we'd finally found the one framework with a slide deck he could live with. Either way, we'll take it.

1. **Built-in evals** - measuring agent quality without bolting on a separate framework was critical
2. **Clean developer experience** - fast iteration, minimal boilerplate per agent
3. **Native A2A support** - the [Agent-to-Agent protocol](https://google.github.io/A2A/) is built in; no need to wire in `a2a-sdk` separately. For a system where agents talk to other agents, this removed an entire integration layer.

Connecting it to AWS Bedrock via LiteLLM looked straightforward:

```python
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import LlmAgent

model = LiteLlm(model="bedrock/eu.anthropic.claude-sonnet-4-5-20250929-v1:0")

agent = LlmAgent(
    name="my_agent",
    model=model,
    instruction="You are a helpful assistant.",
    tools=[...],
)
```

Seven lines of code. Three imports. One agent. Everything was looking clean - *channelling my inner [Ray William Johnson](https://www.tiktok.com/@realraywilliam)* - *UNTIL* LiteLLM silently routed every request to the wrong continent. We fixed the region. Then credentials expired mid-request. We patched the auth. Then ADK crashed on a tool with no parameters. We patched that too. Then our traces showed up in Langfuse completely empty. Then Bedrock rejected our messages for being in the wrong order. Then we tried to run evals in production and the framework couldn't write to its own directory. Then, weeks later, a user hit a context window limit nobody saw coming - 1,001,777 tokens - because tool outputs and system prompts had been quietly stacking up with no budget and no truncation.

Seven gotchas. Seven fixes. Here's every single one.

---

## Gotcha 1 - The Silent Region Misconfiguration

### The Error

```text
litellm.exceptions.BadRequestError: litellm.BadRequestError: BedrockException -
{"message":"The provided model identifier is invalid."}
```

If you're using EU-region Bedrock models (`eu.anthropic.*`), your requests are silently hitting `us-west-2`. The `eu.anthropic.*` model IDs only exist in EU regions, so US endpoints reject them outright with a misleading error - it reads like an invalid model name, not a wrong region.

There's also a compounding trap: the `bedrock/` prefix on the model ID. If you omit it and pass just `eu.anthropic.claude-sonnet-4-5-20250929-v1:0`, LiteLLM's router doesn't know you want Bedrock. It may try Anthropic's direct API or fall through to a default provider - giving you a connection error or "model not found" that looks nothing like a prefix problem. And if you copy the model ID from AWS's console, it won't include `bedrock/` - that's a LiteLLM convention, not an AWS one. The `:0` version suffix matters too: `eu.anthropic.claude-sonnet-4-5-20250929-v1` without it is also invalid. Same misleading error, different root cause.

### Why the Global Setting Does Nothing

The natural first instinct is to set the region globally:

```python
import litellm
litellm.aws_region_name = "eu-central-1"  # ← does nothing
```

Setting `litellm.aws_region_name` as a module-level attribute gives false confidence while having zero effect. After enough head-scratching to justify reading the actual source, here's what's happening in [`converse_handler.py` line 190](https://github.com/BerriAI/litellm/blob/5183a6e85046962af3ba21740c232042981012b6/litellm/llms/bedrock/chat/converse_handler.py#L190):

```python
aws_region_name=litellm_params.get("aws_region_name") or "us-west-2",
```

That's it. One line. If `aws_region_name` isn't in `litellm_params` - the dict of parameters passed at call time - LiteLLM falls straight to `"us-west-2"`. No env var check at this point. No boto3 session lookup. No warning. The module-level `litellm.aws_region_name` attribute is never consulted here.

The broader fallback chain exists elsewhere in `base_aws_llm.py`, but the Converse handler applies its own inline default and bypasses it. Every workaround that works in other LiteLLM contexts (env vars, boto3 session) won't help you here unless `aws_region_name` lands in `litellm_params` explicitly - which only happens if you pass it as a kwarg at the call site.

That's the trap. `eu.anthropic.*` model IDs only exist in EU regions. The handler silently defaults to `us-west-2`. That region rejects them with `"The provided model identifier is invalid."` - not `"wrong region"`, not `"model not available here"`. *Invalid.* A red herring that reads like a typo, not a geography problem.

### The Fix

**The right pattern: centralise model config and always include `aws_region_name` in it.**

Build a config class with a `get_model_config()` method that returns a dict - and put `aws_region_name` in that dict. Every `LiteLlm()` instance gets created from that dict via `**model_config`, so the region is never omitted at any call site:

```python
class LLMConfig:
    def get_model_config(self) -> dict:
        return {
            "temperature": ...,
            "max_tokens": ...,
            "aws_region_name": self.region,  # ← always explicit, never inherited from a global
        }

    def create_model(self, model_id: str) -> LiteLlm:
        return LiteLlm(model=model_id, **self.get_model_config())
```

For direct `acompletion()` calls (guardrails, utilities, anything outside the config class), pass it explicitly:

```python
response = await litellm.acompletion(
    model="bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0",
    messages=[...],
    aws_region_name=settings.ai_region_name,  # ← explicit, every time
)
```

**Set env vars as a defence-in-depth backstop** (steps 3 & 4 in the fallback chain):

```python
os.environ["AWS_REGION_NAME"] = "eu-central-1"
os.environ["AWS_REGION"] = "eu-central-1"
```

These are your safety net for call paths that bypass the config class. Don't rely on them as the *only* fix - env vars can be absent in certain deployment contexts.

**Delete the misleading global** if you have it:

```python
# DELETE - this does nothing:
litellm.aws_region_name = "eu-central-1"
```

**One global that actually works:** `litellm.modify_params = True`. This tells LiteLLM to automatically reorder or merge messages when Bedrock receives consecutive `user` or `tool` blocks it can't handle. Without it, multi-turn agentic conversations fail with cryptic validation errors mid-execution. It belongs in your LiteLLM setup call, not in model config.

---

## Gotcha 2 - IRSA Credential Rotation

### The Problem

In EKS with IRSA (IAM Roles for Service Accounts), AWS credentials are short-lived and rotate automatically. The credentials your pod starts with will expire mid-request. When they do, LiteLLM raises an `AuthenticationError` and doesn't try again.

```text
botocore.exceptions.ClientError: An error occurred (ExpiredTokenException)
when calling the InvokeModel operation: The security token included
in the request is expired
```

This surfaces at the worst time - long-running requests, peak traffic, overnight batch jobs.

### The Fix - Patch LiteLLM

The pattern: wrap `litellm.acompletion` (and `litellm.completion`) with a function that catches auth errors, refreshes credentials via `boto3`, and retries once. Store the originals, replace them, and also patch `google.adk.models.lite_llm` - ADK holds its own reference to these functions, so patching only the `litellm` module isn't enough.

```python
import litellm
from functools import wraps


class LiteLLMPatcher:
    def __init__(self, credential_manager):
        self.credential_manager = credential_manager
        self._patched = False

    def _is_auth_error(self, error: Exception) -> bool:
        # Distinguish retryable auth errors (expired token) from
        # non-retryable IRSA permission errors (infra misconfiguration)
        # ...

    async def _async_retry_with_refresh(self, func, *args, **kwargs):
        # Inject region explicitly on every call
        kwargs["aws_region_name"] = self.credential_manager.region
        try:
            return await func(*args, **kwargs)
        except Exception as e:
            if not self._is_auth_error(e):
                raise
            # Refresh credentials, then retry once
            # ...

    def patch_litellm(self):
        if self._patched:
            return
        original = litellm.acompletion

        @wraps(original)
        async def patched(*args, **kwargs):
            return await self._async_retry_with_refresh(original, *args, **kwargs)

        # Replace on both litellm module and ADK's own reference
        litellm.acompletion = patched
        try:
            import google.adk.models.lite_llm as adk_lite_llm
            adk_lite_llm.acompletion = patched
        except ImportError:
            pass

        self._patched = True
```

Three things to get right in the implementation:

- **Inject region in the wrapper** - `kwargs["aws_region_name"] = region` before every call. The patcher becomes your enforcement point for Gotcha 1 as well.
- **Distinguish error types** - `AssumeRoleWithWebIdentity: AccessDenied` is a permission misconfiguration; no credential refresh will fix it. Only retry on expired/invalid token errors.
- **Force a new `boto3.Session` on refresh** - don't reuse the cached session; IRSA tokens are file-based and botocore needs to re-read the token file to pick up the rotated credentials.

---

## Gotcha 3 - Function Declaration Incompatibility

### The Error

```text
AttributeError: 'NoneType' object has no attribute 'required'
```

This surfaces when Google ADK tries to convert a tool's function declaration to a format LiteLLM can pass to Bedrock. If a tool has no parameters - a valid case - `function_declaration.parameters` is `None`, and the conversion code calls `.required` on it without checking.

### The Fix

Patch `_function_declaration_to_tool_param` in `google.adk.models.lite_llm` once at startup, before any agent is instantiated:

```python
import google.adk.models.lite_llm as adk_lite_llm


def _apply_function_declaration_fix():
    original = getattr(adk_lite_llm, "_function_declaration_to_tool_param", None)
    if original is None:
        return  # Not present - newer version may have fixed it; skip safely

    def patched(function_declaration):
        if getattr(function_declaration, "parameters", None) is None:
            # Inject a minimal empty parameters structure so downstream
            # code can safely call .required and .properties without crashing
            # ...
        return original(function_declaration)

    adk_lite_llm._function_declaration_to_tool_param = patched


_apply_function_declaration_fix()
```

The `if original is None` guard makes this safe to leave in permanently - if Google ADK fixes this upstream and removes the private function, the patch skips silently.

---

## Gotcha 4 - Observability Gaps

### The Problem

Google ADK's telemetry is built for Vertex AI. By default, traces are routed to Google's own tracing backend, and the span attributes follow Vertex AI's proprietary conventions - not the standard [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) that platforms like Langfuse and Instana understand.

The result: spans arrive, timing looks correct, but `input`, `output`, model name, and token counts are either missing or sitting under Vertex AI attribute keys that your observability platform doesn't know to read. You have traces. You don't have observability.

There are two layers to this problem:

1. **Attribute naming mismatch** - ADK emits attributes like `gcp.vertex.agent.*` and event-based content, not `gen_ai.prompt`, `gen_ai.completion`, `llm.input_messages`, etc.
2. **Telemetry destination** - by default, ADK tries to send to Vertex AI's tracing endpoint; you need to redirect it to your own OTLP pipeline.

### The Fix

The approach we covered in the [dual-destination telemetry post](https://blog.mphomphego.co.za/blog/2025/12/08/How-I-Simplified-LLM-Telemetry-Using-Dual-Destination-Observability-Without-Performance-Degradation.html) applies directly here: a custom `SpanProcessor` that intercepts ADK spans and remaps Vertex AI attribute conventions to standard OTel GenAI semconv before they reach the exporter.

The mapping strategy is layered - try the most direct source first, fall back through alternatives:

```python
from opentelemetry.sdk.trace import SpanProcessor


class GoogleADKSpanProcessor(SpanProcessor):
    def on_end(self, span):
        # Layer 1: span events - ADK stores content here rather than in attributes
        input_value, output_value = self._extract_from_events(span)

        # Layer 2: Vertex AI attribute names that ADK may have populated
        if not input_value:
            input_value = span.attributes.get("gcp.vertex.agent.llm.request.content")
            # or openinference.llm.input_messages depending on ADK version
        if not output_value:
            output_value = span.attributes.get("gcp.vertex.agent.llm.response.content")

        # Layer 3: propagate from child spans to the root span
        # Langfuse shows input/output at trace level - it reads from the root span
        # ...

        # Remap to standard GenAI semconv that Langfuse and Instana understand
        if input_value:
            span.set_attribute("gen_ai.prompt", input_value)
            span.set_attribute("input.value", input_value)
        if output_value:
            span.set_attribute("gen_ai.completion", output_value)
            span.set_attribute("output.value", output_value)

    def _extract_from_events(self, span):
        # Walk span.events looking for input/output content
        # ADK emits these as events rather than span attributes
        # ...
```

Register this processor in your tracer provider setup before any agents run, and redirect the OTLP export endpoint away from Vertex AI to your own pipeline. The telemetry bridge post covers the full exporter configuration - dual export to Instana and Langfuse - including the circuit breaker pattern that keeps a failing exporter from taking down your service.

---

## Gotcha 5 - Bedrock Rejects Consecutive Message Blocks

### The Problem

This one doesn't show up in single-turn conversations. It waits until your agent is mid-flight in a multi-step execution - two tools return results back-to-back, or the agent sends a follow-up message before the user responds - and Bedrock's Converse API rejects the request with a validation error:

```text
litellm.BadRequestError: BedrockException -
{"message":"A conversation must alternate between user and assistant roles."}
```

Bedrock's Converse API enforces strict message alternation: `user`, `assistant`, `user`, `assistant`. No consecutive `user` blocks. No consecutive `tool` result blocks without an `assistant` message in between. This is a hard constraint in the API, not a suggestion.

In agentic flows, this happens constantly. An agent calls two tools in parallel, both return results (two consecutive `tool` messages, which Bedrock treats as `user`-role). Or the agent decides to speak twice before the user responds (two consecutive `assistant` blocks). Google ADK doesn't merge or reorder these because it assumes the model API is flexible enough to handle them. Bedrock isn't.

The error message is at least honest this time - it tells you what's wrong. But it surfaces deep in a multi-turn execution, often on the third or fourth tool call, which makes it look like an intermittent failure rather than a structural one.

### The Fix

One line at startup:

```python
litellm.modify_params = True
```

This tells LiteLLM to preprocess the message list before every Bedrock call - merging consecutive same-role messages and inserting placeholder messages where alternation is broken. It's a global that actually works (unlike `aws_region_name`), because it hooks into LiteLLM's message pipeline which runs before every request, not into a provider-specific handler that ignores it.

Without this flag, you have two options: manually merge messages in your agent's callback chain (fragile, breaks when ADK changes its message format), or accept that any agent with more than one tool will intermittently fail in production. Neither is acceptable.

Set it once. Forget about it. Move on to problems that deserve your attention.

---

## Gotcha 6 - Evals Can't Write in Production

### The Problem

This one won't bite you locally. It waits until you deploy to Kubernetes.

Google ADK's eval framework stores evalset results in the same directory as your agent code - `agents_dir`. In development, that's a writable folder on your machine. In production, `agents_dir` is read-only: baked into the container image, mounted as a ConfigMap, or both. The first time you try to run evals in a deployed environment:

```bash
PermissionError: [Errno 13] Permission denied: '/app/agents/my-app/my-evalset.evalset.json'
```

The `eval_storage_uri` parameter exists, but it only supports `gs://` (Google Cloud Storage). No local file path. No `file://` URI. No environment variable override. If you're not on GCS - and if you're reading this post, you're probably on AWS - you're stuck.

### Why It Matters

You built evals into your workflow because ADK's built-in eval support was one of the reasons you chose it (see: "The Setup"). Now you can't run them where they matter most - in deployed environments where agent behavior might differ from local due to credential handling, network policies, or model endpoint routing. The very place where evals would catch regressions is the place they can't run.

### The Fix (Workaround)

Monkey-patch `LocalEvalSetsManager` and `LocalEvalSetResultsManager` at startup to redirect eval storage to a writable path:

```python
import google.adk.evaluation.local_eval_sets_manager as eval_mgr
import google.adk.evaluation.local_eval_set_results_manager as results_mgr

EVAL_STORAGE_DIR = os.getenv("ADK_EVAL_STORAGE_DIR", "/tmp/adk_evals")


def _patch_eval_storage():
    original_init = eval_mgr.LocalEvalSetsManager.__init__

    def patched_init(self, agents_dir: str):
        original_init(self, agents_dir=EVAL_STORAGE_DIR)

    eval_mgr.LocalEvalSetsManager.__init__ = patched_init

    # Same pattern for LocalEvalSetResultsManager
    original_results_init = results_mgr.LocalEvalSetResultsManager.__init__

    def patched_results_init(self, agents_dir: str):
        original_results_init(self, agents_dir=EVAL_STORAGE_DIR)

    results_mgr.LocalEvalSetResultsManager.__init__ = patched_results_init
```

In your K8s deployment, mount an `emptyDir` volume at the eval storage path:

```yaml
containers:
- name: app
  env:
  - name: ADK_EVAL_STORAGE_DIR
    value: "/tmp/adk_evals"
  volumeMounts:
  - name: agent-code
    mountPath: /app/agents
    readOnly: true
  - name: eval-storage
    mountPath: /tmp/adk_evals
volumes:
- name: agent-code
  configMap:
    name: agent-definitions
- name: eval-storage
  emptyDir: {}
```

This is fragile - it patches internals and will break if ADK refactors the eval storage classes. I've opened [a feature request on Google ADK](https://github.com/google/adk-python/issues/3887) for a proper `eval_storage_dir` parameter or `file://` URI support. It's labelled `planned` by the ADK team, so hopefully this workaround has an expiry date.

---

## Gotcha 7 - The Silent Context Window Explosion

### The Problem

This one came from production, reported by a user, investigated by Ockert - one of our engineers. The agent had been working fine for weeks - *UNTIL* one day:

```text
ContextWindowExceededError: litellm.BadRequestError: BedrockException:
Context Window Error - {"message":"The model returned the following errors:
prompt is too long: 1001777 tokens > 1000000 maximum"}
```

One million, one thousand, seven hundred and seventy-seven tokens later. Just barely over the limit. The kind of number that tells you it crept up gradually, not that someone pasted a novel into a prompt.

The root cause was a combination of two things working as designed but scaling badly together:

1. **System prompts carrying agent state** - in a multi-agent system with 30+ specialists, the coordinator's system prompt includes the current state and capabilities of every agent it can delegate to. That's useful for routing decisions. It's also a lot of tokens, and it grows as you add agents.
2. **A tool call that returned too much data** - one of the tools fetched a dataset that was larger than expected. The tool result went straight into the context window alongside the system prompt, the conversation history, and the accumulated tool results from earlier steps. Nobody was truncating or summarising tool outputs.

Neither of these is a bug in isolation. The system prompt is big but justified. The tool returned what it was asked for. But together, in a multi-turn execution with several tool calls already in the history, they quietly tipped over the 1M token limit.

### Why It's Hard to Catch

You won't see this coming from unit tests or local testing with short conversations. It only surfaces in production, in long multi-turn sessions, with real data volumes. The token count grows across turns - each tool call result stays in the conversation history, and the system prompt is prepended to every request. By the time you hit the limit, the conversation has been running for several steps and the user gets a cryptic error instead of a useful response.

### The Fix

**Langfuse was the hero here** - good catch, Ockert. The observability investment from [Gotcha 4](#gotcha-4---observability-gaps) paid for itself in this single incident. By looking at the trace in [Langfuse](https://www.langfuse.com/), the engineer could see the exact token count per turn, identify which tool call returned the oversized payload, and trace the growth curve across the conversation. Without that visibility, this would have been a "works on my machine, fails in prod" mystery.

The structural fixes:

- **Truncate or summarise tool outputs** - don't pass raw tool results into the context unchecked. Set a max token budget per tool response and summarise anything that exceeds it before it enters the conversation history.
- **Monitor token usage per turn** - set up alerts on token count approaching the model's context limit. Langfuse makes this trivial if your spans carry the right attributes (see [Gotcha 4](#gotcha-4---observability-gaps)).
- **Budget your system prompt** - if your system prompt is 50K+ tokens, that's 5% of Claude's context window consumed before the conversation even starts. Track it. Know the number. Compress it if it grows.

```python
MAX_TOOL_RESPONSE_TOKENS = 50_000  # budget per tool call

def truncate_tool_output(output: str, max_tokens: int = MAX_TOOL_RESPONSE_TOKENS) -> str:
    """Truncate tool output to stay within token budget."""
    # Rough estimate: 1 token ≈ 4 characters
    max_chars = max_tokens * 4
    if len(output) <= max_chars:
        return output
    return output[:max_chars] + "\n\n[... truncated: output exceeded token budget]"
```

This is also one of the reasons we're migrating agents/specialists from local sub-agents to [A2A](https://google.github.io/A2A/) remote agents. When a specialist runs as a local sub-agent, its entire system prompt and tool outputs live inside the coordinator's context window. Move it behind A2A, and the coordinator only sees a compact request/response envelope - the specialist's context is its own problem, in its own process, with its own token budget. Thirty specialists as local sub-agents means thirty system prompts competing for the same 1M tokens. Thirty specialists behind A2A means the coordinator's context stays lean regardless of how many agents it delegates to.

---

## Putting It All Together

Bring it together in your app startup, in this order:

```python
import os
import litellm
from enum import Enum
from google.adk.models.lite_llm import LiteLlm
from google.adk.agents import LlmAgent
from opentelemetry import trace

# 1. Env var backstop
os.environ["AWS_REGION_NAME"] = "eu-central-1"
os.environ["AWS_REGION"] = "eu-central-1"

# 2. Patches (before any agent is instantiated)
_apply_function_declaration_fix()
_patch_eval_storage()

# 3. LiteLLM global setup
litellm.modify_params = True

# 4. Model config with region always explicit
class ModelTier(str, Enum):
    HEAVY  = "heavy"
    MEDIUM = "medium"
    LIGHT  = "light"

class LLMConfig:
    def get_model_config(self) -> dict:
        return {
            "temperature": ...,
            "max_tokens": ...,
            "aws_region_name": self.region,
        }

    def create_model(self, agent_name: str, tier: ModelTier) -> LiteLlm:
        ...

llm_config = LLMConfig()

# 5. IRSA credential patcher
patcher = LiteLLMPatcher(credential_manager)
patcher.patch_litellm()

# 6. Observability span processor
trace.get_tracer_provider().add_span_processor(GoogleADKSpanProcessor())

# 7. Create agents
coordinator = LlmAgent(
    name="coordinator_agent",
    model=llm_config.create_model("coordinator_agent", ModelTier.HEAVY),
    instruction="...",
)
specialist = LlmAgent(
    name="specialist_agent",
    model=llm_config.create_model("specialist_agent", ModelTier.MEDIUM),
    instruction="...",
    tools=[...],
)
```

The `ModelTier` approach scales cleanly across 30+ agents - the coordinator gets Opus, domain specialists get Sonnet, lightweight tasks get Haiku. Cost visibility becomes a structural property of the architecture rather than something you reconstruct from scattered model IDs.

---

## Hard-Earned Lessons

**1. The Config That Configured Nothing**
`litellm.aws_region_name`, `litellm.aws_access_key_id` - setting these feels like you've configured things. You haven't. Treat every call site as stateless. If a config value matters, pass it explicitly in kwargs. This applies to region, credentials, and anything else you'd expect to "just inherit" from a global.

**The lesson:** Module-level attributes that compile without error and do nothing are the most dangerous kind of misconfiguration. They give you confidence. The confidence is misplaced.

**2. The Docs Are a Suggestion; the Source Is the Spec**
The fallback chain in `base_aws_llm.py:_get_aws_region_name()` is not documented anywhere obvious. One hour reading the source saved days of intermittent failures in deployed environments.

**The lesson:** When something doesn't behave as the docs describe, read the source. The source code doesn't lie. The docs might just be aspirational.

**3. Credentials Will Expire at the Worst Possible Moment**
It won't happen locally. It won't happen in your first week of prod. It will happen at peak traffic, or in the middle of a long multi-step agent execution, six weeks after go-live. The distinction between retryable auth errors (expired token) and non-retryable ones (IRSA permission misconfiguration) matters - don't retry what can't be fixed by a refresh.

**The lesson:** Handle `AuthenticationError` with refresh-and-retry from day one. Not day sixty-one when you're in an incident call at 2 AM.

**4. Tools With No Parameters Are Valid; ADK Disagrees**
A tool with no input parameters is a valid design. ADK's LiteLLM bridge doesn't account for it. The crash is clear but happens deep in framework internals - without the fix applied, you'll spend time tracing `AttributeError: 'NoneType' object has no attribute 'required'` through ADK's source before finding the origin.

**The lesson:** Apply the patch at startup and move on. Defensive handling for framework edge cases is cheaper than debugging them every time a new engineer adds a parameterless tool.

**5. Your Traces Are Lying to You**
Google ADK's telemetry defaults to Vertex AI's tracing backend and uses Vertex AI attribute conventions. If you're not on Vertex AI, you get spans that look complete but carry attributes your platform doesn't understand. The fix isn't just redirecting the export endpoint - it's also remapping the attribute keys.

**The lesson:** Verify your spans have content in the right fields before assuming your tracing is working. Empty input/output in Langfuse is a signal, not noise.

**6. Not All Globals Are Created Equal**
`litellm.aws_region_name` does nothing. `litellm.modify_params` actually works. The difference: `modify_params` affects LiteLLM's message preprocessing pipeline, which runs before every request. The region attribute is checked by a single Bedrock-specific function that simply never looks at it.

**The lesson:** Read the source to know which globals matter and which are decorative. The docs don't distinguish them. You have to.

**7. The Three-Tier Abstraction Pays for Itself**
Google ADK for orchestration. LiteLLM for model routing. AWS Bedrock for inference. Each layer has a single responsibility. Swapping the model provider doesn't touch agent logic. The tier-based model assignment (`ModelTier.HEAVY` for coordinators, `ModelTier.MEDIUM` for specialists, `ModelTier.LIGHT` for formatting) means cost visibility is built into your architecture, not bolted on as an afterthought.

**The lesson:** The setup cost - these gotchas - is a one-time investment. The flexibility is permanent.

**8. The Feature You Chose the Framework For May Not Work in Prod**
Built-in evals were a key reason we picked ADK. In K8s, they can't write their results because the storage is hardcoded to the read-only agent directory. The irony: the feature that was supposed to catch production regressions doesn't run in production. File the upstream issue, apply the patch, and test that your evals actually execute in your deployed environment - not just locally where everything is writable.

**The lesson:** "Built-in" doesn't mean "production-ready." Verify that framework features work under your deployment constraints, not just in the local dev loop.

**9. The Model ID Has Three Failure Modes, All With the Same Error**
Wrong region, missing `bedrock/` prefix, missing `:0` version suffix - three completely different problems, one identical error message: `"The provided model identifier is invalid."` If you're lucky, you'll hit all three in sequence and learn them individually. If you're unlucky, you'll fix one, see the same error, and assume your fix didn't work.

**The lesson:** When an error message is this ambiguous, build a checklist. Ours: (1) Does the model ID start with `bedrock/`? (2) Does it end with `:0`? (3) Is `aws_region_name` in the kwargs, not just in a global? Three checks, five seconds, saves an hour.

**10. Monkey-Patching Is a Race Against Import Order**
When you patch `litellm.acompletion`, you're patching a name binding on the `litellm` module. But if ADK did `from litellm import acompletion` at import time, it holds its own reference - your patch never reaches it. You have to patch at every binding site: `litellm.acompletion` *and* `google.adk.models.lite_llm.acompletion`. Miss one and your credential refresh wrapper silently doesn't run for half your calls.

**The lesson:** In Python, patching a module attribute only affects code that accesses it through the module. Code that imported the function directly holds a stale reference. Always check where the target is bound, not just where it's defined.

**11. The Version You Can't Upgrade To and the Version You Can't Stay On**

In Google ADK versions < [1.20.0](https://github.com/google/adk-python/releases/tag/v1.20.0), the Swagger UI (`/docs`) is broken - a Pydantic v1 vs v2 incompatibility causes a 500 error on `/openapi.json`. I [submitted a PR fix](https://github.com/google/adk-python/pull/3521) and they eventually resolved it upstream in 1.22 by bumping FastAPI version. Problem solved? Not quite.

ADK >= 1.22+ introduces a [session storage migration](https://google.github.io/adk-docs/sessions/session/migrate/) that changes the database schema. If you're running stateful agents with persistent sessions, upgrading means running a migration on your production database - and if the migration fails or you need to roll back, you're in trouble.

So you're pinned: below 1.20 your developer tooling is broken, at 1.22+ your database schema changes. The sweet spot is a narrow window that won't last forever. *Damned if you do, damned if you don't - welcome to dependency management in a fast-moving ecosystem.*

<p style="text-align: center;">
  <img src="{{ '/assets/damned-if-you-do.jpeg' | absolute_url }}" alt="Damned if you do, damned if you don't" loading="lazy">
</p>

**The lesson:** Pin your framework version deliberately and document *why*. When you're building on a fast-moving framework, the upgrade path is as much a part of your architecture as the code itself. Know what breaks above you and below you.

**12. The Context Window Is a Shared Resource - and Nobody's Counting**
In a multi-agent system, the context window fills from three directions at once: system prompts (which carry agent state and grow as you add specialists), conversation history (which accumulates every turn), and tool outputs (which can be arbitrarily large). Nobody budgets for this. Nobody truncates. The `ContextWindowExceededError` shows up weeks into production, in a long multi-turn session, with a user who just happened to trigger a tool that returned a larger-than-usual payload. The observability investment from Gotcha 4 is what made this diagnosable - Langfuse showed the exact token count per turn and the growth curve across the conversation.

**The lesson:** Treat context window capacity like memory in a constrained system. Budget it. Monitor it. Truncate tool outputs that exceed their allocation. If you can't see the token count per turn in your traces, you're flying blind.

---

## Conclusion

The knowledge transfer session happened the next day. The engineer was more patient about the reschedule than the situation deserved. I showed up having read a lot more LiteLLM source code than identity state management logic, but at least the service was running - properly, in the right region, with credentials that would survive the weekend.

This stack is now our standard for new agent services - baked into our cookiecutter scaffolding template so every new service starts with these fixes already applied. The gotchas are real but each has a clean resolution. The biggest risk is not knowing they exist: the region misconfiguration in particular gives you a confident-looking config that silently routes everything to the wrong continent.

When we started, there was no post on this exact combination of Google ADK, LiteLLM, and AWS Bedrock in production. We spent time reading source code and debugging deployed environments so you don't have to.

Now there is one.

---

## References

- [Google ADK Documentation](https://google.github.io/adk-docs/)
- [LiteLLM AWS Bedrock Documentation](https://docs.litellm.ai/docs/providers/bedrock)
- [LiteLLM source - `converse_handler.py` line 190](https://github.com/BerriAI/litellm/blob/5183a6e85046962af3ba21740c232042981012b6/litellm/llms/bedrock/chat/converse_handler.py#L190) - the inline `or "us-west-2"` default
- [openinference-instrumentation-google-adk](https://github.com/Arize-ai/openinference/tree/main/python/instrumentation/openinference-instrumentation-google-adk)
- [Agent-to-Agent (A2A) Protocol](https://google.github.io/A2A/)
- [How I Simplified LLM Telemetry Using Dual-Destination Observability](https://blog.mphomphego.co.za/blog/2025/12/08/How-I-Simplified-LLM-Telemetry-Using-Dual-Destination-Observability-Without-Performance-Degradation.html) - companion post on the observability bridge
- [Feature Request: Support Custom Evalset Storage Directory](https://github.com/google/adk-python/issues/3887) - upstream issue for Gotcha 6
- [Fix: Pydantic v2 compatibility for Swagger UI](https://github.com/google/adk-python/pull/3521) - PR for the Swagger UI breakage below ADK 1.20
- [ADK Session Storage Migration Guide](https://google.github.io/adk-docs/sessions/session/migrate/) - required for ADK 1.22+
- [Identity Management and Boundaries in Agentic AI Ecosystems](https://gemini.google.com/share/48065527603e) - Gemini research on identity state management
