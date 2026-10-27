# Tally — complete visual walkthrough

[Back to README](../README.md) · [Feature film](VIDEO.md)

All images are fresh browser captures of the real app with sample data. Mobile files are 780 × 1688, rendered at 2× a 390 × 844 layout; desktop files are 1920 × 1500. Click any preview for the original. No screenshot was enlarged from a low-resolution capture. This is a responsive web app, not a native iOS app.

## The four mobile pages

### Overview

See your total balance, amounts owed and amounts to receive.

<a href="images/mobile-overview-hd.jpg"><img src="images/mobile-overview-hd.jpg" width="340" alt="Tally overview screenshot" /></a>

### Groups

Browse groups, participant counts and group totals.

<a href="images/mobile-groups-hd.jpg"><img src="images/mobile-groups-hd.jpg" width="340" alt="Tally groups screenshot" /></a>

### Expenses

Search expense descriptions, filter by group or month, and export CSV.

<a href="images/mobile-expenses-hd.jpg"><img src="images/mobile-expenses-hd.jpg" width="340" alt="Tally expenses screenshot" /></a>

### Insights

See your share by category, compare category proportions and explore daily spending.

<a href="images/mobile-insights-hd.jpg"><img src="images/mobile-insights-hd.jpg" width="340" alt="Tally insights screenshot" /></a>

## Create and manage expenses

### Add an expense

Enter title, amount, category, group, date, payer, participants and an optional note. Equal splitting allocates every cent.

<a href="images/mobile-add-expense-hd.jpg"><img src="images/mobile-add-expense-hd.jpg" width="340" alt="Tally add an expense screenshot" /></a>

### Percentage splits

Assign percentages to participants. Amounts must reconcile before saving.

<a href="images/mobile-percentage-split-hd.jpg"><img src="images/mobile-percentage-split-hd.jpg" width="340" alt="Tally percentage splits screenshot" /></a>

### Edit and exact splits

Edit an existing expense and enter exact shares. This preview shows an existing sample expense in the editor.

<a href="images/mobile-edit-expense-hd.jpg"><img src="images/mobile-edit-expense-hd.jpg" width="340" alt="Tally edit and exact splits screenshot" /></a>

### Expense details

Review the payer and per-person shares; open Edit or Delete expense from this view.

<a href="images/mobile-expense-detail-hd.jpg"><img src="images/mobile-expense-detail-hd.jpg" width="340" alt="Tally expense details screenshot" /></a>

## People and groups

### Create a group

Choose an icon, group name and participants.

<a href="images/mobile-create-group-hd.jpg"><img src="images/mobile-create-group-hd.jpg" width="340" alt="Tally create a group screenshot" /></a>

### Add a person

Add someone to the ledger. This creates a record; it does not send an invitation or grant account access.

<a href="images/mobile-add-person-hd.jpg"><img src="images/mobile-add-person-hd.jpg" width="340" alt="Tally add a person screenshot" /></a>

## Balances and settlements

### Simplified balances

See who owes whom across groups and inspect recorded payments.

<a href="images/mobile-settlements-hd.jpg"><img src="images/mobile-settlements-hd.jpg" width="340" alt="Tally simplified balances screenshot" /></a>

### Record a payment

Record a full or partial payment after it happens. Undo is available for recorded payments. Tally does not transfer money.

<a href="images/mobile-record-payment-hd.jpg"><img src="images/mobile-record-payment-hd.jpg" width="340" alt="Tally record a payment screenshot" /></a>

## Assistant and review

### Meet your sidekick

Type or dictate a request. The screenshot shows Local helper, an explicitly limited parser. Cloud AI adds receipt reading and more flexible requests after setup.

<a href="images/mobile-assistant-hd.jpg"><img src="images/mobile-assistant-hd.jpg" width="340" alt="Tally meet your sidekick screenshot" /></a>

### Review before saving

Inspect amount, payer and shares; edit or remove drafts and confirm review before saving. No transaction was saved during this capture.

<a href="images/mobile-draft-review-hd.jpg"><img src="images/mobile-draft-review-hd.jpg" width="340" alt="Tally review before saving screenshot" /></a>

## Appearance, personality and speech

### Appearance

Choose light, dark or system appearance and lime, peach or lavender accents.

<a href="images/mobile-appearance-hd.jpg"><img src="images/mobile-appearance-hd.jpg" width="340" alt="Tally appearance screenshot" /></a>

### Personality

Choose a name, calm/warm/sassy tone and optional personal instructions.

<a href="images/mobile-personality-hd.jpg"><img src="images/mobile-personality-hd.jpg" width="340" alt="Tally personality screenshot" /></a>

### Speech controls

Choose speech language, installed voice, pace, pitch, local-only mode and optional read-aloud replies. Browser capabilities vary.

<a href="images/mobile-voice-hd.jpg"><img src="images/mobile-voice-hd.jpg" width="340" alt="Tally speech controls screenshot" /></a>

## All desktop pages

### Overview

A wider layout with sidebar navigation, balances, groups and spending summary.

<a href="images/web-overview-hd.jpg"><img src="images/web-overview-hd.jpg" width="1000" alt="Tally overview screenshot" /></a>

### Groups and people

Manage your circles and participants from the desktop workspace.

<a href="images/web-groups-hd.jpg"><img src="images/web-groups-hd.jpg" width="1000" alt="Tally groups and people screenshot" /></a>

### Expense management

Search, group/month filters, individual expenses and CSV export.

<a href="images/web-expenses-hd.jpg"><img src="images/web-expenses-hd.jpg" width="1000" alt="Tally expense management screenshot" /></a>

### Insights

Category breakdowns, largest spending category and daily spending rhythm.

<a href="images/web-insights-hd.jpg"><img src="images/web-insights-hd.jpg" width="1000" alt="Tally insights screenshot" /></a>

## Functions that require configuration

| Function | How it works | Preview status |
| --- | --- | --- |
| Email sign-in | Supabase magic link with configured redirect URLs | Requires your Supabase project; not staged with fake credentials |
| Private cloud sync | RLS-protected account ledger and revision checks | Requires schema and sign-in; no collaborative group access |
| Receipt interpretation | Up to three JPEG/PNG/WebP images; model produces drafts for review | Requires server AI key, Supabase session and quota migration |
| Weighted and item-based AI splits | Structured drafts validated by code; tax/tip allocated proportionally | Cloud setup required |
| Conversational spending queries | Model selects filters; server calculates totals and source evidence | Cloud setup required; local helper offers all-time summary |
| Microphone recognition | Browser Web Speech, explicit microphone action, typed fallback | Depends on browser and permission; not a recorded live-microphone demo |
| Read-aloud | Installed/browser voices with explicit playback and optional auto-read | Voice quality and availability depend on device |

## Behavior and limits

- Currency is selected before transactions and locks once amounts exist; no exchange-rate conversion.
- Local demo data stays in the browser and is separate from a signed-in ledger.
- Account settings can start an empty local workspace; that resets the current local demo.
- Payment undo reverses a bookkeeping record, not a bank transfer.
- The help dialog explains the local/private-ledger model. Theme and personality preferences are device-local.
- Recurring bills, collaborative invitations, payment processing and offline cloud editing are not implemented.
