
export type BookmarkCategory = 'e-book' | 'Video' | 'Foto' | 'www' | 'Zdrowie' | 'Edukacja AI';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: BookmarkCategory;
  clickCount: number;
}

export enum TodoCategory {
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  AFTER_TOMORROW = 'after_tomorrow',
  THIS_WEEK = 'this_week'
}

export interface Todo {
  id: string;
  text: string;
  category: TodoCategory;
  completed: boolean;
  isArchived?: boolean;
  remindMe?: boolean;
  reminderTime?: string;
  createdAt: number;
}

export interface GoogleSession {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  person: string;
  link: string;
  phone: string;
  location?: string;
  description?: string;
  remindMe?: boolean;
  reminderMinutes?: number;
  soundUrl?: string;
  isExternal?: boolean;
}
