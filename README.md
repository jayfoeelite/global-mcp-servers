# Global MCP Servers

A comprehensive collection of **Model Context Protocol (MCP)** server implementations designed to extend AI capabilities through standardized tool and resource provisioning.

## Overview

This project serves as a study and implementation repository for the Model Context Protocol (MCP), an open standard that enables AI assistants to interact with tools and data sources in a structured, secure, and extensible manner. Each MCP server implementation provides specialized tools and resources that enhance the capabilities of language models and AI agents.

## Key Objectives

- **Standardization**: Implement MCP servers that adhere to the open standard for AI-tool integration.
- **Extensibility**: Create modular, reusable servers that can be easily integrated into different AI systems.
- **Research & Development**: Explore best practices in MCP server design, implementation, and deployment.
- **Multi-Architecture Support**: Support both Stdio-based (local) and SSE-based (remote) server architectures.

## Implemented MCP Servers

This repository contains the following MCP server implementations:

### 1. Doc Fetcher MCP (`doc-fetcher-mcp`)
- **Purpose**: Fetches documentation for a specified library.
- **Tools**: `get_docs`
- **Implementation**: TypeScript

### 2. Memory Bank MCP (`memory-bank-mcp`)
- **Purpose**: Provides a persistent memory store for AI agents, allowing them to read, append, and overwrite knowledge files.
- **Tools**: `read_memory`, `append_to_memory`, `overwrite_memory`
- **Implementation**: TypeScript

### 3. Perplexity MCP (`perplexity-mcp`)
- **Purpose**: Integrates with the Perplexity API to answer questions and provide information.
- **Tools**: `perplexity`
- **Implementation**: TypeScript

### 4. Sequential Thinking MCP (`sequential-thinking`)
- **Purpose**: A detailed tool for dynamic and reflective problem-solving through a structured thinking process.
- **Tools**: `sequentialthinking`
- **Implementation**: TypeScript

### 5. Other Servers
This project also includes studies and implementations for other servers, including:
- **Fetch**: A server for fetching web content (HTML, Markdown, JSON, text).
- **Filesystem**: A server for interacting with the local filesystem.
- **Git**: A server for Git operations.
- **Time**: A simple server for time-related information.

## Getting Started

To run any of the servers, navigate to its directory and follow the instructions in its respective `README.md` file. Generally, you will need to install dependencies and then run the server.

Example for `perplexity-mcp`:
```bash
cd mcp-study/perplexity-mcp
npm install
# (You may need to set API keys as environment variables)
npm start
```

## Contributing

Contributions are welcome. Please read the `CONTRIBUTING.md` file (if available in a specific project) before submitting a pull request.
