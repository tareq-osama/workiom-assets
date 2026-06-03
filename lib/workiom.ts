import type { Asset, AssetCategory, AssetStatus } from '@/types/asset';

interface WorkiomRecord {
  _id: string;
  Name?: string;
  Description?: string;
  Category?: { id: string; label: string; order: number; color: string } | string;
  Tags?: string;
  'File URL'?: string;
  'Thumbnail URL'?: string;
  Status?: { id: string; label: string; order: number; color: string } | string;
  Owner?: string;
  'File Type'?: string;
  'File Size'?: number;
  'Download Count'?: number;
  'Deprecation Reason'?: string;
  [key: string]: unknown;
}

interface GetAssetsOptions {
  search?: string;
  category?: string;
  status?: string;
  fileType?: string;
  page?: number;
  limit?: number;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
}

interface GetAssetsResult {
  assets: Asset[];
  totalCount: number;
}

const DEMO_ASSET_THUMBNAILS: Record<string, { thumbnailUrl: string; fileType: string; category: string; fileSize: number }> = {
  'Workiom Light Logo': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/60dece8aa1eb0f13d2b395f8_Light_logo.png', fileType: 'PNG', category: 'Logos', fileSize: 48950 },
  'Workiom Web Icon': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/634f3bf1d68efed32c86cdd8_Web%20Icon.svg', fileType: 'SVG', category: 'Logos', fileSize: 1287 },
  'Workiom CRM Marketing Illustration': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/63b1a1385808d309c94c7dce_workiom-crm-marketing-management-slider-1.svg', fileType: 'SVG', category: 'Icons & Illustrations', fileSize: 137554 },
  'Calendar View Screenshot': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65e04c446b8702a2883b9ef1_calendar-view.webp', fileType: 'WEBP', category: 'Photography', fileSize: 86076 },
  'List View Screenshot': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65e04c4437f1df728160d57d_list-view.webp', fileType: 'WEBP', category: 'Photography', fileSize: 87746 },
  'Automation Feature': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65df4a8f1c10897f0205e21f_automation.webp', fileType: 'WEBP', category: 'Campaign Materials', fileSize: 24712 },
  'Reports Feature': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65df4a9050a2326e34ffdc85_reports.webp', fileType: 'WEBP', category: 'Campaign Materials', fileSize: 31522 },
  'Kanban Feature': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65df4b918891135c8ea75790_kanban.webp', fileType: 'WEBP', category: 'Campaign Materials', fileSize: 33150 },
  'Forms Feature': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65df4a8f9b749b0abb624e45_forms.webp', fileType: 'WEBP', category: 'Campaign Materials', fileSize: 16146 },
  'Permissions Feature': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0fa6ceb39450/65df4a90a6d215bcb81ad7a6_permissions.webp', fileType: 'WEBP', category: 'Brand Guidelines', fileSize: 29198 },
  'Unifonic Partner Logo': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0f7ab7b3947a/687f2f3b2a6999b48bb23723_Unifonic-logo.png', fileType: 'PNG', category: 'Logos', fileSize: 17413 },
  'Electrip Partner Logo': { thumbnailUrl: 'https://cdn.prod.website-files.com/60dece8aa1eb0f7ab7b3947a/65eabdfe68ff38e2d77033ac_Electrip_logo.png', fileType: 'PNG', category: 'Logos', fileSize: 35858 },
};

function mapWorkiomRecord(record: WorkiomRecord): Asset {
  const getLabel = (field: unknown): string => {
    if (!field) return '';
    if (typeof field === 'object' && field !== null && 'label' in field) {
      return (field as { label: string }).label;
    }
    return String(field);
  };

  const tagsRaw = record['Tags'] ?? '';
  const tags = typeof tagsRaw === 'string' && tagsRaw.trim()
    ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  const name = record['Name'] ?? '';

  const base: Asset = {
    id: record._id,
    name,
    description: record['Description'] ? String(record['Description']) : undefined,
    category: (getLabel(record['Category']) as AssetCategory) || 'Documents',
    tags,
    fileUrl: record['File URL'] ? String(record['File URL']) : '',
    thumbnailUrl: record['Thumbnail URL'] ? String(record['Thumbnail URL']) : undefined,
    status: (getLabel(record['Status']) as AssetStatus) || 'Draft',
    owner: record['Owner'] ? String(record['Owner']) : '',
    fileType: record['File Type'] ? String(record['File Type']) : '',
    fileSize: typeof record['File Size'] === 'number' ? record['File Size'] : 0,
    downloadCount: typeof record['Download Count'] === 'number' ? record['Download Count'] : 0,
    deprecationReason: record['Deprecation Reason'] ? String(record['Deprecation Reason']) : undefined,
  };

  // Merge demo asset metadata if available
  const demo = DEMO_ASSET_THUMBNAILS[name];
  if (demo) {
    if (!base.thumbnailUrl) base.thumbnailUrl = demo.thumbnailUrl;
    if (!base.fileType) base.fileType = demo.fileType;
    if (!base.category || base.category === 'Documents') base.category = demo.category as AssetCategory;
    if (base.fileSize === 0) base.fileSize = demo.fileSize;
  }

  return base;
}

