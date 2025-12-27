# Daily Work Routine

Automated workflow for maximizing professional productivity and performance.

## Morning Routine (Start of Day)

### 1. System Check (5 minutes)
**Automated Tasks:**
- [ ] System generates daily summary from logs
- [ ] Checks for overnight notifications/alerts
- [ ] Loads calendar for the day
- [ ] Reviews pending task queue

**Your Actions:**
- [ ] Review daily summary
- [ ] Check emails (quick scan, flag important)
- [ ] Review calendar and meetings
- [ ] Identify top 3 priorities for the day

**System Output:**
```
📋 Daily Briefing - [Date]

🔔 Notifications (3):
- Critical: Deploy scheduled for 2PM
- High: PR awaiting review
- Medium: Team meeting prep needed

📅 Today's Schedule:
09:00 - Stand-up
11:00 - Code review session
14:00 - Deployment
16:00 - 1:1 with manager

⚡ Top Priorities:
1. Complete authentication feature (HIGH)
2. Review team PRs (MEDIUM)
3. Prepare deployment checklist (CRITICAL)

💡 Suggestions:
- Block 90 min focus time before deployment
- Review meeting notes from yesterday
- Update task status from yesterday's work
```

### 2. Planning (10 minutes)
**Automated Tasks:**
- [ ] System pulls tasks from active queue
- [ ] Sorts by priority and due date
- [ ] Estimates time blocks needed
- [ ] Identifies conflicts with meetings

**Your Actions:**
- [ ] Confirm top priorities
- [ ] Allocate time blocks
- [ ] Move tasks around meetings
- [ ] Add any new tasks from email

**Template Time Blocks:**
- Morning Focus Block: 09:30-11:00 (90 min)
- Post-Lunch Focus Block: 13:00-14:30 (90 min)
- Afternoon Focus Block: 15:00-16:30 (90 min)
- Flex/Buffer Time: Remaining slots

### 3. Meeting Preparation (As Needed)
**For each meeting:**
- [ ] System creates meeting note from template
- [ ] Pulls agenda if available
- [ ] Links related tasks/projects
- [ ] Identifies action items from previous meeting

**Your Actions:**
- [ ] Review meeting agenda
- [ ] Prepare discussion points
- [ ] Gather materials needed
- [ ] Review previous meeting notes

---

## During Work Hours

### Focus Time Protocol
**When starting a focus block:**
1. System logs start time
2. Minimize distractions (close email, Slack DND)
3. Set timer for 25-50 min (Pomodoro)
4. Work on single task
5. Log completion/progress

**System Tracking:**
- Time per task
- Interruptions count
- Context switches
- Completion status

### Task Execution
**For each task:**
```json
{
  "task": "Implement OAuth feature",
  "started": "2025-12-27T09:30:00Z",
  "status": "in_progress",
  "progress_notes": [
    "09:30 - Started research on Auth0",
    "10:15 - Implemented basic config",
    "11:00 - Testing integration"
  ],
  "blockers": [],
  "completed": null
}
```

### Meeting Management
**During meetings:**
- [ ] Take notes using template
- [ ] Capture action items in real-time
- [ ] Mark decisions made
- [ ] Note follow-up questions

**After meetings:**
- [ ] System creates tasks from action items
- [ ] Adds to appropriate priority queue
- [ ] Sets due dates based on discussion
- [ ] Links to related projects

### Code Development Support
**AI Assistance Available:**
- Code implementation suggestions
- Bug fixing guidance
- Code review feedback
- Documentation generation
- Test case creation
- Refactoring recommendations

**Quality Checks:**
- [ ] Code follows style guide
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No security issues
- [ ] Performance acceptable

---

## End of Day Routine (15 minutes)

### 1. Task Review
**Automated:**
- [ ] System calculates completion rate
- [ ] Updates task statuses
- [ ] Logs time spent per task/project
- [ ] Identifies overdue items

**Your Actions:**
- [ ] Mark completed tasks as done
- [ ] Update in-progress task notes
- [ ] Move uncompleted tasks to tomorrow or backlog
- [ ] Estimate tomorrow's capacity

### 2. Documentation
**Daily Log Entry:**
```json
{
  "date": "2025-12-27",
  "achievements": [
    "Completed OAuth integration",
    "Reviewed 3 PRs",
    "Successfully deployed to staging"
  ],
  "blockers": [
    "Waiting on API key from external service"
  ],
  "learnings": [
    "Auth0 hooks are powerful for custom logic"
  ],
  "tomorrow": [
    "Write tests for OAuth",
    "Document authentication flow",
    "Start payment integration"
  ],
  "time_allocation": {
    "development": 5.5,
    "meetings": 2.0,
    "code_review": 1.0,
    "planning": 0.5
  }
}
```

