# Repo Instructions

Follow this repository standard as the first priority:
- .windsurf/rules/patterns.md

Execution order for every task:
1. Read existing code and match existing pattern before writing changes.
2. Keep changes minimal and scoped to the request.
3. Do not introduce new architecture unless explicitly requested.
4. Preserve naming, file structure, and state-management conventions already used in nearby files.
5. Validate with the project lint/test command relevant to touched code.
6. Read package.json to understand tech stack and dependencies.

Hard rules:
- If pattern is unclear, inspect neighboring modules first.
- Prefer consistency over cleverness.
- For refactors, preserve behavior unless user asks for behavior change.
- If there are trade-offs, document them briefly in the final response.
