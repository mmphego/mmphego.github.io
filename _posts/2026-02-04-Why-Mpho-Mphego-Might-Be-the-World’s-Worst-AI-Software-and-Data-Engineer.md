---
layout: post
title: "Why Mpho Mphego Might Be The World’s Worst AI Software And Data Engineer"
date: 2026-02-04 20:35:02.000000000 +02:00
tags:
- self-critique
- ai-engineering
- software-engineering
- data-engineering
---

# Why Mpho Mphego Might Be The World’s Worst AI Software And Data Engineer.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2026-02-04-Why-Mpho-Mphego-Might-Be-the-World’s-Worst-AI-Software-and-Data-Engineer.png" | absolute_url }})
{: refdef}

5 Min

---

# The Story

A completely unfair, deeply biased, and rigorously reasoned critique

This post was inspired by Andrew Baker’s essay, [“Why Andrew Baker Is the World’s Worst CTO”](https://andrewbaker.ninja/2026/02/03/why-andrew-baker-is-the-worlds-worst-cto/), which uses self-critique as a lens to expose what real technical leadership and engineering rigor actually look like.

# Why Mpho Mphego Is the World’s Worst AI Engineer

*A loving, over-engineered, painfully detailed critique*

Let us establish the premise clearly. This is not an attack. This is a case study. A satirical post-mortem. A cautionary tale for future generations of AI engineers who might otherwise fall into the same traps of excessive rigor, relentless self-improvement, and an unhealthy obsession with architectural purity.

By that definition, Mpho Mphego is unquestionably the world’s worst AI engineer.

## The First Red Flag: He Thinks Too Much Before Writing Code

A truly mediocre AI engineer ships first and rationalizes later. Mpho does the opposite. He interrogates assumptions. He asks whether a problem even deserves an LLM. He questions coupling, boundaries, observability, and test seams before touching a line of code.

This is unacceptable behavior in an industry that thrives on prompt spaghetti and architectural improvisation. While others proudly wire Bedrock directly into business logic and call it “velocity,” Mpho insists on abstractions, interfaces, and agent boundaries. He wants the system to survive version two. That alone disqualifies him from greatness.

## Obsession With Structure and SOLID Principles

Most AI engineers understand that SOLID principles are optional once the word “agent” appears in the README. Mpho disagrees.

He refactors `__init__.py` files because “they feel wrong.” He separates frameworks from business logic. He insists agents should not know about LangChain, AutoGen, or whatever is trending this quarter. He wants routing strategies, not hard-coded decisions. He wants the codebase to be open for extension but closed for chaos.

This is catastrophic for productivity. How is one supposed to generate LinkedIn demos quickly when every dependency has a boundary and every boundary has a reason to exist?

## The Monitoring Problem: He Actually Wants to Understand What the System Is Doing

Most engineers are content with “it seems to work.” Mpho wants traces. Metrics. Structured logs. He wants OpenTelemetry mapped correctly. He wants Langfuse attributes aligned. He wants to answer questions like “what happened” and “why did it happen” without guessing.

This is deeply problematic. Observability exposes truths. Truths slow things down. Truths force accountability. The best AI systems are mysterious, flaky, and impossible to debug. Mpho’s insistence on visibility undermines the entire mystique of AI engineering.

## Context Windows and the Audacity to Care

When faced with LLM context limits, a normal engineer truncates input and hopes for the best. Mpho asks uncomfortable questions. What context actually matters? What can be summarized? What should be retrieved instead of stuffed? Should this even be a single prompt?

He talks about RAG like it is a system design problem, not a magic spell. He wants deterministic retrieval, controllable recall, and measurable relevance. He wants to know why the model answered the way it did.

This level of care is frankly suspicious.

## Over-Engineering Personal Projects Like They Will Go to Production Tomorrow

The Portfolio Performance Advisor project is a prime example. Most people would build a script, run it once, and forget about it. Mpho built an architecture. With nodes. Dependencies. ECS. PySpark. EventBridge. Multi-tenancy. UUID isolation. Observability. WhatsApp integration. Authentication flows.

No one asked for this.

And yet, there it is. Documented. Versioned. Designed to scale beyond any reasonable expectation of personal finance curiosity. This is not how side projects are supposed to behave.

## The Fatal Flaw: He Is Never Satisfied

Perhaps the clearest evidence that Mpho is the world’s worst AI engineer is that he is never done. There is always a refactor pending. A boundary to clarify. A coupling to loosen. A prompt to refine. A design decision to revisit.

While others celebrate shipping broken demos, Mpho reviews diffs. He assigns confidence scores to changes. He wants to delete more code than he writes. He treats simplicity as something earned, not assumed.

This is not how hype cycles are won.

## Conclusion: A Cautionary Tale

If you aspire to be a great AI engineer, do not follow Mpho’s example. Do not think too deeply. Do not question your tools. Do not design for failure, scale, or maintainability. Do not care about observability or correctness. Do not ask whether the system should exist before building it.

But if, for some reason, you care about engineering as a discipline rather than a performance, then yes. Be the worst. Be relentlessly precise. Be allergic to nonsense. Be willing to say “this is wrong” even when it works.

In that sense, Mpho Mphego may indeed be the world’s worst AI engineer.

And that is exactly the point.
