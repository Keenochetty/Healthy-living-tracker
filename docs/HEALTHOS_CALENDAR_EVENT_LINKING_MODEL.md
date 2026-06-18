# HealthOS Calendar Event Linking Model

Date: 2026-06-17

## Purpose

`calendar_event_links` connects calendar events to source realm records without duplicating data or granting access to the source.

## Supported Linked Realms

- medication
- supplements
- pregnancy
- baby_child
- womens_health
- records
- health
- fitness
- nutrition
- family
- caregiver
- ai_import
- scan
- general

## Access Rule

A link is metadata only. It does not grant access to the linked table or row. The linked realm keeps its own RLS and privacy rules.

## Review-First Linking

AI/Scan may propose event/reminder links as draft or needs-review candidates. Batch 5 does not auto-link sensitive source realms without user review.

## Deferred Source Writes

Batch 5 does not create medication, pregnancy, baby/child, women health, nutrition, fitness, or records source rows. It only creates the linking foundation.
