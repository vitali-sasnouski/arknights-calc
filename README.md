# Arknights Calculator

## Deploy

### Prerequisites

Install Firebase CLI (once):

```bash
npm install -g firebase-tools
```

### First-time setup

1. Log in to your Firebase account:

```bash
firebase login
```

2. Link the project to your Firebase project:

```bash
firebase use --add
```

Select your project from the list. If you don't have one yet, create it at [console.firebase.google.com](https://console.firebase.google.com) first.

### Deploy

```bash
npm run deploy
```

This will build the project and deploy it to Firebase Hosting. The CLI will print the URL when done, e.g. `https://<project-id>.web.app`.

## Sync branches with GitHub

Bash:
```bash
git fetch -p && git branch -vv | grep ': gone]' | awk '{print $1}' | xargs git branch -d
```

PowerShell:
```powershell
git fetch -p; git branch -vv | Select-String ': gone]' | ForEach-Object { ($_ -split '\s+')[1] } | ForEach-Object { git branch -d $_ }
```

Replace -d with -D to force removal of unmerged branches.
