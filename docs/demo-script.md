# AEGIS: 3-Minute Hackathon Demo Script & Video Production Guide
**"From camera events to intelligent security decisions."**

> **Target Video Duration:** Strictly Under 3 Minutes (02:55 Target Run Time)  
> **Target Audience:** Hackathon Judges (Ring Track, AWS Builder Mini-Challenge, Open Source Mini-Challenge)  
> **Interactive In-App Prompter:** Click **"⚡ 3-MIN LIVE DEMO"** in the top navigation bar of AEGIS to follow along with the built-in teleprompter HUD and automated tab transitions.

---

## 1. Quick Recording Setup & Tips

1. **Resolution & Audio:**  
   - Record at **1080p (1920x1080) at 60fps** using OBS Studio, Loom, or Windows Game Bar (`Win + G`).
   - Use a clear USB microphone with low background noise.
2. **Browser Window:**  
   - Open `http://localhost:8000/` or `https://katamvamshi2536-spec.github.io/AEGIS/` in full-screen (`F11`).
   - Start immediately on the **Command Center** dashboard.
   - **Crucial Rule:** Avoid long installation preambles. Show the live system running in the first second!
3. **Presenter Delivery:**  
   - Speak with confident, energetic authority (Staff AI Architect / Product Founder persona).
   - Move the mouse cursor smoothly to highlight key UI widgets as you speak.

---

## 2. Second-by-Second Demo Breakdown (< 3:00)

