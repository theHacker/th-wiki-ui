Changelog
==========

> [!IMPORTANT]
> This file is generated automatically from `changelog.json`.
> **Do not edit manually.**

<style>
  article h2 { border-top: 2px solid rgba(255, 255, 255, .15); padding-top: 1.5rem; margin-top: 1.5rem; }
  article h3 { font-size: 1.25rem }
</style>

## 📦️ **1.3.0** · Changelog and automated public release · _2026-05-12_

### Changes
- 🏗️ GitLab CI will create public releases to Codeberg and GitHub
- 🏗️ Added changelog `CHANGELOG.md` as well as scripts to generate it from the `changelog.json`
- 🏗️ Added a structured changelog `changelog.json`
- ✨️ Version info shows version number (= Git tag and distance from `git-describe`)

## 📦️ **1.2.0** · Table of Contents (TOC) · _2026-01-05_

This release breaks bookmarks as we change the URL, e.g. from `/issues/{uuid}#Links:Table` to `/issues/{uuid}#links:table` (don't be confused: The commit message says `{user}`, it's a typo 🙈), and later to `/issues/{uuid}?tab=links&links-tab=table`.

This release also resets user preferences in `localStorage`. You should delete your browser's local storage to clear up orphan values.

### Changes
- ✨️ Table of Contents will highlight incorrect heading levels
- ✨️ Table of Contents (TOC)
- ✨️ Sticky header in the wiki, so tabs and controls are always visible
- ✨️ `#` URLs are reserved to jump to content, UI state is done via `?` query parameters
- 🐛 `MarkdownRenderer.extractTitle()` parsed twice
- 🧹 Changed how enum-ish values are represented and serialized
- 🗑️ Consistent error messages ending with a period
- ✨️ URLs are to be in lowercase

## 📦️ **1.1.0** · Backup and convenience features · _2026-01-05_

### Changes
- ✨️ Project are sorted by prefix in dropdowns
- ✨️ Improvements to "Link to another issue" (issues are sorted by project and issue number, quick search inside the dialog box)
- ✨️ Dependency graph supports different line curve styles
- ✨️ Dependency graph allows pruning done issues
- ✨️ "Scroll to active node" feature in wiki pages tree
- ✨️ Delete button will be disabled when operation would fail
- ✨️ When creating a new wiki page the current one is preset as parent
- 🏗️ Various improvements in CI pipeline (caches not present, supply chain protection, use `bun ci` instead of `bun i`)
- ✨️ Headings better distinguishable by colorization
- 🐛 Various markdown rendering fixes (images broke the layout, GFM checkbox items coexisting with non-checkbox items in the same list, GFM alerts having first paragraph with multiple lines or having inline markdown)
- ✨️ "Backups" section in administration

## 📦️ **1.0.0** · Public release to Codeberg and GitHub 🎉 · _2025-08-31_

### Changes
- 📚️ Added license

## 📦️ **0.16.0** · Markdown improvements and integrated help · _2025-08-31_

This version prepares everything for the public release.

### Changes
- ✨️ Support for GFM alerts in Markdown
- 📚️ Improved `README.md`
- ✨️ Integrated help system
- ✨️ Markdown rendering supports relative paths to attachments
- 🐛 Invalid Mermaid won't break the page anymore
- 🐛 Adding a tag in the wiki directly updates the wiki pages tree
- ✨️ Link/Tooltip support for issue keys now also in the wiki
- 🐛 Various fixes for Markdown rendering (destroyed tooltip, issue keys in code tags, missing escaping)
- 🧪 Make our Markdown rendering testable
- ✨️ Browser's tab title now reflects current subpage
- ✨️ Support for `cpp` (C++) syntax highlighting

## 📦️ **0.15.0** · Active tab URLs, user preferences, ANTLR-powered search for wiki pages · _2025-06-07_

### Changes
- ✨️ ANTLR-powered search now also available for wiki pages
- ✨️ Wiki pages tree shows tags
- ✨️ "Expand/collapse all" for wiki pages tree
- 🏗️ Pinned all library versions
- 🐛 Tab characters are rendered correctly (this has been a bug in Marked.js)
- 🏗️ Upgraded all libraries
- 🏗️ Upgraded ESLint to 9.x
- ✨️ Saving user preferences (full width layout, attachments view table/thumbnail, issues list options, tab administration options, dependency graph options) to local storage
- ✨️ "Search usages" button in tag administration implemented
- ✨️ URLs can target a page with a specific tab open
- ✨️ Navigating between wiki pages or issues will always target the content tab
- ✨️ Refreshing the page in the browser will stay on the active tab

## 📦️ **0.14.0** · Improvements related to issue key · _2025-05-26_

### Changes
- ✨️ Issue keys inside issue descriptions will be replaced with a link and tooltip
- 🗑️ Removed manual assignment of `issueKey` in favor of new API field
- ✨️ Links to `/issues/{issueKey}` redirect to the UUID
- 🏗️ Only the `master` branch can be deployed to prod

## 📦️ **0.13.0** · Attachments for issues · _2025-05-05_

