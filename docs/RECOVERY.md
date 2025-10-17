# Git Recovery Playbook (PowerShell-safe)

This playbook helps you recover from accidental overwrites, stash mishaps, or rebases that seem to “lose” work. All commands are safe to paste into Windows PowerShell.

## Golden Rules
- Create feature branches for work; avoid committing directly to `master`.
- Push early/often to remote. Remote history is the best backup.
- Prefer `git stash apply` over `pop` until you’ve committed and pushed the result.
- Before risky operations (rebase/reset/large merge), create a timestamped safety branch and tag.

## Quick Safety Backup (before risky changes)
```
# Create and push a timestamped safety branch & tag
$ts = Get-Date -Format yyyyMMdd-HHmmss
$cur = git branch --show-current
 git branch "safety/$cur-$ts"; git push -u origin "safety/$cur-$ts"
 git tag "backup/$ts" -m "Pre-risk backup"; git push origin "backup/$ts"
```

## “I lost changes after rebase/reset”
```
# 1) Inspect recent HEAD positions
 git reflog --date=local
# 2) Create a new branch at a known-good reflog SHA
 git checkout -b rescue/2025-10-16 <sha-from-reflog>
# 3) Compare and cherry-pick or copy recovered files back to your working branch
```

## “I popped a stash and it conflicted (stash disappeared)”
```
# 1) Check reflog for stash entries
 git reflog --date=local
# Look for lines like: stash@{n}: WIP on master: ...
# 2) If found, branch from that SHA or re-create the stash ref
 git checkout -b rescue-from-stash <sha-from-reflog>
```

If reflog doesn’t help, try finding dangling commits:
```
 git fsck --no-reflog
# Look for dangling commit SHAs and branch from them
 git branch stash-rescue-<short> <dangling_sha>
```

## “I want to keep a stash forever”
```
# Turn any stash into a real branch (stash remains unless you drop it)
 git stash branch recover/my-topic "stash@{0}"
 git push -u origin recover/my-topic
```

## “I need one file from the past”
```
# Show history for a file
 git log -- path\to\file
# Restore that file at a specific commit
 git checkout <sha> -- path\to\file
```

## “I need only untracked files from a stash”
```
# Stage 3 of a stash contains untracked files
 git checkout "stash@{0}^3" -- .
```

## Safer Defaults (optional but recommended)
```
# Linearize pulls by default
 git config --global pull.rebase true
# Increase reflog retention windows
 git config --global gc.reflogExpire 90.days
 git config --global gc.reflogExpireUnreachable 30.days
```

## Workflow Tips
- Commit small WIP checkpoints; squash on the PR if you prefer a tidy history.
- Use `git worktree add` for large experiments without disturbing your main working tree.
- Enable branch protection on `master` (require PRs, disallow force-push).

---

If you need help running a specific recovery, open an issue with the exact command you ran and the time it happened. We can often reconstruct from `reflog`.
