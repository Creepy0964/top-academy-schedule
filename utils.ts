import { readFile, writeFile } from 'fs/promises';
import type { JournalCreds, JournalScheduleArray, JournalUserInfo } from "./types.ts";

class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
  }
}

let accessToken = '';

async function updateLogin(creds: JournalCreds, loginUrl: string): Promise<void> {
  try {
    const file = await readFile('access_token', 'utf-8');
    const [token, age] = file.split(', ');
    
    if (parseInt(age) < Date.now() / 1000) {
      await login(creds, loginUrl);
    } else {
      accessToken = token;
    }
  } catch {
    await login(creds, loginUrl);
  }
}

async function login(creds: JournalCreds, loginUrl: string): Promise<void> {
  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds),
    redirect: 'manual',
  });

  const setCookieHeaders = response.headers.getSetCookie();
  
  for (const cookie of setCookieHeaders) {
    const match = cookie.match(/journal_access_token=([^;]+).*max-age=(\d+)/i);
    if (match) {
      accessToken = match[1];
      const expiry = Date.now() / 1000 + parseInt(match[2]);
      await writeFile('access_token', `${accessToken}, ${expiry}`);
      break;
    }
  }
}

async function testConnection(): Promise<JournalUserInfo> {
  const response = await fetch('https://journalka.top-academy.ru/api/dashboard/user-info', {
    headers: { 'Cookie': `journal_access_token=${accessToken}` },
  });

  if (response.status === 401) {
    throw new UnauthorizedError();
  }

  return await response.json();
}

async function getDaySchedule(date: string): Promise<JournalScheduleArray> {
  const response = await fetch(`https://journalka.top-academy.ru/api/dashboard/schedule?scope=day&date=${date}`, {
    headers: { 'Cookie': `journal_access_token=${accessToken}` },
  });

  return await response.json();
}

export { updateLogin, testConnection, getDaySchedule, UnauthorizedError };