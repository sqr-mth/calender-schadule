import 'server-only';
/** Backend contracts only. No authentication or remote persistence is active. */
export interface Principal { userId: string; sessionId: string; workspaceIds: string[]; }
export interface AuthService { register(email: string, password: string): Promise<Principal>; signIn(email: string, password: string): Promise<Principal>; verifySession(token: string): Promise<Principal | null>; revokeSession(sessionId: string): Promise<void>; }
export interface Repository<T> { list(principal: Principal, workspaceId: string): Promise<T[]>; get(principal: Principal, workspaceId: string, id: string): Promise<T | null>; create(principal: Principal, workspaceId: string, data: unknown): Promise<T>; update(principal: Principal, workspaceId: string, id: string, data: unknown): Promise<T>; delete(principal: Principal, workspaceId: string, id: string): Promise<void>; }
export function assertWorkspaceAccess(principal: Principal, workspaceId: string): void { if (!principal.workspaceIds.includes(workspaceId)) throw new Error('Forbidden'); }
