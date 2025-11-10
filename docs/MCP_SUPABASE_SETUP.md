# Supabase MCP Server Configuration Guide

This guide explains how to configure the Supabase MCP (Model Context Protocol) server in Cursor to connect to your Supabase database.

## Overview

The Supabase MCP server allows Cursor's AI assistant to directly interact with your Supabase database, enabling features like:
- Querying database tables
- Running migrations
- Checking database schema
- Viewing logs and advisors
- Managing edge functions

## Prerequisites

- A Supabase project (active, not paused)
- Supabase project credentials (URL and access token)
- Cursor IDE installed

## Obtaining Required Credentials

### 1. Supabase Project URL

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** (gear icon) > **API**
4. Copy the **Project URL** (format: `https://xxxxxxxxxxxxx.supabase.co`)

**Note**: This should match the `VITE_SUPABASE_URL` in your `frontend/.env` file.

### 2. Authentication (No Token Needed!)

**Good news**: With the new remote HTTP MCP server, you **don't need to generate a Personal Access Token**!

The remote server uses **dynamic client registration** with OAuth, which means:
- Cursor will automatically prompt you to login via browser when you first use it
- You'll grant organization access to the MCP client through a secure OAuth flow
- No manual token generation or management required

**If you need to use the legacy local package method** (e.g., for CI/CD), you can still generate a PAT:
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Click on your profile icon (top right)
3. Navigate to **Account Settings** > **Access Tokens**
4. Click **Generate New Token**
5. Give it a name (e.g., "Cursor MCP CI")
6. Copy the token immediately (you won't be able to see it again)

## Configuring MCP Server in Cursor

According to the [official Supabase MCP documentation](https://supabase.com/docs/guides/getting-started/mcp), Supabase now provides a **remote HTTP MCP server** that uses dynamic client registration (OAuth), so you **no longer need a Personal Access Token (PAT)**.

### Method 1: Remote HTTP Server (Recommended - No PAT Required)

This is the **new recommended method** that uses Supabase's hosted MCP server:

1. Open Cursor
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to open the command palette
3. Type "Preferences: Open Settings (JSON)" and select it
4. Look for the `mcp` or `mcpServers` section
5. Add or update the Supabase MCP configuration:

**Basic Configuration (All Projects):**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

**Project-Scoped Configuration (Recommended):**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=your-project-ref"
    }
  }
}
```

**How to get your project_ref:**
- Extract it from your Supabase URL: `https://[project-ref].supabase.co`
- Or find it in Supabase Dashboard > Settings > General > Reference ID

**Authentication:**
- Cursor will automatically prompt you to login via browser OAuth when you first use it
- No manual token generation needed!
- The OAuth flow will grant organization access to the MCP client

### Method 2: Local Package (Legacy - Requires PAT)

If you need to use the local package method (e.g., for CI/CD), you can still use the old method:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "https://your-project-id.supabase.co",
        "SUPABASE_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

**Note**: The remote HTTP method is preferred as it's simpler and more secure.

### Managing Multiple Supabase Projects

**Yes, you should configure separate MCP entries for each Supabase project!** This allows you to easily switch between projects without reconfiguring. This is especially useful when working with:
- Development and production environments
- Multiple client projects
- Different feature branches with separate databases

#### Setting Up Multiple Projects

Configure each project with a descriptive name using the remote HTTP method:

```json
{
  "mcpServers": {
    "supabase-dev": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=dev-project-ref"
    },
    "supabase-prod": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=prod-project-ref"
    },
    "supabase-ideahub": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=ideahub-project-ref"
    }
  }
}
```

**Benefits of the remote method:**
- No PAT needed - uses OAuth authentication
- Simpler configuration - just a URL
- Automatically authenticated via browser
- Project-scoped to prevent accessing wrong databases

#### Naming Conventions

Use clear, descriptive names that indicate the project or environment:
- `supabase-dev` - Development environment
- `supabase-prod` - Production environment
- `supabase-staging` - Staging environment
- `supabase-ideahub` - Specific project name
- `supabase-client-name` - Client-specific project

#### Benefits of Multiple Configurations

