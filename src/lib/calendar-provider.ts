/** Server integration contract. No provider is connected in the local-first app. */
export type CalendarProviderId = 'google' | 'microsoft';
export interface ExternalCalendarEvent { provider: CalendarProviderId; externalId: string; calendarId: string; title: string; startsAt: string; endsAt: string; updatedAt: string; }
export interface CalendarConnection { provider: CalendarProviderId; accountId: string; expiresAt: string; scopes: string[]; }
export interface CalendarProvider {
 readonly id: CalendarProviderId;
 getAuthorizationUrl(state: string, codeChallenge: string): Promise<string>;
 exchangeCode(code: string, codeVerifier: string): Promise<CalendarConnection>;
 listEvents(connection: CalendarConnection, from: Date, to: Date): Promise<ExternalCalendarEvent[]>;
 upsertEvent(connection: CalendarConnection, event: ExternalCalendarEvent): Promise<string>;
 deleteEvent(connection: CalendarConnection, externalId: string): Promise<void>;
}
export class CalendarIntegrationUnavailableError extends Error { constructor(){super('External calendar integration is not configured.')} }
