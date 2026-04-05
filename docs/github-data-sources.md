# GitHub Data Sources Plan

## Goal

Use public GitHub data as the initial foundation for Wanglitou's content banks, while keeping the admin content center as the final curation layer.

This matches the current product phase:

- Public datasets help us get out of the "empty question bank" stage quickly.
- Admin curation keeps quality under control for grade-level learning.
- Wrong-answer feedback and usage data can later guide what to enrich first.

## Recommended source strategy

### 1. English general vocabulary foundation

Primary candidates:

- `dwyl/english-words`
  - URL: `https://github.com/dwyl/english-words`
  - Use: large general English word list foundation
  - Best for: starter pool, spelling coverage, fallback expansion
  - Note: should be filtered heavily before entering children's dictation banks

- `sapbmw/The-Oxford-3000`
  - URL: `https://github.com/sapbmw/The-Oxford-3000`
  - Use: high-frequency practical vocabulary
  - Best for: beginner and lower-intermediate levels
  - Note: good for building cleaner K12 and family-friendly vocabulary layers

Recommended product use:

- Use `Oxford 3000`-style high-frequency words as the first clean learning pool.
- Use `dwyl/english-words` only as a fallback expansion source.
- Never import raw large English word lists straight into the child-facing product without filtering by age, frequency, and topic.

### 2. Exam-oriented English supplements

GitHub has many community repositories for:

- CEFR word lists
- IELTS word lists
- TOEFL word lists
- CET-4 / CET-6 collections

Recommended product use:

- Do not trust a single community repo as the final source of truth.
- For exam levels, use GitHub lists as draft source material, then normalize inside Wanglitou:
  - remove rare or low-quality entries
  - remove duplicates across exams
  - map every word to one internal difficulty level
  - add bilingual hints usable by families

### 3. Chinese vocabulary and character foundation

Primary candidates:

- `zk25796/pwxcoo-chinese-xinhua`
  - URL: `https://github.com/zk25796/pwxcoo-chinese-xinhua`
  - Use: Chinese character / word reference base
  - Best for: pinyin, explanations, basic dictionary-style enrichment
  - Note: good for data enrichment, but not enough by itself for direct grade-level teaching sequences

- `lxs602/Chinese-Mandarin-Dictionaries`
  - URL: `https://github.com/lxs602/Chinese-Mandarin-Dictionaries`
  - Use: broader Chinese dictionary resources
  - Best for: supplementary explanations, pinyin, and multi-source enrichment
  - Note: contains mixed sources with different licenses; must verify field-level usage before import

Recommended product use:

- Use Chinese dictionary repos to enrich:
  - pinyin
  - explanations
  - alternate forms
- Do not use dictionary order as the actual training order for children.
- The training sequence still needs Wanglitou's own grade-level curation.

## Product recommendation

For Wanglitou, the best content architecture is:

1. `Public source layer`
   - GitHub datasets provide raw vocabulary coverage.
2. `Internal normalized layer`
   - We clean, deduplicate, and map all words into Wanglitou levels.
3. `Teaching layer`
   - Final items shown to parents and children include:
     - level
     - word or phrase
     - zh/en hint
     - pinyin or explanation
     - training tags
4. `Operations layer`
   - Admins can add, remove, and improve content directly in the content center.

## What should be imported first

Recommended import order:

1. English starter to grade 6 high-frequency words
2. Chinese grade 1 to grade 6 daily dictation vocabulary
3. Math needs no external dataset for question generation
4. KET / PET / CET-4 / CET-6 as the first exam-oriented expansion
5. TOEFL / IELTS as advanced expansion

## Licensing and safety notes

Before production import, verify:

- repository license
- whether the data itself has the same license as the repo wrapper
- whether the source is appropriate for commercial usage
- whether school-facing content needs additional manual review

Recommended rule:

- GitHub is the source of initial raw material
- Wanglitou remains the final curated teaching product

## Why this is the best current approach

- Fast enough for MVP
- Safe enough for phased rollout
- Flexible enough for SEO growth and long-term content expansion
- Consistent with the current admin content center already built in this project
