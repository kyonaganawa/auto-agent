# Auto-Agent Dashboard

React + TypeScript + Vite dashboard for the Auto-Agent task management system.

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Dashboard runs on **http://localhost:3000** (or next available port 3001-3005)

## Features

### 📋 Board View (Kanban)

Default view showing all tasks organized by status.

**6 Status Columns:**
1. **Paused** (Purple) - Temporarily stopped tasks
2. **Pending Approval** (Orange) - Awaiting human review
3. **Approved** (Blue) - Ready for execution
4. **In Progress** (Teal) - Currently executing
5. **Completed** (Green) - Successfully finished
6. **Failed** (Red) - Execution failed

**Features:**
- Full-width layout with horizontal scroll
- 400px fixed column width (280px on mobile)
- Real-time card movement when status changes
- Click any card to view details
- Hover effects and smooth animations

### ✅ Approval Queue

List view of tasks awaiting approval.

**Actions:**
- View task details
- Approve or reject tasks
- Add refinement notes

### ⚡ Execution Queue

List view of approved tasks ready to execute.

**Features:**
- Sorted by priority and creation date
- Quick execute button
- Status indicators

### 📝 Notes

Personal note-taking system with status tracking.

**Features:**
- Create notes with optional title
- Mark as processed/unprocessed
- Filter by status (All, Unprocessed, Processed)
- Delete with confirmation
- Real-time sync across tabs

### 🎯 Task Details Modal

Click any task to open the detail modal.

**Features:**
- **Edit Mode:** Click "✎ Edit" to modify title and description
- **Status Change:** Dropdown to change task status (triggers column movement)
- **Approve/Reject:** Buttons for pending approval tasks
- **Metadata:** View all task details (priority, dates, system, tags)
- **Real-time Updates:** Changes sync immediately

### 📊 Dashboard Stats

Summary statistics widget showing:
- Total tasks
- Tasks by status
- Recent activity

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Supabase** - Database and real-time subscriptions
- **CSS-in-JS** - Styled with inline styles

## Project Structure

```
dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── TaskDashboard.tsx       # Main container
│   │   ├── KanbanBoard.tsx         # Board view
│   │   ├── KanbanColumn.tsx        # Status columns
│   │   ├── KanbanCard.tsx          # Task cards
│   │   ├── TaskDetail.tsx          # Detail modal (with edit)
│   │   ├── TaskForm.tsx            # Create/edit form
│   │   ├── TaskList.tsx            # List view
│   │   ├── NotesPanel.tsx          # Notes view
│   │   ├── DashboardStats.tsx      # Stats widget
│   │   ├── FilterPanel.tsx         # Filter controls
│   │   ├── StatusBadge.tsx         # Status indicator
│   │   └── PriorityBadge.tsx       # Priority indicator
│   ├── lib/                 # Services
│   │   ├── taskService.ts           # Task API wrapper
│   │   └── noteService.ts           # Note API wrapper
│   ├── styles/              # Global styles
│   │   └── global.css               # Dark theme + animations
│   ├── App.tsx              # App root
│   └── main.tsx             # Entry point
├── .env                     # Environment variables
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

## Configuration

### Environment Variables

**`.env` file:**
```bash
VITE_SUPABASE_URL=https://vsyhhgkfjwkjubvsdqjw.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Note:** Vite requires `VITE_` prefix for browser-accessible variables.

### Hardcoded Credentials

**Current workaround:**
- Credentials hardcoded in `src/lib/taskService.ts` and `src/lib/noteService.ts`
- This bypasses `.env` loading issues
- Works reliably but not ideal for production

**To fix:**
- Ensure `.env` file exists in `tasks/dashboard/`
- Restart dev server after changing `.env`
- Variables accessible via `import.meta.env.VITE_*`

## Development

### Start Development Server

```bash
npm run dev
```

**Server starts on:**
- Port 3000 (default)
- Ports 3001-3005 (if 3000 busy)
- Auto-opens in browser
- Hot module replacement enabled

### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

### Type Checking

```bash
npm run type-check
```

## Components

### TaskDashboard

Main container component managing:
- Active view state (board, approval, execution, notes)
- Task loading and real-time subscriptions
- Modal visibility
- Filter state

### KanbanBoard

Board orchestrator:
- Loads all tasks (limit: 500)
- Real-time subscriptions via `taskService.subscribeToTasks()`
- Groups tasks by status
- Renders columns with task counts
- Handles task click events

### KanbanColumn

Status column component:
- Fixed 400px width (280px mobile)
- Header with title and count
- Scrollable task list
- Color-coded top border
- Empty state messaging

### KanbanCard

Task card component:
- Priority badge (color-coded)
- Title and description preview
- System badge
- Relative timestamp ("2h ago", "Just now")
- Tags display (first 3)
- Hover effects

