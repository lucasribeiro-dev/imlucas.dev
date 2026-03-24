Review blog post(s) for grammar, spelling, clarity, and writing quality before committing.

Find all new or modified Markdown files in `src/content/blog/` by running `git diff --name-only HEAD` and `git diff --name-only --cached` and `git ls-files --others --exclude-standard src/content/blog/`.

For each blog post found:

1. **Read the full file content**

2. **Check frontmatter:**
   - Title: clear, concise, no typos
   - Description: grammatically correct, compelling for SEO
   - Tags: lowercase, consistent naming

3. **Review the body for:**
   - Spelling errors
   - Grammar mistakes (subject-verb agreement, tense consistency, article usage)
   - Punctuation issues (missing commas, incorrect apostrophes, em-dash vs hyphen)
   - Awkward or unclear phrasing
   - Redundant words or filler
   - Broken Markdown syntax (unclosed links, malformed code blocks, missing headings hierarchy)
   - Consistency in tone (technical, direct, no fluff — matching the imlucas.dev voice)

4. **Output a report for each post:**
   - List each issue with the original text and suggested fix
   - Group by severity: errors (must fix), warnings (should fix), suggestions (optional polish)
   - If no issues found, confirm the post is clean

5. **After the report, ask if the user wants you to apply the fixes automatically.**

If no blog posts are found in the diff, check if a file path argument was provided: $ARGUMENTS
If a path was provided, review that file instead.
If nothing is found, inform the user that no blog posts were detected to review.
