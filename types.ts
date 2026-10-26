interface RichBlockTableCell {
  text: string;
  is_header: boolean;
}

interface RichBlockTable {
  type: string;
  cells: RichBlockTableCell[][];
  caption: string;
}

interface RichMessage {
  blocks: any[];
}

interface JournalCreds {
  username: string;
  password: string;
  cityId?: null;
}

interface JournalUserInfo {
  user: {
    fullName: string;
    currentGroupId: number;
  };
}

interface JournalDaySchedule {
  subjectFallback: string,
  teacher: string,
  room: string,
  startTime: string,
  endTime: string,
  lesson: number
}

interface JournalScheduleArray {
  items: JournalDaySchedule[]
}

export type {
  RichBlockTableCell,
  RichBlockTable,
  RichMessage,
  JournalCreds,
  JournalUserInfo,
  JournalDaySchedule,
  JournalScheduleArray
};