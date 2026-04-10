# sbidea.ai · Product QA Walkthrough

Run at: **2026-04-10T04:52:26.136Z**
Base URL: `http://localhost:3456`

**Summary**: 8 pass · 2 warn · 0 fail

| # | Product | Status | Duration | Checks |
|---|---------|--------|----------|--------|
| 1 | `generator` (/api/generate) | ✅ | 5178ms | 11/11 pass |
| 2 | `roast` (/api/roast) | ✅ | 1320ms | 2/2 pass |
| 3 | `hall` (/hall) | ✅ | 70ms | 2/2 pass |
| 4 | `sbti` (/sbti) | ✅ | 38ms | 1/1 pass |
| 5 | `headline` (/api/headline) | ⚠️  | 7510ms | 12/13 pass |
| 6 | `deathways` (/api/deathways) | ✅ | 9240ms | 30/30 pass |
| 7 | `slogan` (/api/slogan) | ⚠️  | 2457ms | 7/10 pass |
| 8 | `tarot` (/api/tarot) | ✅ | 3303ms | 5/5 pass |
| 9 | `daily` (/api/daily) | ✅ | 1963ms | 5/5 pass |
| 10 | `jargon` (/api/jargon) | ✅ | 2157ms | 4/4 pass |

## Per-product details

### ✅ generator — `/api/generate`

- HTTP status: `200`
- Duration: 5178ms

| Check | Severity | Detail |
|-------|----------|--------|
| name | ✅ | 4 chars |
| oneLiner | ✅ | 23 chars |
| category | ✅ | 4 chars |
| whySB | ✅ | 99 chars |
| whyWorks | ✅ | 154 chars |
| targetUser | ✅ | 29 chars |
| moat | ✅ | 41 chars |
| firstMvp | ✅ | 48 chars |
| marketSizeGuess | ✅ | 27 chars |
| sbScore | ✅ | 9 |
| unicornScore | ✅ | 7 |

### ✅ roast — `/api/roast`

- HTTP status: `200`
- Duration: 1320ms

| Check | Severity | Detail |
|-------|----------|--------|
| body | ✅ | 962 chars total |
| sections | ✅ | 5 sections |

### ✅ hall — `/hall`

- HTTP status: `200`
- Duration: 70ms

| Check | Severity | Detail |
|-------|----------|--------|
| http | ✅ | 200 OK |
| content | ✅ | title present |

### ✅ sbti — `/sbti`

- HTTP status: `200`
- Duration: 38ms

| Check | Severity | Detail |
|-------|----------|--------|
| http | ✅ | 200 OK |

### ⚠️  headline — `/api/headline`

- HTTP status: `200`
- Duration: 7510ms

| Check | Severity | Detail |
|-------|----------|--------|
| headline | ✅ | 36 chars |
| subheadline | ✅ | 21 chars |
| dateline | ✅ | 16 chars |
| leadParagraph | ✅ | 184 chars |
| body | ✅ | 5 items |
| founderQuote | ✅ | 68 chars |
| investorQuote | ⚠️  | 110 chars (ideal 15-80) |
| fakeMetrics | ✅ | 5 items |
| fundingStage | ✅ | 7 chars |
| fundingAmount | ✅ | 6 chars |
| leadInvestor | ✅ | 4 chars |
| companyName | ✅ | 4 chars |
| valuation | ✅ | 13 chars |

### ✅ deathways — `/api/deathways`

- HTTP status: `200`
- Duration: 9240ms

| Check | Severity | Detail |
|-------|----------|--------|
| ways | ✅ | 7 items |
| ways[0].title | ✅ | 5 chars |
| ways[0].timeline | ✅ | 6 chars |
| ways[0].story | ✅ | 132 chars |
| ways[0].rootCause | ✅ | 21 chars |
| ways[1].title | ✅ | 5 chars |
| ways[1].timeline | ✅ | 6 chars |
| ways[1].story | ✅ | 132 chars |
| ways[1].rootCause | ✅ | 21 chars |
| ways[2].title | ✅ | 5 chars |
| ways[2].timeline | ✅ | 6 chars |
| ways[2].story | ✅ | 122 chars |
| ways[2].rootCause | ✅ | 21 chars |
| ways[3].title | ✅ | 5 chars |
| ways[3].timeline | ✅ | 5 chars |
| ways[3].story | ✅ | 126 chars |
| ways[3].rootCause | ✅ | 19 chars |
| ways[4].title | ✅ | 5 chars |
| ways[4].timeline | ✅ | 7 chars |
| ways[4].story | ✅ | 121 chars |
| ways[4].rootCause | ✅ | 20 chars |
| ways[5].title | ✅ | 5 chars |
| ways[5].timeline | ✅ | 7 chars |
| ways[5].story | ✅ | 118 chars |
| ways[5].rootCause | ✅ | 17 chars |
| ways[6].title | ✅ | 5 chars |
| ways[6].timeline | ✅ | 7 chars |
| ways[6].story | ✅ | 130 chars |
| ways[6].rootCause | ✅ | 23 chars |
| finalEulogy | ✅ | 158 chars |

### ⚠️  slogan — `/api/slogan`

- HTTP status: `200`
- Duration: 2457ms

| Check | Severity | Detail |
|-------|----------|--------|
| slogans | ✅ | 8 items |
| styleKeys | ✅ | all 8 styles present |
| slogans[0].text | ⚠️  | 23 chars (ideal 4-22) |
| slogans[1].text | ✅ | 17 chars |
| slogans[2].text | ✅ | 20 chars |
| slogans[3].text | ✅ | 20 chars |
| slogans[4].text | ⚠️  | 27 chars (ideal 4-22) |
| slogans[5].text | ✅ | 21 chars |
| slogans[6].text | ⚠️  | 24 chars (ideal 4-22) |
| slogans[7].text | ✅ | 21 chars |

### ✅ tarot — `/api/tarot`

- HTTP status: `200`
- Duration: 3303ms

| Check | Severity | Detail |
|-------|----------|--------|
| overall | ✅ | 177 chars |
| past | ✅ | 90 chars |
| challenge | ✅ | 88 chars |
| outcome | ✅ | 89 chars |
| actionTip | ✅ | 58 chars |

### ✅ daily — `/api/daily`

- HTTP status: `200`
- Duration: 1963ms

| Check | Severity | Detail |
|-------|----------|--------|
| quote | ✅ | 33 chars |
| explanation | ✅ | 49 chars |
| signature | ✅ | 18 chars |
| colorA | ✅ | #87CEEB |
| colorB | ✅ | #FFD700 |

### ✅ jargon — `/api/jargon`

- HTTP status: `200`
- Duration: 2157ms

| Check | Severity | Detail |
|-------|----------|--------|
| translation | ✅ | 93 chars |
| jargonScore | ✅ | 92 |
| highlights | ✅ | 5 items |
| vibe | ✅ | 15 chars |
