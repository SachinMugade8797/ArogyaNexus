# Patient portal UI

- **Canvas and tokens:** use the mint patient canvas and sidebar, white cards, teal primary actions, `--patient-canvas`, `--patient-sidebar`, `--patient-ink`, `--primary-600`, and `--shadow-sm`. Keep spacing compact (8–14 px), card corners 10–11 px, controls 7–8 px.
- **Typography:** `var(--font-sans)`; section labels are small uppercase text, page titles are 20–22 px, card titles 12–14 px, supporting text 9–11 px.
- **Cards and chips:** use `Card` for panels; `StatusChip` always includes an icon and text, with success, warning, neutral, or danger tone.
- **Page header:** small uppercase label, title, short description, and one contextual action or profile indicator; place scrollable tabs directly below.
- **Shared UI:** `Button({variant, ...props})`, `Card({title, action, state, onRetry, emptyText})`, `StatusChip({status, icon})`, `Tabs({items,value,onChange,label})`, `Modal({title,onClose,children})`, `Drawer({title,onClose,children})`, `ConfirmDialog`, `Skeleton`, `EmptyState`, `ErrorState`, `DataTable`, `Toggle`, `TagInput`, `Dropzone`, `ProgressRing`, `Popover`, and `FilePreviewModal` live in `src/components/ui/`.
- **States and access:** every API page shows loading skeletons, an empty state, and an error with retry. Label inputs, retain visible focus rings, support Escape, and announce dynamic updates.
- **Mock APIs:** page components call `src/api/*.js`; API functions wait 400 ms, read mock data from `src/mocks/`, and honor `?mock=empty` and `?mock=error`. Mutations update in-memory mock stores and reset on refresh.