| Timestamp | Section / Theme | Active View | Spoken Narration & Visual Cues |
|---|---|---|---|
| **0:00 - 0:10** | **Ring Event: Routine Entry** | `Command Center` | **Visual:** Open directly on Command Center. Click **⚡ 3-MIN LIVE DEMO** (or advance to Scene 1). Show Ring Video Doorbell Elite stream.<br>**Narration:** *"Welcome to AEGIS: Agentic Physical Security Intelligence. While conventional security cameras merely capture video after a break-in, AEGIS transforms Ring devices into an active, intelligent security nervous system. Here at the main entrance, Dr. Elena Vance arrives—authenticated immediately via Ring Video Doorbell Elite with routine clearance."* |
| **0:10 - 0:30** | **AI Context Analysis** | `Live Events` | **Visual:** Switch to Live Events view. Ring Doorbell Ding triggered by unverified visitor. IdentityAgent & PolicyAgent status badges illuminate.<br>**Narration:** *"Ten seconds later, an unregistered visitor rings the doorbell. Instead of spamming security guards with generic motion alerts, AEGIS activates its Amazon Bedrock Identity and Policy agents. Biometrics are unverified and no scheduled calendar appointment exists. AEGIS automatically places entry on hold and initiates contextual verification with the host."* |
| **0:30 - 0:50** | **Natural-Language Access Request** | `Access Control` | **Visual:** Switch to Access Control. Show natural-language command interface. Demonstrate issuing temporary pass with 60m TTL.<br>**Narration:** *"Security personnel can interact with AEGIS using natural language. Host Dr. Vance confirms the guest, and AEGIS issues a cryptographically-bound temporary pass with a 60-minute time-to-live, strictly restricted to the Reception zone."* |
| **0:50 - 1:10** | **Temporary Access Verification** | `Security Map` (Digital Twin) | **Visual:** Switch to Security Map (Digital Twin). Green dot moves into Reception Lobby. Monitored by Ring Stick Up Cam Pro (Cam 02).<br>**Narration:** *"The visitor enters Reception. The Ring Stick Up Cam Pro verifies arrival. Notice our live facility Digital Twin map updating in real time with green authorization status. Everything is compliant."* |
| **1:10 - 1:30** | **Multi-Camera Anomaly** | `Security Map` (Digital Twin) | **Visual:** Dot moves out of Reception into Server Room Corridor. Zone turns amber/orange. Ring Spotlight Cam Pro (Cam 03) flags anomaly.<br>**Narration:** *"At 1 minute 10 seconds, anomaly occurs. The visitor leaves the designated reception zone and wanders into the restricted Server Room Corridor. Monitored by a Ring Spotlight Cam Pro, AEGIS immediately flags a spatial trajectory violation."* |
| **1:30 - 1:50** | **Risk Escalation & Actuation** | `Incidents` | **Visual:** Switch to Incidents tab. INCIDENT #AE-1042 triggered. 3 failed badge attempts at Core Server Vault door. Threat score spikes to 91/100 (CRITICAL).<br>**Narration:** *"At 1:30, the subject attempts three unauthorized badge swipes at the Core Server Vault door. Notice how AEGIS doesn't treat these as isolated camera pings. Our Correlation Engine fuses streams from Cam 01, 02, 03, and 04 into unified Incident AE-1042. Facility threat score spikes to 91 out of 100—CRITICAL."* |
| **1:50 - 2:15** | **AI Forensic Investigation** | `Investigations` | **Visual:** Switch to Investigations view. Select Incident #AE-1042. Highlight chronological multi-camera timeline, root cause card, revoked pass, and armed 110dB siren.<br>**Narration:** *"AEGIS's Investigation Agent autonomously synthesizes the full multi-camera forensic evidence chain: entry timestamp, path anomaly, and repeated badge rejections. In under two seconds, the Action Agent revokes the visitor pass and arms the Ring Floodlight Cam siren and floodlights to contain the intruder physically."* |
| **2:15 - 2:35** | **AWS Architecture** | `AI Copilot` Drawer / `Command Center` | **Visual:** Open AI Copilot drawer showing Amazon Bedrock AgentCore execution stack. Hover over AWS status pills in header.<br>**Narration:** *"Under the hood, AEGIS is powered by Amazon Bedrock running Claude 3.5 Sonnet through the AgentCore runtime and Strands SDK. AWS Lambda processes real-time Ring webhook streams, DynamoDB handles sub-second state persistence, and Amazon S3 with CloudWatch preserves an immutable, tamper-evident audit trail."* |
| **2:35 - 2:50** | **PolicyMesh (Open Source)** | `Policies` | **Visual:** Switch to Policies tab. Highlight PolicyMesh standalone engine, Zero-Trust deterministic rules, and MIT open-source license.<br>**Narration:** *"For our open-source mini-challenge, we built PolicyMesh—a standalone, MIT-licensed deterministic policy evaluation engine. PolicyMesh decouples AI reasoning from policy enforcement, guaranteeing that generative agent outputs can never violate hard physical security bounds."* |
| **2:50 - 3:00** | **Final Impact Statement** | `Command Center` | **Visual:** Return to Command Center. Show on-duty guard Marcus Thorne dispatched. Threat contained. Tagline in header.<br>**Narration:** *"AEGIS bridges the gap between passive video monitoring and autonomous enterprise security. From camera events to intelligent security decisions—this is the future of physical security. Thank you."* |

---

## 3. Verbatim Presenter Script (Read Along / Voiceover)

> *(Start recording. Cursor rests on the AEGIS SOC header. Background audio subtle and clear.)*

**[0:00 - 0:10 | 10 seconds]**  
*"Welcome to AEGIS: Agentic Physical Security Intelligence. While conventional security cameras merely capture video after a break-in, AEGIS transforms Ring devices into an active, intelligent physical security nervous system. Here at the main entrance, Dr. Elena Vance arrives—authenticated immediately via Ring Video Doorbell Elite with routine clearance."*

**[0:10 - 0:30 | 20 seconds]**  
*"Ten seconds later, an unregistered visitor rings the doorbell. Instead of spamming security guards with generic motion alerts, AEGIS activates its Amazon Bedrock Identity and Policy agents. Biometrics are unverified and no scheduled calendar appointment exists. AEGIS automatically places entry on hold and initiates contextual verification with the host."*

**[0:30 - 0:50 | 20 seconds]**  
*"Security personnel can interact with AEGIS using natural language. Host Dr. Vance confirms the guest, and AEGIS issues a cryptographically-bound temporary pass with a 60-minute time-to-live, strictly restricted to the Reception zone."*

