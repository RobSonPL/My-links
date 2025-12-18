
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
  THIS_WEEK = 'this_week'
}

export interface Todo {
  id: string;
  text: string;
  category: TodoCategory;
  completed: boolean;
  remindMe?: boolean;
  reminderTime?: string; // Format HH:mm
  createdAt: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string YYYY-MM-DD
  time: string;
  person: string;
  link: string;
  phone: string;
  location?: string;
  description?: string;
  remindMe?: boolean;
  reminderMinutes?: number;
  soundUrl?: string;
  isExternal?: boolean; // Flaga dla zsynchronizowanych wydarzeń
}
