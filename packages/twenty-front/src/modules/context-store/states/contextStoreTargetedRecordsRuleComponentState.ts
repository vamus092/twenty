import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { Filter } from '@/object-record/object-filter-dropdown/types/Filter';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

type ContextStoreTargetedRecordsRuleSelectionMode = {
  mode: 'selection';
  selectedRecordIds: string[];
};

type ContextStoreTargetedRecordsRuleExclusionMode = {
  mode: 'exclusion';
  excludedRecordIds: string[];
  filters: Filter[];
};

export type ContextStoreTargetedRecordsRule =
  | ContextStoreTargetedRecordsRuleSelectionMode
  | ContextStoreTargetedRecordsRuleExclusionMode;

export const contextStoreTargetedRecordsRuleComponentState =
  createComponentStateV2<ContextStoreTargetedRecordsRule>({
    key: 'contextStoreTargetedRecordsRuleComponentState',
    defaultValue: {
      mode: 'selection',
      selectedRecordIds: [],
    },
    componentInstanceContext: ContextStoreComponentInstanceContext,
  });
