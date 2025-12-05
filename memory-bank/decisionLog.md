# Decision Log

- 11 major technical decisions with full rationale
- Alternatives considered for each decision
- Impact analysis and trade-offs
- Decision statistics and review schedule
- Covers: Memory Bank architecture, Supabase choice, dictionary-based translation, SVG rendering, React+TS+Vite stack, gamification, freemium model, Afro-futurist design, three-format output


---

### [2025-11-18 00:54:38] - Removal of `.bolt` Directory

**Decision:** Remove the `.bolt` directory and its contents from the project.

**Rationale:**
- The directory was a remnant from the initial project scaffolding using `bolt.new`.
- A full codebase search confirmed there were no references or dependencies on this directory or its contents.
- Its removal cleans the project structure and eliminates obsolete, unused files.

**Implications:**
- The codebase is now cleaner, with no vestigial artifacts from the initial setup tool.
- This action has no impact on the project's functionality as the files were entirely unused.

[2025-11-19 16:32:00] - Initiated RooCode 46-Agent Orchestration Solutions Implementation
- Read comprehensive solutions guide (roocode_agent_orchestration_solutions.md)
- Root cause: Task decomposition failure, context window overflow, delegation chain breakdown
- Solution approach: 5-point strategy including task decomposition pattern, user guidance standardization, agent selection matrix, MCP configuration fix, and routing header standardization
- Implementation plan: Week 1 (Foundation), Week 2 (Validation), Week 3 (Scale)
- Success metrics: Zero "thought process failure" errors in 10 tasks, agent delegation within token limits, 100% routing header compliance
- Next action: Apply solutions sequentially starting with MCP configuration and uber-orchestrator.yaml updates

[2025-12-05 17:02:00] - Perplexity MCP Server Rebuild

**Decision:** Complete rebuild of the Perplexity MCP server based on official documentation at https://docs.perplexity.ai/guides/mcp-server

**Rationale:**
- Previous implementation used invalid/deprecated model name `pplx-sonar-small-online`
- Official specification requires 4 specialized tools instead of single generic tool
- Needed to align with Perplexity's current API structure and best practices

**Changes Implemented:**
1. **Four Specialized Tools:**
   - `perplexity_search` - Direct Search API integration for current information
   - `perplexity_ask` - Conversational AI using `sonar-pro` model
   - `perplexity_research` - Deep research using `sonar-deep-research` model
   - `perplexity_reason` - Advanced reasoning using `sonar-reasoning-pro` model

2. **Architecture Updates:**
   - Split API handling into `handleSearch()` and `handleChat()` methods
   - Added citation support for chat responses
   - Enhanced response formatting for search results
   - Updated to valid current Perplexity model names

3. **Documentation:**
   - Created comprehensive README.md with usage examples
   - Documented all four tools with specific use cases
   - Included MCP client configuration examples

**Implications:**
- Breaking change: Old single `perplexity` tool replaced with 4 specialized tools
- Version bumped from 0.1.0 to 0.2.0
- Existing integrations will need to update their tool calls
- Better alignment with official Perplexity MCP specification
- Users now have access to specialized models for different tasks

**Files Modified:**
- [`mcp-study/perplexity-mcp/index.ts`](mcp-study/perplexity-mcp/index.ts) - Complete rewrite with 4 tools
- [`mcp-study/perplexity-mcp/lib.ts`](mcp-study/perplexity-mcp/lib.ts) - Split into handleSearch and handleChat methods
- [`mcp-study/perplexity-mcp/package.json`](mcp-study/perplexity-mcp/package.json) - Version bump and description update
- [`mcp-study/perplexity-mcp/README.md`](mcp-study/perplexity-mcp/README.md) - New comprehensive documentation

[2025-12-05 17:05:54] - Removal of Nested Git Repository from mcp-study/sequentialthinking

**Decision:** Remove the nested .git directory from mcp-study/sequentialthinking subdirectory.

**Rationale:**
- RooCode checkpoint system was disabled due to nested git repository detection
- Error message: "Checkpoints are disabled because a nested git repository was detected at: mcp-study\sequentialthinking"
- The sequentialthinking directory contained its own .git repository which conflicted with the parent repository's checkpoint functionality
- Removing the nested git repository allows checkpoints to function properly

**Action Taken:**
- Executed `Remove-Item -Path .git -Recurse -Force` in mcp-study/sequentialthinking directory
- Verified successful removal with Test-Path (returned False)

**Implications:**
- Checkpoints are now enabled and functional for the entire workspace
- The sequentialthinking code remains intact, only git history was removed
- This is a third-party MCP server that can be re-cloned if git history is needed
- Improved development workflow with working checkpoint functionality
- No impact on code functionality or MCP server operation

**Files Modified:**
- mcp-study/sequentialthinking/.git (removed entirely)