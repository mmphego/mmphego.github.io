---
layout: post
title: "How I Built 20+ Custom AI Coding Skills to Automate My Entire Engineering Workflow"
date: 2026-02-28 09:00:00.000000000 +02:00
tags:
- Claude Code
- AI
- Developer Productivity
- Automation
- Engineering Workflow
- Observability
---

{:refdef: style="text-align: center;"}
[![post image]({{ "/assets/2026-02-28-How-I-Built-20+-Custom-AI-Coding-Skills-to-Automate-My-Entire-Engineering-Workflow.png" | absolute_url }})](/)
{: refdef}

---

It has been a productive few months — *too* productive, if you ask my Git history. But this post has been brewing for a while, and it's time to share what happened when I stopped accepting the grunt work as "just part of the job."

## The Story

It's 5 PM. The standup this morning feels like it happened in a different timeline.

At 9 AM, I told the team I'd finish the new agent integration and start on the observability dashboard. Clear goals. Reasonable scope. The kind of day you look forward to.

It's now 5 PM and I haven't touched either of those things.

Instead, I spent the morning reviewing a PR - not the code itself, but the *ceremony* around it.
* Push the branch,
* create the PR,
* write the description,
* request a review,

Wait for the reviewer to leave comments.
* Review comments. Some valid, some outdated references to code that was already refactored.
* Fix the valid ones. Re-push -> Watch CI -> A test fails — Phew!!! not my code, a flaky integration test -> Re-run -> Wait -> Green -> Merge -> Delete the branch -> Pull main.
* Rinse. Repeat. *Questioning myself why didn't I become a mining engineer? Atleast those guys get CTC bonuses and nobody asks them to rebase.*

After lunch, CI broke on a different service. I spent 40 minutes copying logs from GitHub Actions, scrolling through walls of output to find the actual error. It was a dependency conflict. Fixed it in 3 minutes. Finding it took 40.

Then a deployment verification. `kubectl get pods`. One pod in `CrashLoopBackOff`. Missing environment variable. Check Vault. Rotate the secret. Redeploy. Verify again.

By 5 PM I'd done *work* — real, necessary work. But none of it was the work I set out to do. None of it required my engineering judgment. It was ceremony. Skilled ceremony, but ceremony.

Here's what made it sting: I'd spent the previous months building an AI agent service for the business — a multi-agent system that does complex domain reasoning autonomously. Thirty-plus specialized agents coordinating through a sequential pipeline. It handles ambiguous requests, routes to the right domain expert, reasons about failures, and produces answers.

And *I* was still manually copying CI and ArgoCD logs.

The irony was loud enough that I couldn't ignore it anymore.

---

## TL;DR

