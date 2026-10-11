---
name: work-ticket
description: Work a Trello or Microsoft Planner ticket end to end - move the ticket to In Progress, implement it on a new branch, verify, open a pull request, then move the ticket to QA. Use when the user gives a Trello card link or a Planner task link and asks to work on it, or asks to work on something without a link (the skill then finds the matching ticket on the project board or creates one).
argument-hint: <ticket-url | description of the work>
---

# Work a ticket

Request: $ARGUMENTS

The user wants this work taken from ToDo to a reviewable pull request without further prompting. They review the PR and do QA themselves, so the PR description and your final message are what they rely on. Stop and ask only if the request is ambiguous in a way that changes what you would build.

The request is either a ticket link or a description of the work. With a link, start at step 1. With a description and no link, do "No link" first.

## Project board

Used when the request has no ticket link. Change this when installing the skill in another project.

- Tracker: Trello
- Board: Anime App - NextJs, https://trello.com/b/AdW9TOA3

## No link: find the ticket or create it

Every piece of work goes through a ticket, so the board stays an accurate record. Use the project board above and the tracker access described in step 1.

1. **Look for an existing ticket.** List the cards in every column of the board, including QA and Done, and compare them with the request by meaning, not only by title wording.
   - One open card (ToDo or In Progress) covers the request: use it and continue at step 2.
   - A card in QA or Done already covers it: do not create a duplicate. Tell the user which card it is and ask whether they want a follow-up.
   - Several cards could be the one, or a card covers only part of the request: ask the user which to use.
2. **Otherwise create the ticket** in the ToDo column. Work out the title and description yourself, from the changes; do not ask the user to write them.
   - **Changes already exist** (uncommitted changes in the working tree, or commits on the current branch that are not on the default branch): read the diff (`git status`, `git diff`, `git log <default>..HEAD`) and write the ticket from what it actually does. The request and the earlier conversation explain the intent; the diff is the record of the scope.
   - **No changes yet:** read the relevant code and work out the changes the request needs, then write the ticket from those.
   - Title: `<Type>: <summary>`, with the type the PR template uses (Feat, Bugfix, A11y, Docs, Refactor, Chore). Pick the type from the nature of the changes.
   - Description, in the same three parts as the board's existing cards: **Why** (the problem the changes solve, in the user's terms), **What to do** (the concrete changes), **Done when** (criteria that can be checked).
   - Keep the scope to the changes and to what the user asked for. Do not add work they did not mention.
3. Tell the user in one line which ticket you are using, with its link, and whether you found it or created it. Then continue at step 2 without waiting for a reply.

**When you cannot infer it, ask.** Ask before creating the ticket when the changes do not tell you enough:

- the diff shows what changed but not why, and neither the request nor the conversation explains it
- the changes mix unrelated pieces of work, so it is unclear whether they are one ticket or several
- there are no changes yet and the request could mean two materially different pieces of work, or you cannot say how to tell that it is done

Ask only for the missing piece, as a specific question with the options you see (for example, "These changes touch the search form and the theme toggle. One ticket or two?"), not for a full title and description. Details you can reasonably choose yourself are not a reason to ask; choose, and state the choice in the ticket.

**Carrying existing changes into the flow.** When the ticket was written from changes that already exist, keep them: step 4 must not discard or redo them. Uncommitted changes move onto the new branch. Commits already on a feature branch stay there, and that branch is the one the PR is opened from. Review the existing changes against the ticket in step 5 and finish anything missing.

For Trello without MCP tools, the extra REST calls are:

```bash
# <boardId> is the short id in the board URL: trello.com/b/<boardId>
curl -s "https://api.trello.com/1/boards/<boardId>/cards?fields=name,desc,idList,shortUrl&$A"
curl -s -X POST "https://api.trello.com/1/cards?$A" \
  --data-urlencode "idList=<todoListId>" \
  --data-urlencode "name=<title>" \
  --data-urlencode "desc=<description>"
```

## 1. Pick the tracker from the link

The link decides which MCP server to use. Do not ask the user which tracker it is. With no ticket link, the project board's link decides.

| Link host | Tracker | MCP server | A ticket is a | A column is a |
| --- | --- | --- | --- | --- |
| `trello.com` | Trello | Trello | card | list |
| `planner.cloud.microsoft`, `tasks.office.com`, `tasks.cloud.microsoft`, `planner.office.com` | Microsoft Planner | Planner | task | bucket |

Find that server's tools in the session by server name (search the available and deferred tools for `trello` or `planner`) and use them for every tracker step below. The rest of this skill says "card" and "column"; read those as the tracker's own terms.