**[0:50 - 1:10 | 20 seconds]**  
*"The visitor enters Reception. The Ring Stick Up Cam Pro verifies arrival. Notice our live facility Digital Twin map updating in real time with green authorization status. Everything is compliant."*

**[1:10 - 1:30 | 20 seconds]**  
*"At 1 minute 10 seconds, anomaly occurs. The visitor leaves the designated reception zone and wanders into the restricted Server Room Corridor. Monitored by a Ring Spotlight Cam Pro, AEGIS immediately flags a spatial trajectory violation."*

**[1:30 - 1:50 | 20 seconds]**  
*"At 1:30, the subject attempts three unauthorized badge swipes at the Core Server Vault door. Notice how AEGIS doesn't treat these as isolated camera pings. Our Correlation Engine fuses streams from Cam 01, 02, 03, and 04 into unified Incident AE-1042. Facility threat score spikes to 91 out of 100—CRITICAL."*

**[1:50 - 2:15 | 25 seconds]**  
*"AEGIS's Investigation Agent autonomously synthesizes the full multi-camera forensic evidence chain: entry timestamp, path anomaly, and repeated badge rejections. In under two seconds, the Action Agent revokes the visitor pass and arms the Ring Floodlight Cam siren and floodlights to contain the intruder physically."*

**[2:15 - 2:35 | 20 seconds]**  
*"Under the hood, AEGIS is powered by Amazon Bedrock running Claude 3.5 Sonnet through the AgentCore runtime and Strands SDK. AWS Lambda processes real-time Ring webhook streams, DynamoDB handles sub-second state persistence, and Amazon S3 with CloudWatch preserves an immutable, tamper-evident audit trail."*

**[2:35 - 2:50 | 15 seconds]**  
*"For our open-source mini-challenge, we built PolicyMesh—a standalone, MIT-licensed deterministic policy evaluation engine. PolicyMesh decouples AI reasoning from policy enforcement, guaranteeing that generative agent outputs can never violate hard physical security bounds."*

**[2:50 - 3:00 | 10 seconds]**  
*"AEGIS bridges the gap between passive video monitoring and autonomous enterprise security. From camera events to intelligent security decisions—this is the future of physical security. Thank you."*

---

## 4. Judges Scoring Rubric Alignment

| Judging Dimension | Weight | How AEGIS Wins in the Demo |
|---|---|---|
| **Tech Implementation** | **25%** | • Live Ring device normalization & Webhook ingestion pipeline.<br>• Bedrock Claude 3.5 Sonnet multi-agent orchestration (Identity, Policy, Risk, Investigation, Action).<br>• Multi-camera spatial correlation engine binding distinct physical streams into unified incidents.<br>• Real-time WebSocket bidirectional streaming. |
| **Design** | **25%** | • High-density Dark Cybersecurity SOC interface inspired by Datadog & SentinelOne.<br>• Live Interactive Digital Twin 2D Spatial SVG map with real-time zone telemetry.<br>• Instant micro-animations, glassmorphism panels, and zero placeholder assets.<br>• Built-in Director HUD / Teleprompter designed specifically for judges. |
| **Potential Impact** | **25%** | • Solves the #1 problem in physical security: **Alert Fatigue** (consolidating thousands of false alarms into actionable contextual intelligence).<br>• Sub-second autonomous containment: revoking passes and arming physical Ring sirens in <2 seconds.<br>• Applicable across corporate campuses, datacenters, healthcare facilities, and residential smart homes. |
| **Quality of Idea** | **25%** | • Shifts Ring from a passive recording doorbell into an **autonomous agentic physical security operating system**.<br>• Safe AI architecture: AI agents hypothesize & investigate, while deterministic **PolicyMesh** engine enforces hard physical bounds. |

---

## 5. Live Demo URLs

- **Local Development Server:** `http://localhost:8000/`
- **GitHub Repository:** [https://github.com/katamvamshi2536-spec/AEGIS](https://github.com/katamvamshi2536-spec/AEGIS)
- **Live Hosted Application (GitHub Pages):** [https://katamvamshi2536-spec.github.io/AEGIS/](https://katamvamshi2536-spec.github.io/AEGIS/)