1. **No Reconfiguration**: Switch between projects instantly without editing settings
2. **Context Awareness**: Cursor can use the appropriate database based on your workspace
3. **Safety**: Reduces risk of accidentally querying the wrong database
4. **Organization**: Keep all your project configurations in one place
5. **Documentation**: The configuration itself documents which projects you're working with

#### Switching Between Projects

When you have multiple Supabase MCP servers configured, Cursor will typically:
- Use the default/primary configuration for general queries
- Allow you to specify which server to use in your queries
- Automatically detect which project matches your workspace's `.env` file

**Note**: The exact behavior depends on Cursor's MCP implementation. Check Cursor's MCP documentation for details on how to specify which server to use.

#### Managing Old or Paused Databases

If you have an old MCP configuration pointing to a paused or unused database:

1. **Rename it** to something descriptive that indicates its status:
   ```json
   "supabase-aicommunity-base-old": {
     // ... old config
   }
   ```
   Or:
   ```json
   "supabase-paused": {
     // ... paused database config
   }
   ```

2. **Disable it** by commenting it out or removing it entirely:
   ```json
   {
     "mcpServers": {
       // Old paused database - disabled
       // "supabase-aicommunity-base": { ... },
       
       "supabase-ideahub": {
         // Active configuration
       }
     }
   }
   ```

3. **Or keep it for reference** but clearly mark it as inactive:
   ```json
   "supabase-aicommunity-base-inactive": {
     "command": "npx",
     "args": ["-y", "@supabase/mcp-server-supabase"],
     "env": {
       "SUPABASE_URL": "https://old-paused-project.supabase.co",
       "SUPABASE_ACCESS_TOKEN": "old-token"
     },
     "disabled": true  // If supported by Cursor
   }
   ```

**Recommendation**: If the database is paused and you don't plan to use it, disable or remove the configuration to avoid confusion and connection errors.

### Method 2: Using Environment Variables

If your MCP server reads from environment variables, you can set them:

**Windows (PowerShell):**
```powershell
$env:SUPABASE_URL="https://your-project-id.supabase.co"
$env:SUPABASE_ACCESS_TOKEN="your-access-token-here"
```

**Windows (Command Prompt):**
```cmd
set SUPABASE_URL=https://your-project-id.supabase.co
set SUPABASE_ACCESS_TOKEN=your-access-token-here
```

**macOS/Linux:**
```bash
export SUPABASE_URL="https://your-project-id.supabase.co"
export SUPABASE_ACCESS_TOKEN="your-access-token-here"
```

### Method 3: Using a Configuration File

Some MCP setups use a configuration file. Check if there's a `.cursor/mcp.json` or similar file in your project root:

```json
{
  "servers": {
    "supabase": {
      "url": "https://your-project-id.supabase.co",
      "accessToken": "your-access-token-here"
    }
  }
}
```

## Syncing with frontend/.env

To ensure the MCP server uses the same database as your application:

1. **Read your `frontend/.env` file** (if not git-ignored):
   ```bash
   # Windows PowerShell
   Get-Content frontend\.env
   
   # macOS/Linux
   cat frontend/.env
   ```

2. **Extract the values**:
   - `VITE_SUPABASE_URL` → Use as `SUPABASE_URL` in MCP config
   - For the access token, you'll need to generate one from the Supabase dashboard (see above)

3. **Update your MCP configuration** with these values

## Verifying the Configuration

After configuring, test the connection:

1. In Cursor, ask the AI assistant: "What tables are in my Supabase database?"
2. If configured correctly, it should list your tables
3. If you get connection errors, check:
   - The project URL is correct
   - The access token is valid
   - The database is not paused
   - The MCP server has been restarted after configuration changes

## Troubleshooting

### Issue: "Connection timeout" or "Database paused"

**Symptoms**: MCP queries fail with timeout errors

**Solutions**:
1. Check if your database is paused in the Supabase dashboard
2. Resume the database if paused
3. Verify you're using the correct project URL (not a paused/old project)
4. Ensure the project URL matches `VITE_SUPABASE_URL` in `frontend/.env`

### Issue: "Authentication failed"