function parseSSEResponse(text: string): unknown {
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('data:')) {
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed?.result?.content?.[0]?.text) {
          return JSON.parse(parsed.result.content[0].text);
        }
        if (parsed?.result) return parsed.result;
        if (parsed?.error) throw new Error(parsed.error.message ?? 'Workiom API error');
      } catch (e) {
        if (e instanceof SyntaxError) continue;
        throw e;
      }
    }
  }
  return null;
}

class WorkiomClient {
  private baseUrl = 'https://mcp.workiom.com/mcp';
  private apiKey: string;
  private listId: string;

  constructor() {
    this.apiKey = process.env.WORKIOM_API_KEY ?? '';
    this.listId = process.env.WORKIOM_LIST_ID ?? '';
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
    });

    const sessionId = res.headers.get('mcp-session-id');
    if (!sessionId) throw new Error('No session ID returned from Workiom MCP');
    return sessionId;
  }

  private async callTool(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const sessionId = await this.getSessionId();

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
    });

    const text = await res.text();
    return parseSSEResponse(text);
  }

  async getAssets(options: GetAssetsOptions = {}): Promise<GetAssetsResult> {
    const { search, category, status, fileType, page = 1, limit = 24, sort } = options;
    const offset = (page - 1) * limit;

    const filters: Array<{ field: string; operator: string; value: unknown }> = [];
    if (category) filters.push({ field: 'Category', operator: 'eq', value: category });
    if (status) filters.push({ field: 'Status', operator: 'eq', value: status });
    if (fileType) filters.push({ field: 'File Type', operator: 'eq', value: fileType });

    const args: Record<string, unknown> = {
      listId: this.listId,
      limit,
      offset,
    };
    if (search) args.search = search;
    if (filters.length > 0) args.filters = filters;
    if (sort) args.sort = sort;

    const result = (await this.callTool('get_records', args)) as {
      success?: boolean;
      data?: { totalCount?: number; items?: WorkiomRecord[] };
    } | null;

    if (!result || !result.data) return { assets: [], totalCount: 0 };

    const items = result.data.items ?? [];
    return {
      assets: items.map(mapWorkiomRecord),
      totalCount: result.data.totalCount ?? items.length,
    };
  }

  async getAsset(id: string): Promise<Asset | null> {
    const args: Record<string, unknown> = {
      listId: this.listId,
      limit: 1,
      offset: 0,
      filters: [{ field: '_id', operator: 'eq', value: id }],
    };

    const result = (await this.callTool('get_records', args)) as {
      success?: boolean;
      data?: { items?: WorkiomRecord[] };
    } | null;

    if (!result?.data?.items?.length) return null;
    return mapWorkiomRecord(result.data.items[0]);
  }

  async createAsset(data: Partial<Record<string, unknown>>): Promise<Asset | null> {
    const result = (await this.callTool('create_record', {
      listId: this.listId,
      recordData: data,
    })) as { success?: boolean; data?: WorkiomRecord } | null;

    if (!result?.data) return null;
    return mapWorkiomRecord(result.data);
  }

  async updateAsset(id: string, data: Partial<Record<string, unknown>>): Promise<Asset | null> {
    const result = (await this.callTool('update_record', {
      listId: this.listId,
      recordId: id,
      updateData: data,
    })) as { success?: boolean; data?: WorkiomRecord } | null;

    if (!result?.data) return null;
    return mapWorkiomRecord(result.data);
  }

  async deleteAsset(id: string): Promise<boolean> {
    const result = (await this.callTool('delete_record', {
      listId: this.listId,
      recordId: id,
    })) as { success?: boolean } | null;

    return result?.success === true;
  }

  async requestUploadUrl(
    fileName: string,
    contentType: string,
    fileSize: number
  ): Promise<{ uploadUrl: string; fileToken: string }> {
    const result = (await this.callTool('request_upload_url', {
      fileName,
      contentType,
      fileSize,
    })) as { uploadUrl?: string; fileToken?: string; url?: string } | null;

    if (!result) throw new Error('Failed to get upload URL');
    return {
      uploadUrl: result.uploadUrl ?? result.url ?? '',
      fileToken: result.fileToken ?? '',
    };
  }

  async confirmUpload(fileToken: string): Promise<{ url: string; fileToken: string }> {
    const result = (await this.callTool('confirm_upload', { fileToken })) as {
      url?: string;
      fileToken?: string;
    } | null;

    if (!result) throw new Error('Failed to confirm upload');
    return {
      url: result.url ?? '',
      fileToken: result.fileToken ?? fileToken,
    };
  }
}

export const workiomClient = new WorkiomClient();

export const getAssets = (options?: GetAssetsOptions) => workiomClient.getAssets(options);
export const getAsset = (id: string) => workiomClient.getAsset(id);
export const createAsset = (data: Partial<Record<string, unknown>>) =>
  workiomClient.createAsset(data);
export const updateAsset = (id: string, data: Partial<Record<string, unknown>>) =>
  workiomClient.updateAsset(id, data);
export const deleteAsset = (id: string) => workiomClient.deleteAsset(id);
export const requestUploadUrl = (fileName: string, contentType: string, fileSize: number) =>
  workiomClient.requestUploadUrl(fileName, contentType, fileSize);
export const confirmUpload = (fileToken: string) => workiomClient.confirmUpload(fileToken);