I built a library of 20+ custom [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skills to automate the engineering workflows that were eating my days — PR lifecycle, production audits, trace analysis, CI debugging, deployment verification, and more.

This post walks through three of them:
* One that solved an everyday nightmare,
* One that pushed the ceiling of what's possible,
* One that taught me when *not* to use AI. Plus the patterns that emerged after building all of them.

If you're spending more time on engineering ceremony than engineering — this is for you.

---

## The First Skill

The first one was small. I was tired of the PR dance — the same sequence of commands, every single time. Push. Create PR. Write description. Request review. Wait. Fix comments. Re-push. Watch CI. CI fails. Fix. Push. Watch CI. Green. Merge. Cleanup branch. Pull main. Question every life decision that led you to software instead of mining engineering with actual bonuses.

It wasn't hard. It was just... *every time*. And each step had just enough variation that a bash script wouldn't cut it. The PR description needs to understand what changed. The review comments need judgment — which are valid, which reference stale code. CI failures need diagnosis, not just re-runs.

So I wrote a skill that understood the workflow as a *workflow* — not a script that executes commands, but an instruction set that knows the PR lifecycle and can make decisions at each step. Push the branch. Create the PR with a description that actually reflects the diff. Request review. When comments come in, categorize them — valid changes, outdated references, style preferences — and handle each appropriately. Watch CI. If it fails, diagnose before retrying. When everything's green, ask me if I want to merge. Clean up after.

One command. The whole dance.

The first time I ran it and watched it categorize review comments — correctly distinguishing between a valid bug catch and an outdated reference to code I'd already moved — something clicked. This wasn't automation in the "run a script" sense. This was delegation.

That was skill number one. Twenty-one more followed.

---

## Spotlight: The Production Audit That Writes Its Own Post-Mortems

The PR skill solved an everyday problem. The next one I want to talk about aimed higher.

We were preparing a service for production. The checklist was the usual: security review, architecture review, DevOps readiness, resilience analysis. Each one done by a different person, at different times, with different levels of thoroughness. Sometimes things fell through the cracks. Sometimes the security review missed something the architecture review would have caught, because neither had the full picture.

I thought: what if I could run all of these simultaneously, with specialists that share context?

The skill I built spawns a team of five agents — each one focused on a different domain. A security scanner looks for vulnerabilities, auth gaps, and injection vectors. An architecture reviewer evaluates coupling, cohesion, and separation of concerns. A DevOps auditor checks deployment configs, health checks, and CI pipelines. A resilience analyst stress-tests error handling and failure modes. And an issue predictor looks for patterns that *usually* lead to production incidents — the kind of thing you only learn after the 3 AM page.

They all run in parallel. When they're done, a verification agent cross-checks their findings — deduplicates, eliminates false positives, and confirms severity ratings. No finding makes it into the final report without verification.

But the part I'm most proud of is what I call the "breakme" analysis — credit to my colleague Riaan L., who dropped a prompt idea in our Teams channel that sparked the whole concept. After all the domain-specific findings are compiled, the skill generates ten failure scenarios — causal chains that trace from a trigger event through the codebase to a production impact. Essentially: *here's how this service will break, and here's what you should do about it.*

Incident post-mortems. Written *before* the incidents happen.

The first time I ran it on a service we were about to ship, it caught a race condition in our session state handling that none of us had noticed. The breakme scenario described exactly how it would manifest: under concurrent requests from the same user, two agents would write to the same state key, and the last write would win silently. It even described the symptom the user would see — intermittent wrong answers with no error logs.

I fixed it before it ever hit production. That's not automation. That's a thinking partner.

---

## Spotlight: The Trace Analyzer That Doesn't Use AI for Math

This one connects to my [previous post on dual-destination observability](https://blog.mphomphego.co.za/blog/2025/12/08/How-I-Simplified-LLM-Telemetry-Using-Dual-Destination-Observability-Without-Performance-Degradation.html). We had Langfuse wired up, traces flowing, and beautiful timeline views. But analyzing a trace still meant clicking through the UI, mentally adding up token counts, calculating costs, and trying to spot patterns across dozens of spans.

So I built a skill that fetches a trace, analyzes it, and produces a comprehensive report with Mermaid diagrams, bottlenecks & blindspots, health scores, and cost breakdowns.

Here's the thing that matters: **none of the calculations use the LLM.**

Token counts, cost calculations, duration percentiles, redundant call detection — all of that is pure Python. The skill bundles analysis scripts that do structured computation. The LLM's job is interpretation: reading the calculated metrics and explaining what they mean, spotting patterns in the agent's reasoning, identifying bottlenecks that the numbers alone don't explain.

This was a deliberate choice after watching early versions hallucinate token counts. An LLM that confidently tells you a trace consumed 12,847 tokens when it actually consumed 42,000 is worse than no analysis at all. The numbers need to be *right*. So the numbers come from code, and the narrative comes from the model.

The skill generates five types of Mermaid diagrams automatically:

* A Gantt timeline showing agent execution overlap
* Token distribution pie charts
* Cost breakdowns
* Agent flow graphs, and
* Dependency chains.

It calculates a health score from 0-10 with penalty rules for excessive duration, error rates, cost outliers, and redundant tool calls. And it flags duplicate tool calls — same tool, same parameters, called multiple times in the same trace — which turned out to be one of our biggest sources of wasted tokens.

I was reviewing Langfuse one afternoon, sorted by cost — just a routine check. A single trace jumped out: $15. One request. I pulled the trace ID and ran the skill. The report came back in seconds: health score 2.1 out of 10, 14 redundant tool calls with identical parameters, agent entered a retry spiral after a database timeout midway through. A tool had failed, the agent reasoned about the error, retried, failed again, tried a different approach — dozens of times, burning tokens the whole way. What would have taken me 30 minutes of clicking through Langfuse spans was diagnosed in a single command.

That's the difference between *having* observability and *using* it.

---

## Hard-Earned Lessons

After building 20+ skills, patterns emerged. Not all of them were obvious.

### 1. Skills That Call Other Skills Change Everything

The PR lifecycle skill doesn't handle review comments itself. It delegates to a separate skill that specializes in categorizing and fixing PR comments. That skill doesn't know it's being orchestrated — it just does its job.

This compositional pattern was the single biggest unlock. Once skills could call other skills, complex workflows became combinations of focused, testable building blocks. The PR lifecycle skill is essentially: push → create → delegate(review-fix) → watch CI → merge → cleanup. Each step is a skill that also works standalone.

**The lesson:** Build skills like functions — single responsibility, composable, independently useful.

### 2. Know When NOT to Use the LLM

The trace analyzer taught me this the hard way. Early versions asked the LLM to calculate token costs. It hallucinated numbers with total confidence. Same with duration calculations, percentile math, and aggregations.

Now my rule is simple: **structured data gets code, unstructured reasoning gets the LLM.**

* Token counts? -> Python.
* Cost calculations? -> Python.
* "Why did the agent enter a retry spiral?" -> LLM.
* "What does this pattern of failures suggest about the architecture?" -> LLM.

The best skills are hybrids — computation where precision matters, reasoning where judgment matters.

### 3. Verification Gates Are Non-Negotiable

Every skill that modifies code runs linting and tests after. Every skill that does something destructive — merge, force push, deploy — asks for confirmation first. Every skill that generates findings runs a verification pass to eliminate false positives. And no skill has delete rights. Period. I've configured my environment to deny anything related to `rm` — if something needs removing, it gets moved to `/tmp/` where I can recover it. An AI assistant that can delete files is not an assistant, it's a liability. With great power comes great responsibility, and all that.

I learned this after a skill confidently "fixed" a review comment by introducing a type error. The fix was logically correct but syntactically wrong. A 2-second `ruff check` would have caught it. Now it's baked into every skill.

### 4. Terminal Summaries Keep You Sane

Every skill prints a structured summary at the end. Not a wall of text — a scannable result. What was done, what changed, what needs attention. This sounds trivial until you're running three skills in parallel and need to quickly understand what happened.

### 5. Let Your AI Suggest the Skills You Need

Here's a tip that saved me weeks of guessing: ask your AI coding assistant to analyze your own workflow patterns — your project configuration (`~/.claude/project` and `~/.claude/CLAUDE.md`), your rules files (`~/.claude/rules`), your commit history — and suggest skills based on *your* daily grind. It knows what you do repeatedly. It knows your stack. It knows your patterns. Let it tell you where the automation opportunities are.

The skills I ended up building weren't the ones I *thought* I needed. They were the ones that emerged from an honest look at where my time actually went.

### 6. What Works for Jack Won't Work for Jim

This is why I'm not sharing full skill implementations in this post. My PR workflow has specific conventions — Copilot reviews, particular branch naming, specific CI patterns. Your workflow is different. Your stack is different. Your headaches are different.

The value isn't in copying my skills. It's in understanding the *thinking* behind them — the patterns, the composition model, the verification gates, the hybrid computation approach — and building skills that solve *your* specific problems. The best skill is the one that automates the thing *you* do every day, not the thing I do.

---

## Conclusion

I started building skills because of a 5 PM realization that I was spending more time on engineering ceremony than engineering. The irony of building autonomous AI agents for the business while manually copying CI logs was too loud to ignore.

Twenty-two skills later, the standup-to-5PM gap has shrunk dramatically. Not because the busywork disappeared - there's always busywork *trust me (Internally screams)* — but because the repetitive tasks that *don't require my judgment* now don't require my time either. PR lifecycle, production audits, trace analysis, CI debugging, deployment verification, secret rotation, scaffolding — all of it runs while I do the work I actually set out to do that morning.

The real metric isn't "how many skills did I build." It's this: at 5 PM, did I spend today on what I said I would at standup?

Most days now, the answer is yes. That's the win.

---

## References

* [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
* [Claude Code Skills](https://code.claude.com/docs/en/skills)
* [How I Simplified LLM Telemetry Using Dual-Destination Observability](https://blog.mphomphego.co.za/blog/2025/12/08/How-I-Simplified-LLM-Telemetry-Using-Dual-Destination-Observability-Without-Performance-Degradation.html) (companion post)
* [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
* [Langfuse Documentation](https://langfuse.com/docs)