### 3. Tomorrow Prep
**Automated:**
- [ ] System generates tomorrow's task list
- [ ] Checks calendar for conflicts
- [ ] Identifies prep work needed
- [ ] Sends reminder notifications

**Your Actions:**
- [ ] Review tomorrow's meetings
- [ ] Set top 3 priorities for tomorrow
- [ ] Flag any prep work needed
- [ ] Set first task for morning

### 4. System Sync
- [ ] Commit code changes
- [ ] Push work in progress (with WIP prefix)
- [ ] Update project board/tracking
- [ ] Archive meeting notes
- [ ] Save daily log

**End of Day Summary:**
```
✅ Today's Accomplishments

Tasks Completed: 5/7 (71%)
Focus Time: 4.5 hours
Meetings: 3 (2 hours)
PRs Reviewed: 3
Code Commits: 8

🎯 Tomorrow's Priorities:
1. [High] Write tests for OAuth
2. [High] Document authentication flow
3. [Medium] Start payment integration

🚧 Blockers to Resolve:
- Need API key from external team

💪 Energy Level: 4/5
😊 Satisfaction: 4/5

Great work today! 🎉
```

---

## Weekly Routines

### Friday Afternoon (30 minutes)
**Weekly Review:**
- [ ] Review week's accomplishments
- [ ] Calculate weekly metrics
- [ ] Identify patterns and insights
- [ ] Plan next week's focus areas
- [ ] Update career development progress
- [ ] Archive completed tasks

**Weekly Report:**
```
📊 Week of [Date]

Tasks Completed: 23/28 (82%)
Focus Hours: 18.5
Meetings: 12 (8 hours)
Code Quality: 95% test coverage
Deployment: 2 successful

Key Achievements:
- ✅ Completed authentication feature
- ✅ Optimized database queries (30% faster)
- ✅ Mentored junior dev on testing

Challenges:
- External API delays caused blocker
- Meeting overload on Wednesday

Next Week Focus:
- Payment integration
- Performance optimization
- Technical documentation
```

### Monday Morning (15 minutes)
**Weekly Planning:**
- [ ] Review weekly goals
- [ ] Allocate time for big projects
- [ ] Identify meeting prep needs
- [ ] Set learning goals for week

---

## Monthly Routines

### Last Friday of Month (60 minutes)
**Monthly Review:**
- [ ] Career development progress
- [ ] Skill acquisition check
- [ ] Portfolio updates needed
- [ ] Performance metrics review
- [ ] Goal assessment
- [ ] Next month planning

**Updates to Make:**
- [ ] Update resume with achievements
- [ ] Add projects to portfolio
- [ ] Post LinkedIn update
- [ ] Log learning progress
- [ ] Update career development plan

---

## Automation Triggers

### Morning (8:00 AM)
- Generate daily briefing
- Load calendar and tasks
- Send priority notification

### Before Each Meeting (15 min)
- Create meeting note from template
- Send preparation reminder
- Load relevant context

### After Each Meeting (5 min)
- Prompt for action items
- Create tasks automatically
- Archive notes

### End of Day (6:00 PM)
- Request completion updates
- Generate daily summary
- Prepare tomorrow's plan
- Send summary notification

### Friday (5:00 PM)
- Generate weekly report
- Calculate metrics
- Send achievements summary

### Last Day of Month
- Generate monthly report
- Career progress reminder
- Portfolio update prompt

---

## Productivity Metrics

**Daily Tracking:**
- Tasks completed vs. planned
- Focus time achieved
- Meeting time
- Context switches
- Energy/satisfaction levels

**Weekly Analysis:**
- Completion rate trends
- Time allocation patterns
- Meeting efficiency
- Code quality metrics
- Learning progress

**Monthly Insights:**
- Goal achievement rate
- Skill development
- Career milestones
- Performance trends
- Optimization opportunities

---

## Emergency Protocols

### Urgent Issue Handling
1. Pause routine tracking
2. Focus on emergency
3. Log emergency details
4. Resume tracking when resolved
5. Adjust plan for remainder of day

### Meeting Overload
1. Identify optional meetings
2. Request async alternatives
3. Batch similar meetings
4. Protect focus blocks
5. Escalate if chronic

### Task Overwhelm
1. Re-prioritize ruthlessly
2. Push low-priority items
3. Communicate new timelines
4. Ask for help if needed
5. Focus on critical path

---

**This routine is automatically managed by the auto-agent system. Customize as needed for your workflow.**
