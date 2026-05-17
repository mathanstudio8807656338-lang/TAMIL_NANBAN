---
description: Sync changes from GitHub before starting any development work
---

// turbo-all
1. Check if there are any uncommitted local changes to avoid merge conflicts.
   `git status`
2. Fetch the latest changes from the remote repository.
   `git fetch origin`
3. Identify the differences between the local branch and the remote branch (assuming `main`).
   `git log main..origin/main --oneline`
4. Pull the latest changes from the remote repository.
   `git pull origin main`
5. Verify the state of the local branch is up-to-date.
   `git status`