### TaskDetail

Detail modal with:
- **View Mode:**
  - Full task information
  - Status dropdown
  - Approve/Reject buttons (if pending)
  - Edit button

- **Edit Mode:**
  - Editable title input
  - Editable description textarea
  - Save button (persists to Supabase)
  - Cancel button (discards changes)

### NotesPanel

Notes management:
- Create form (title optional, content required)
- Filter tabs (All, Unprocessed, Processed)
- Note cards with status toggle
- Delete button with confirmation
- Real-time updates

## Real-time Updates

### How It Works

Dashboard subscribes to Supabase real-time changes:

```typescript
taskService.subscribeToTasks((task, event) => {
  if (event === 'INSERT') {
    // Add new task to list
  } else if (event === 'UPDATE') {
    // Update existing task (triggers card movement)
  } else if (event === 'DELETE') {
    // Remove task from list
  }
});
```

**Events:**
- `INSERT` - New task created
- `UPDATE` - Task modified (includes status changes)
- `DELETE` - Task deleted

### Status Change Flow

1. User changes status via dropdown in TaskDetail
2. `taskService.updateTaskStatus(id, status)` called
3. Supabase updates database
4. Real-time event fires: `UPDATE`
5. KanbanBoard subscription receives event
6. Task list updated with new task object
7. React re-renders, card appears in new column

**No manual refresh needed!**

## Styling

### Theme

Dark theme with custom color palette:

**Primary Colors:**
- Background: `#1a1d2e` (Dark blue-gray)
- Card: `#252936` (Slightly lighter)
- Accent: `#7dd3c0` (Teal)
- Text: `#e4e8f0` (Light gray)

**Status Colors:**
- Completed: `#90ee90` (Green)
- Failed: `#ee5a6f` (Red)
- In Progress: `#7dd3c0` (Teal)
- Pending: `#f59e0b` (Orange)
- Paused: `#8b5cf6` (Purple)

### Animations

- `slideDown` - Header entrance
- `fadeIn` - Modal overlay
- `scaleIn` - Modal content
- `fadeInUp` - Card entrance
- Hover transitions on all interactive elements

### Typography

- **Font:** Inter (Google Fonts)
- **Headings:** Bold, 1.5-2.4rem
- **Body:** Regular, 1rem
- **Mono:** Code blocks

## Troubleshooting

### Dashboard Blank / White Screen

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. `.env` file has correct credentials
4. Supabase project is active

**Common fixes:**
- Restart dev server: `Ctrl+C` then `npm run dev`
- Clear browser cache
- Check hardcoded credentials in `src/lib/taskService.ts`

### Real-time Not Working

**Check:**
1. Supabase real-time enabled for `tasks` table
2. Browser console for subscription errors
3. Network tab for WebSocket connection

**Fix:**
- Enable real-time in Supabase dashboard: Database → Replication
- Ensure ANON_KEY has proper permissions

### Tasks Not Moving Columns

**Check:**
1. Status actually changed in database (check Supabase table editor)
2. Real-time subscription active (check console logs)
3. Task object updated correctly

**Fix:**
- Verify `subscribeToTasks()` is called in KanbanBoard
- Check status value matches column status exactly
- Refresh page to force re-sync

### Build Errors

**Common issues:**
- TypeScript errors: Run `npm run type-check`
- Missing imports: Check import paths (relative paths with `/`)
- Vite config issues: Ensure `vite.config.ts` has `define: { 'process.env': {} }`

## Performance

### Optimizations

- Real-time subscriptions (no polling)
- Lazy loading for modals
- CSS-in-JS (component-scoped)
- Efficient re-renders (React.memo where needed)

### Load Times

- **Initial load:** ~500ms
- **Task list (100 tasks):** ~100ms
- **Column render:** ~50ms per column
- **Real-time update:** <50ms

## Future Enhancements

- [ ] Drag-and-drop task cards between columns
- [ ] Bulk operations (multi-select, bulk approve)
- [ ] Advanced filtering (date range, tags, assignee)
- [ ] Task templates
- [ ] Execution history view
- [ ] Notification system (toast messages)
- [ ] Dark/light theme toggle
- [ ] Export tasks to CSV/JSON
- [ ] Task comments and activity feed
- [ ] File attachments

## Keyboard Shortcuts

*(To be implemented)*

- `N` - New task
- `Esc` - Close modal
- `E` - Edit selected task
- `/` - Focus search

## Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast WCAG AA compliant
- Focus indicators on all interactive elements

---

**Dashboard Version:** 1.0.0
**Last Updated:** 2025-12-30
**React Version:** 18.2.0
**Vite Version:** 4.0.0