**Symptoms**: MCP queries fail with authentication errors

**Solutions**:
1. Verify your access token is correct
2. Check if the token has expired (generate a new one)
3. Ensure you're using an access token, not the anon key
4. Verify the token has the necessary permissions

### Issue: "Cannot find MCP server"

**Symptoms**: Cursor doesn't recognize the Supabase MCP server

**Solutions**:
1. Ensure the MCP server package is installed:
   ```bash
   npm install -g @supabase/mcp-server-supabase
   ```
2. Restart Cursor after configuration changes
3. Check Cursor's MCP server logs for errors
4. Verify the configuration JSON syntax is correct

### Issue: "Wrong database" or "Tables not found"

**Symptoms**: MCP connects but shows wrong tables or empty results

**Solutions**:
1. Verify the `SUPABASE_URL` matches your active project
2. Check `frontend/.env` to confirm which project you're using
3. Ensure you're not connecting to a paused or old project
4. Compare the project URL in MCP config with `VITE_SUPABASE_URL`

## Best Practices

1. **Use Personal Access Tokens**: Prefer personal access tokens over service role keys for MCP
2. **Keep Tokens Secure**: Never commit access tokens to version control
3. **Use Environment Variables**: Store sensitive values in environment variables, not in config files
4. **Document Your Setup**: Keep notes on which project URL and token you're using
5. **Regular Rotation**: Rotate access tokens periodically for security
6. **Match Environments**: Ensure MCP uses the same project as your `frontend/.env` for consistency
7. **Configure Multiple Projects**: Set up separate MCP entries for each Supabase project to avoid reconfiguration when switching projects
8. **Use Descriptive Names**: Name your MCP configurations clearly (e.g., `supabase-dev`, `supabase-prod`) to avoid confusion
9. **Keep Configurations Updated**: When you update a project's `.env` file, update the corresponding MCP configuration
10. **One Token Per Project**: Consider generating separate access tokens for each project/environment for better security and tracking

## Configuration Checklist

- [ ] Obtained Supabase project URL from dashboard
- [ ] Generated personal access token (or obtained service role key)
- [ ] Verified project URL matches `VITE_SUPABASE_URL` in `frontend/.env`
- [ ] Configured MCP server in Cursor settings
- [ ] Renamed/disabled any old or paused database configurations
- [ ] Restarted Cursor after configuration
- [ ] Tested connection by querying database tables
- [ ] Documented which project is being used

## Example: Complete Setup

### Single Project Setup (Remote HTTP Method - Recommended)

Here's a complete example configuration using the new remote HTTP method:

**frontend/.env:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cursor MCP Configuration (.cursor/mcp.json):**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=abcdefghijklmnop"
    }
  }
}
```

**Note**: The `project_ref` in the URL should match the project ID from `VITE_SUPABASE_URL` (the part before `.supabase.co`).

### Multiple Projects Setup (Remote HTTP Method)

Here's an example with multiple Supabase projects configured:

**frontend/.env (Development):**
```env
VITE_SUPABASE_URL=https://dev-abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**frontend/.env.production (Production):**
```env
VITE_SUPABASE_URL=https://prod-xyzabcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cursor MCP Configuration (.cursor/mcp.json):**
```json
{
  "mcpServers": {
    "supabase-dev": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=dev-abcdefghijklmnop"
    },
    "supabase-prod": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=prod-xyzabcdefghijklm"
    },
    "supabase-old-paused": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=old-paused-project",
      "disabled": true
    }
  }
}
```

**Benefits**: 
- No PAT needed - uses OAuth authentication
- Switch between dev and prod databases without reconfiguration
- Project-scoped URLs prevent accessing wrong databases
- Clear naming makes it obvious which database you're querying
- Disabled entries can be kept for reference without causing connection errors

## Additional Resources

- [Supabase MCP Server Documentation](https://github.com/supabase/mcp-server-supabase)
- [Cursor MCP Documentation](https://docs.cursor.com/mcp)
- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Access Tokens Guide](https://supabase.com/docs/guides/platform/access-tokens)

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Maintained by**: AI Ideas Hub Development Team

