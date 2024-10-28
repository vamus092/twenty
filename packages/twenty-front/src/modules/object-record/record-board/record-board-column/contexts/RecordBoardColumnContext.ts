import { createContext } from 'react';

import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';

type RecordBoardColumnContextProps = {
  columnDefinition: RecordGroupDefinition;
  recordCount: number;
  columnId: string;
  recordIds: string[];
};

export const RecordBoardColumnContext =
  createContext<RecordBoardColumnContextProps>(
    {} as RecordBoardColumnContextProps,
  );
