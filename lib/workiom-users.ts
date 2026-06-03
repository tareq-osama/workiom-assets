import type { User, UserRole, UserStatus } from '@/types/user'

interface WorkiomUserRecord {
  _id: string
  Name?: string
  Email?: string
  'Password Hash'?: string
  Role?: { id: string; label: string; order: number; color: string } | string
  Status?: { id: string; label: string; order: number; color: string } | string
  'Avatar URL'?: string
  'Last Login'?: string
  [key: string]: unknown
}

function parseSSEResponse(text: string): unknown {
  const lines = text.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('data:')) {
      const jsonStr = trimmed.slice(5).trim()
      if (!jsonStr || jsonStr === '[DONE]') continue
      try {
        const parsed = JSON.parse(jsonStr)
        if (parsed?.result?.content?.[0]?.text) {
          return JSON.parse(parsed.result.content[0].text)
        }
        if (parsed?.result) return parsed.result
        if (parsed?.error) throw new Error(parsed.error.message ?? 'Workiom API error')
      } catch (e) {
        if (e instanceof SyntaxError) continue
        throw e
      }
    }
  }
  return null
}

function getLabel(field: unknown): string {
  if (!field) return ''
  if (typeof field === 'object' && field !== null && 'label' in field) {
    return (field as { label: string }).label
  }
  return String(field)
}

function mapRecord(record: WorkiomUserRecord): User {
  return {
    id: record._id,
    name: record.Name ?? '',
    email: record.Email ?? '',
    role: (getLabel(record.Role) as UserRole) || 'Viewer',
    status: (getLabel(record.Status) as UserStatus) || 'Pending',
    avatarUrl: record['Avatar URL'] ?? undefined,
    lastLogin: record['Last Login'] ?? undefined,
  }
}

class WorkiomUsersClient {
  private baseUrl = 'https://mcp.workiom.com/mcp'
  private apiKey: string
  private listId: string

  constructor() {
    this.apiKey = process.env.WORKIOM_API_KEY ?? ''
    this.listId = process.env.WORKIOM_USERS_LIST_ID ?? ''
  }

  private async getSessionId(): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'workiom-assets', version: '1.0' },
        },
        id: 1,
      }),
    })

    const sessionId = res.headers.get('mcp-session-id')
    if (!sessionId) throw new Error('No session ID returned from Workiom MCP')
    return sessionId
  }

  private async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const sessionId = await this.getSessionId()

    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        Authorization: `Bearer ${this.apiKey}`,
        'mcp-session-id': sessionId,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: toolName, arguments: args },
        id: 2,
      }),
    })

    const text = await res.text()
    return parseSSEResponse(text)
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.findRawByEmail(email)
    return raw ? mapRecord(raw) : null
  }

  async findRawByEmail(email: string): Promise<WorkiomUserRecord | null> {
    // Use filters for a precise field-level match instead of full-text search.
    // search: email with limit:1 is unreliable — Workiom searches across all
    // text fields and the first result may not be the right user.
    const result = (await this.callTool('get_records', {
      listId: this.listId,
      limit: 10,
      offset: 0,
      filters: [{ field: 'Email', operator: 'eq', value: email.toLowerCase() }],
    })) as { success?: boolean; data?: { items?: WorkiomUserRecord[] } } | null

    if (!result?.data?.items?.length) return null

    return (
      result.data.items.find(
        (r) => (r.Email ?? '').toLowerCase() === email.toLowerCase()
      ) ?? null
    )
  }

  async findById(id: string): Promise<User | null> {
    const result = (await this.callTool('get_records', {
      listId: this.listId,
      limit: 1,
      offset: 0,
      filters: [{ field: '_id', operator: 'eq', value: id }],
    })) as { success?: boolean; data?: { items?: WorkiomUserRecord[] } } | null

    if (!result?.data?.items?.length) return null
    return mapRecord(result.data.items[0])
  }

  async create(data: {
    name: string
    email: string
    passwordHash: string
    role: UserRole
    status: UserStatus
  }): Promise<User> {
    const result = (await this.callTool('create_record', {
      listId: this.listId,
      recordData: {
        Name: data.name,
        Email: data.email,
        'Password Hash': data.passwordHash,
        Role: data.role,
        Status: data.status,
      },
    })) as { success?: boolean; data?: WorkiomUserRecord } | null

    if (!result?.data) throw new Error('Failed to create user record')
    return mapRecord(result.data)
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.callTool('update_record', {
      listId: this.listId,
      recordId: id,
      updateData: {
        'Last Login': new Date().toISOString(),
      },
    })
  }
}

export const workiomUsers = new WorkiomUsersClient()
