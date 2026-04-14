# 🛡️ Am I Being Scammed? — Free AI Scam Checker

**Built by Khobie Maseko for [Zenikhon Tech](https://ko-fi.com/zenikhontech)**

A free, AI-powered scam detection tool that helps everyday people identify fraudulent messages, emails, job offers, and texts in seconds. No account required. No cost to users. Built with efficiency in mind.

---

## What It Does

Users paste any suspicious message — an email, a job offer, a text, a DM, an investment pitch — and receive an instant AI-generated verdict explaining whether it is likely a scam, along with:

- A **confidence score** (0–100%)
- The **scam type** identified (e.g. job scam, phishing, romance scam)
- Specific **red flags** found in the message text
- **Reassuring signals** if any exist
- A plain-English **explanation** of the reasoning
- **Actionable steps** the person should take right now
- A **community vote** to rate the verdict's accuracy

Every analysis is anonymously saved to a public database so the community can learn from real-world examples.

---

## Features

### AI Scam Checker
The core tool. Accepts free-form text input up to 8,000 characters. Powered by Llama 3.3 70B via Groq's free inference API, returning structured JSON verdicts with red flags and action steps. Results include an animated confidence bar and a community voting system.

### Email / Phone Lookup
Searches the [ScamSearch.io](https://scamsearch.io) community database — a crowd-sourced registry of known scammers. Supports lookup by email address, phone number, cryptocurrency wallet address, and username. Returns a clear found/not-found verdict.

### Scam Database
A searchable, filterable, paginated public archive of all past submissions. Users can filter by verdict (scam / likely scam / suspicious / likely safe), search by keyword, and see upvote/downvote counts from the community.

### Fraud Statistics Infographic
Live-rendered charts built from official FTC 2025 data, including:
- Top fraud loss categories (bar chart)
- Scammer contact methods (donut chart)
- The 430% increase in consumer fraud losses since 2020

### Fraud Prevention Tips
10 evidence-based fraud prevention rules covering payment methods, urgency tactics, link verification, romance scams, password hygiene, and more.

### Official Scam Alert Sources
Curated cards linking to real-time alerts from:
- FTC Consumer Sentinel
- FBI Internet Crime Complaint Center (IC3)
- AARP Fraud Watch Network
- CISA (US Cybersecurity Agency)
- ScamWatch (Australia)
- Action Fraud (UK)

---

## Scam Types Detected

| Type | Description |
|---|---|
| `phishing` | Fraudulent emails or messages designed to steal credentials |
| `job_scam` | Fake job offers, work-from-home fraud, overpayment scams |
| `romance_scam` | Long-term emotional manipulation leading to financial requests |
| `investment_scam` | Fake investment platforms, crypto fraud, Ponzi schemes |
| `lottery_scam` | Fake prize wins requiring upfront payment to claim |
| `government_impersonation` | Fake IRS, Social Security, police, or HMRC contacts |
| `tech_support_scam` | Fake Microsoft/Apple alerts demanding remote access |
| `rental_scam` | Fake property listings, landlord impersonation |
| `advance_fee` | 419/Nigerian Prince — pay now to receive more later |
| `impersonation` | Fake Amazon, PayPal, bank, or brand communications |
| `social_engineering` | Psychological manipulation to extract information or money |
| `other` | Scam patterns not fitting the above categories |

---

## Verdict Levels

| Verdict | Confidence | Meaning |
|---|---|---|
| 🚨 Scam | 80–100% | Very high confidence this is fraudulent |
| ⚠️ Likely scam | 60–79% | Strong indicators but not fully definitive |
| 🟡 Suspicious | 40–59% | Something feels off — proceed with extreme caution |
| ✅ Likely safe | 0–39% | No significant red flags found |

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript — zero frameworks, zero dependencies |
| AI Engine | Llama 3.3 70B Versatile via [Groq](https://groq.com) (free tier) |
| Scammer Database | [ScamSearch.io](https://scamsearch.io) API (free, community-driven) |
| Serverless Functions | Netlify Functions (Node.js) |
| Database | [Supabase](https://supabase.com) (PostgreSQL, free tier) |
| Hosting | [Netlify](https://netlify.com) (free tier) |
| Fonts | Inter via Google Fonts |

**Total infrastructure cost: $0/month** at typical usage levels.

---

## Architecture

```
Browser (index.html)
    │
    ├── POST /.netlify/functions/analyze
    │       │── Validates input (10–8,000 chars)
    │       │── Calls Groq API (Llama 3.3 70B)
    │       │── Parses structured JSON verdict
    │       └── Saves truncated submission to Supabase
    │
    ├── GET  /.netlify/functions/scamsearch?term=&type=
    │       └── Proxies to ScamSearch.io API
    │
    ├── POST /.netlify/functions/vote
    │       └── Increments upvote/downvote on submission row
    │
    └── GET  /.netlify/functions/submissions?filter=&page=&search=
            └── Returns paginated submission records from Supabase
```

All AI calls go through a serverless function — the Groq API key is never exposed to the browser.

---

## Database Schema

The `submissions` table stores anonymized analysis results:

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `created_at` | timestamptz | Submission timestamp |
| `content` | text | First 500 chars of the submitted message |
| `verdict` | text | scam / likely_scam / suspicious / likely_safe |
| `scam_type` | text | Detected scam category (nullable) |
| `confidence` | integer | AI confidence score 0–100 |
| `red_flags` | text[] | Array of specific red flags identified |
| `safe_signals` | text[] | Array of reassuring signals identified |
| `explanation` | text | Full AI explanation text |
| `upvotes` | integer | Community accurate votes |
| `downvotes` | integer | Community inaccurate votes |

Row-level security is enabled. All operations (read, insert, vote update) are permitted without authentication, as this is a public tool.

---

## Privacy

- The tool **never stores the full message**. Only the first 500 characters are saved to the database, truncated with `...` if longer.
- No user accounts, no cookies, no tracking.
- Users are advised in the UI never to paste sensitive personal information (passwords, SSNs, bank details).
- Submissions are publicly visible in the Scam Database tab — users are warned of this before submitting.

---

## Fraud Statistics Sources

All statistics displayed on the site are sourced from official government data:

- **FTC Consumer Sentinel Network Data Book 2024** — [ftc.gov](https://www.ftc.gov/system/files/ftc_gov/pdf/csn-annual-data-book-2024.pdf)
- **FTC Congressional Testimony, March 2026** — $15.9B in 2025 fraud losses, 430% increase since 2020
- **FTC Press Release, March 2025** — $12.5B in 2024 fraud losses, 25% year-over-year increase

---

## Fraud Prevention Resources

The site links to official reporting and alert resources:

| Organisation | URL |
|---|---|
| FTC Report Fraud | https://reportfraud.ftc.gov |
| FBI IC3 | https://www.ic3.gov |
| FTC Scam Alerts | https://consumer.ftc.gov/features/scam-alerts |
| CISA Phishing Guidance | https://www.cisa.gov/topics/cyber-threats-and-advisories/phishing |
| AARP Fraud Watch | https://www.aarp.org/money/scams-fraud/ |
| ScamWatch (AU) | https://www.scamwatch.gov.au |
| Action Fraud (UK) | https://www.actionfraud.police.uk |

---

## Disclaimer

This tool is designed to assist in recognising common scam patterns. It is not a substitute for professional legal or financial advice. AI analysis can and does make mistakes. The verdict should be treated as a starting point for your own judgment — not a definitive ruling.

If you believe you are a victim of fraud:
- **US:** [reportfraud.ftc.gov](https://reportfraud.ftc.gov) or call 1-877-382-4357
- **UK:** [actionfraud.police.uk](https://www.actionfraud.police.uk) or call 0300 123 2040
- **Australia:** [scamwatch.gov.au/report-a-scam](https://www.scamwatch.gov.au/report-a-scam)

---

## Support

If this tool has helped you or someone you know avoid a scam, consider supporting its continued development:

☕ **[Support Zenikhon Tech on Ko-fi](https://ko-fi.com/zenikhontech)**

---

*©2026 Zenikhon Tech. All rights reserved. Built with efficiency in mind.*