If the link matches neither tracker, say so and ask which one it is.

**Trello only: REST fallback.** If no Trello MCP tools are available, call the Trello REST API with the `TRELLO_API_KEY` and `TRELLO_TOKEN` environment variables. Never print those values or send them anywhere except `api.trello.com`.

```bash
A="key=$TRELLO_API_KEY&token=$TRELLO_TOKEN"
# <id> is the short id in the card URL: trello.com/c/<id>/...
curl -s "https://api.trello.com/1/cards/<id>?fields=name,desc,idList,idBoard&checklists=all&$A"
curl -s "https://api.trello.com/1/boards/<idBoard>/lists?fields=name&$A"
curl -s -X PUT "https://api.trello.com/1/cards/<id>?idList=<listId>&$A"
```

**Planner has no fallback.** The task id is in the link (the `taskId` query parameter, or the path segment after `/task/`). A Planner task's description and checklist are in its details, which is usually a separate read from the task itself. If the Planner MCP server is missing or needs authentication, stop and tell the user; do not try to reach Microsoft Graph another way.

If you cannot read the ticket by any route, say so and ask before doing the code work, because the ticket text is the specification.

## 2. Read the card and move it to In Progress

Read the title, description and checklist.

Find the target columns by name on the card's own board or plan (the In Progress column and the QA column; match loosely, since the user may misspell them). Do not hard-code column ids.

Move the card to In Progress before starting the work.

## 3. Check the card against the code

The card's "Why" was written from memory and is sometimes out of date or slightly wrong. Before changing anything, confirm its premise in the code, and by measurement where that applies (for example: fetch the page and look at the HTML, sample the real API, load the page at a phone width).

- If the work is already done on the default branch, do not redo it. Report that, with the evidence, and leave the card where it is unless told otherwise.
- If the premise is wrong but the goal still makes sense, do the work and state the corrected premise in the PR.

## 4. Branch

Fetch, then create the branch from the latest default branch (`origin/HEAD`), not from whatever branch is checked out. Earlier ticket PRs are usually merged by the time the next one starts. The exception is work that already exists for this ticket (see "Carrying existing changes into the flow").

Name the branch from the card's prefix, in the repository's existing style. Check `git branch -a` for the convention; in this repository it is `<type>/<snake_case_summary>`, for example `chore/remove_unused_babel_config`, `bugfix/responsive_anime_grid`, `feat/isr_home_and_details`.

## 5. Implement

- Do what the card's "What to do" lists, and treat "Done when" as the acceptance criteria.
- Keep to the card's scope. If you find a related problem outside it, leave it alone and report it (see step 8).
- Small departures from the card's wording are fine when the literal instruction does not work; say what you did instead and why.
- Update the README when the change makes it wrong.
- Leave untracked files you did not create for this ticket out of the commit, and mention them.

## 6. Verify

Run every check the repository has: type-check, lint, unit tests, and a production build. Read `package.json` for the scripts and the lockfile for the package manager.

Then test the "Done when" criteria directly, against a production build where the behaviour is runtime behaviour. Measure before and after when the ticket is a bug fix, so the PR can show the difference. Stop any server or browser you started and remove build output you created.

Keep track of what you did not check. A visual change that you only confirmed from generated CSS or a headless screenshot has not been checked in a real browser, and the PR must say so.

## 7. Commit, push, open the PR

- Commit message: the card title as the subject (`<Type>: <summary>`), then a short bullet list of what changed. Look at `git log` for the house style.
- Commits here are GPG-signed. If signing fails because the key is locked, stop and ask the user to unlock it. Do not pass `--no-gpg-sign`.
- Push the branch and open the PR against the default branch with `gh pr create`.
- If the repository has a PR template (`.github/PULL_REQUEST_TEMPLATE.md`), fill it in. Title the PR with the card title and include the card link.
- In the PR body: what changed and why, any decision the card left open and how you settled it, anything the card got wrong, what you tested and the results, and what you did not test.
- Tick a checklist box only if you actually did that thing. Leave browser, light/dark mode and console checks unticked unless you performed them.

If the user reports a problem with a PR that is still open, push the fix to the same branch and update the PR description, instead of opening a new PR.

## 8. Move the card to QA and report

Move the card to the QA column only after the PR exists.

Then tell the user, briefly:

- the PR link and that the card is in QA
- what changed, in terms of behaviour
- what you verified and what you did not
- any decision you made that they might want to reverse
- anything you found outside the ticket's scope, as a suggestion for a follow-up ticket
