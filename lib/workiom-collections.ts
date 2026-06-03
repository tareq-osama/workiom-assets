import type { Asset } from '@/types/asset';

export interface Collection {
  id: string;
  name: string;
  description?: string;
  assetIds: string[];
  ownerEmail: string;
  ownerName: string;
  visibility: 'Private' | 'Public';
  shareToken: string;
  coverImageUrl?: string;
  createdAt?: string;
}

interface WorkiomCollectionRecord {
  _id: string;
  Name?: string;
  Description?: string;
  'Asset IDs'?: string;
  'Owner Email'?: string;
  'Owner Name'?: string;
  Visibility?: { id: string; label: string } | string;
  'Share Token'?: string;
  'Cover Image URL'?: string;
  'Created At'?: string;
  [key: string]: unknown;
}

function parseSSE(text: string): unknown {
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) continue;
    const jsonStr = trimmed.slice(5).trim();
    if (!jsonStr || jsonStr === '[DONE]') continue;
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed?.result?.content?.[0]?.text) return JSON.parse(parsed.result.content[0].text);
      if (parsed?.result) return parsed.result;
      if (parsed?.error) throw new Error(parsed.error.message ?? 'Workiom error');
    } catch (e) {
      if (e instanceof SyntaxError) continue;
      throw e;
    }
  }
  return null;
}

function getLabel(field: unknown): string {
  if (!field) return '';
  if (typeof field === 'object' && field !== null && 'label' in field) return (field as { label: string }).label;
  return String(field);
}

function mapRecord(r: WorkiomCollectionRecord): Collection {
  let assetIds: string[] = [];
  try {
    const raw = r['Asset IDs'];
    if (raw) assetIds = JSON.parse(raw);
  } catch { assetIds = []; }

  return {
    id: r._id,
    name: r.Name ?? '',
    description: r.Description ?? undefined,
    assetIds,
    ownerEmail: r['Owner Email'] ?? '',
    ownerName: r['Owner Name'] ?? '',
    visibility: (getLabel(r.Visibility) as Collection['visibility']) || 'Private',
    shareToken: r['Share Token'] ?? '',
    coverImageUrl: r['Cover Image URL'] ?? undefined,
    createdAt: r['Created At'] ?? undefined,
  };
}

class WorkiomCollectionsClient {
  private baseUrl = 'https://mcp.workiom.com/mcp';
  private apiKey: string;
  private listId: string;

  constructor() {
    this.apiKey = process.env.WORKIOM_API_KEY ?? '';
    this.listId = process.env.WORKIOM_COLLECTIONS_LIST_ID ?? '';
  }

  get configured() { return !!this.listId; }

  private async getSessionId(): Promise<string> {
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'workiom-assets', version: '1.0' } }, id: 1 }),
    });
    const sid = res.headers.get('mcp-session-id');
    if (!sid) throw new Error('No session ID from Workiom MCP');
    return sid;
  }

  private async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const sid = await this.getSessionId();
    const res = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', Authorization: `Bearer ${this.apiKey}`, 'mcp-session-id': sid },
      body: JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', params: { name: toolName, arguments: args }, id: 2 }),
    });
    return parseSSE(await res.text());
  }

  async getByOwner(ownerEmail: string): Promise<Collection[]> {
    const result = (await this.callTool('get_records', {
      listId: this.listId, limit: 50, offset: 0, search: ownerEmail,
    })) as { data?: { items?: WorkiomCollectionRecord[] } } | null;
    const items = result?.data?.items ?? [];
    return items.filter(r => (r['Owner Email'] ?? '').toLowerCase() === ownerEmail.toLowerCase()).map(mapRecord);
  }

  async getByShareToken(token: string): Promise<Collection | null> {
    const result = (await this.callTool('get_records', {
      listId: this.listId, limit: 1, offset: 0, search: token,
    })) as { data?: { items?: WorkiomCollectionRecord[] } } | null;
    const items = result?.data?.items ?? [];
    const match = items.find(r => r['Share Token'] === token);
    return match ? mapRecord(match) : null;
  }

  async getById(id: string): Promise<Collection | null> {
    const result = (await this.callTool('get_records', {
      listId: this.listId, limit: 1, filters: [{ field: '_id', operator: 'eq', value: id }],
    })) as { data?: { items?: WorkiomCollectionRecord[] } } | null;
    const items = result?.data?.items ?? [];
    return items.length ? mapRecord(items[0]) : null;
  }

  async create(data: { name: string; description?: string; ownerEmail: string; ownerName: string; coverImageUrl?: string }): Promise<Collection> {
    const shareToken = crypto.randomUUID();
    const result = (await this.callTool('create_record', {
      listId: this.listId,
      recordData: {
        Name: data.name,
        Description: data.description ?? '',
        'Asset IDs': '[]',
        'Owner Email': data.ownerEmail,
        'Owner Name': data.ownerName,
        Visibility: 'Private',
        'Share Token': shareToken,
        'Cover Image URL': data.coverImageUrl ?? '',
        'Created At': new Date().toISOString(),
      },
    })) as { data?: WorkiomCollectionRecord } | null;
    if (!result?.data) throw new Error('Failed to create collection');
    return mapRecord(result.data);
  }

  async addAsset(collectionId: string, asset: Asset): Promise<Collection> {
    const coll = await this.getById(collectionId);
    if (!coll) throw new Error('Collection not found');
    const newIds = Array.from(new Set([...coll.assetIds, asset.id]));
    const coverImageUrl = coll.coverImageUrl || asset.thumbnailUrl || asset.fileUrl || '';
    const result = (await this.callTool('update_record', {
      listId: this.listId,
      recordId: collectionId,
      updateData: {
        'Asset IDs': JSON.stringify(newIds),
        'Cover Image URL': coverImageUrl,
      },
    })) as { data?: WorkiomCollectionRecord } | null;
    if (!result?.data) throw new Error('Failed to update collection');
    return mapRecord(result.data);
  }

  async removeAsset(collectionId: string, assetId: string): Promise<Collection> {
    const coll = await this.getById(collectionId);
    if (!coll) throw new Error('Collection not found');
    const newIds = coll.assetIds.filter(id => id !== assetId);
    const result = (await this.callTool('update_record', {
      listId: this.listId,
      recordId: collectionId,
      updateData: { 'Asset IDs': JSON.stringify(newIds) },
    })) as { data?: WorkiomCollectionRecord } | null;
    if (!result?.data) throw new Error('Failed to update collection');
    return mapRecord(result.data);
  }

  async setVisibility(collectionId: string, visibility: 'Private' | 'Public'): Promise<void> {
    await this.callTool('update_record', {
      listId: this.listId, recordId: collectionId, updateData: { Visibility: visibility },
    });
  }

  async delete(collectionId: string): Promise<void> {
    await this.callTool('delete_record', { listId: this.listId, recordId: collectionId });
  }
}

export const workiomCollections = new WorkiomCollectionsClient();