### Changes
- ✨️ Support for lastModified date when uploading a file
- ✨️ New `hasAttachments` attribute for issue filter
- ✨️ Issues list shows an attachment icon when an issue has at least one attachment
- ✨️ When uploading an attachment, the filename can be changed
- ✨️ Issues can have attachments
- 🐛 Icon in wiki pages tree get updated after upload/deletion of attachment
- 🐛 Correct `colspan` for empty attachments table

## 📦️ **0.12.0** · Tags · _2025-05-04_

### Changes
- 🗑️ Removed remaining code for REST API
- 🗑️ Removed `<DemoView>`
- 🗑️ Removed deprecated tasks sections
- ✨️ Issue search supports quick search for issue number
- ✨️ Expanded "Actions" button on issues
- ✨️ Improvement for tag administration (number of tags, accordion, "Add" button per section)
- ✨️ Issue search supports new attributes `hasTags`, `tag`, `tagScope`, and `tagTitle`
- ✨️ Issue link shows tags
- ✨️ Tags can be associated with wiki pages and issues
- ✨️ Tags administration
- ✨️ `parseColor()` to support CSS color names, `#rgb`, `#rrggbb`, and `rgb(r,g,b)` colors in additional to Bootstrap colors
- ✨️ Administration supports sub-pages

## 📦️ **0.11.0** · Various improvements, ANTLR-powered issue search · _2025-04-12_

### Changes
- 🗑️ Resolved various linting issues
- 🏗️ Linting in CI pipeline
- ✨️ Attachments can be uploaded directly from clipboard
- 🏗️ Replaced `npm` with `bun`
- ✨️ Improvements on attachments (icon in wiki pages tree, thumbnails grid, byte size formatting, MIME type and image dimensions in table)
- ✨️ Move wiki page (drag&drop support in wiki pages tree and "Actions" dropdown menu)
- 🗑️ Vue components must not be named with single-words
- ✨️ Improvements on issue (checkbox styling, issue links and dependency graph show type/priority/status)
- ✨️ Rudimentary ANTLR-powered complex search for issues (e.g. `some-text "other text" (project:foo OR project:bar) orderby:~status`)
- ✨️ Improvements on issues list (due date sorting, number of issues filtered/total, project prefix in filter dropdown)

## 📦️ **0.10.0** · GraphQL API · _2025-03-30_

This release changes all API calls to use the new GraphQL API.
We will only query relevant data, and will do so with a single request.

Note also, the new GraphQL API does not support the deprecated _entries_ and _tasks_ anymore.

### Changes
- 🧹 First step towards a centralized error handling
- ✨️ Replaced all API calls with the new GraphQL API

## 📦️ **0.9.0** · Syntax highlighting and due issues · _2025-02-11_

### Changes
- ✨️ Filter and indication for issues with a due date
- ✨️ Syntax highlighting for code blocks
- 🏗️ CI pipeline won't deploy tryouts and work-in-progress branches anymore

## 📦️ **0.8.0** · _(empty release)_ · _2025-02-09_

This is an empty release to match the version number in the backend.

### Changes
_(no changes)_

## 📦️ **0.7.0** · Issues · _2025-01-29_

### Changes
- ✨️ Dependency graph for issue links
- ✨️ Issue links
- ✨️ Issues (details, new, edit, delete, move between projects, change status)
- ✨️ Issues list with filters
- ✨️ Project administration
- ✨️ Administration menu

## 📦️ **0.6.0** · Bootstrap, mobile, and polishing · _2025-01-05_

### Changes
- ✨️ Mermaid charts
- ✨️ Miscellaneous polishing of the tree component
- ✨️ Preview rendering for Markdown
- ✨️ Miscellaneous polishing, e.g. number of attachments, Markdown styling
- ✨️ Every page is now responsive for mobile
- 🧹 Replaced Bulma with Bootstrap
- 🗑️ Removed demo elements on the home page

## 📦️ **0.5.0** · Docker build · _2024-07-28_

### Changes
- ✨️ Version info to display Git hash of frontend and connected backend
- ✨️ Different stages are displayed in the header
- 🏗️ GitLab CI
- 🔹 No more need for a proxy anymore. Backend can be connected directly.
- 🏗️ Docker build

## 📦️ **0.4.0** · Tasks · _2024-07-10_

### Changes
- ✨️ Wiki pages can be converted to a task
(This feature exists because I meanwhile just created wiki pages for my tasks)
- ✨️ Tasks
- 🧹 `creationTime`/`modificationTime` is done on backend side
- ✨️ Ctrl-click on save for wiki pages to stay on the page

## 📦️ **0.3.0** · Attachments · _2024-06-25_

### Changes
- ✨️ Attachments

## 📦️ **0.2.0** · Entries · _2024-06-19_

### Changes
- ✨️ Wiki pages can be edited
- ✨️ Selected wiki page is marked visually
- ✨️ Tree structure for wiki pages
- 🧹 Adaption to the new "entries" concept

## 📦️ **0.1.0** · Wiki pages · _2024-06-15_

This is the first minimal working version 😄️

### Changes
- ✨️ Wiki pages
- ✨️ Axios HTTP client
- 🏗️ Initial setup: npm, Vue.js SFCs, Vue Router, Vite, ESLint, Vitest, Cypress, SCSS, Bulma, Font Awesome
