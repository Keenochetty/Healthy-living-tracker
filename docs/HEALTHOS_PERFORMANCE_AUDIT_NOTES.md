# HealthOS Performance Audit Notes

## Areas Checked

- App shell and bottom nav
- Home dashboard widgets
- Calendar month/week/day views
- Scan camera overlays
- AI assistant sheet
- AI import review
- Health Hub
- Fitness library/programs/history
- Nutrition/Food flows
- Medication timelines
- Records
- Baby/Child
- Pregnancy
- Notifications/Reminders
- Trusted Content
- Settings/Profile control panel

## Findings

- Fitness library and program lists already use `FlatList` for larger library-style data.
- AI assistant messages currently render inside `BottomSheetScrollView`; acceptable for short chat, but a virtualized list should be used before long-history release.
- Trusted Content limits filtered preview to eight items, but saved content can grow and should be virtualized later.
- Records and reminders use mapped lists in ScrollViews; acceptable for foundation data, but production-scale data should use FlatList/SectionList.
- Scan overlays do not perform expensive image processing in render.
- No global reduced-motion contract was identified.
- Image previews use existing URIs; release needs thumbnail/storage policy.

## Deferred Performance Work

- Virtualize chat messages.
- Virtualize records, reminders, trusted content, and long care timelines.
- Add reduced-motion behavior to shell/sheets/animations.
- Add thumbnail generation/storage rules for records and scans.
- Test low-end Android scroll and camera startup.
