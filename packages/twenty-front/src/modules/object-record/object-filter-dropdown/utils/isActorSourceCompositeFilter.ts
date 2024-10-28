import { FilterDefinition } from '@/object-record/object-filter-dropdown/types/FilterDefinition';
import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';

export const isActorSourceCompositeFilter = (
  filterDefinition: Pick<FilterDefinition, 'compositeFieldName'>,
) => {
  return (
    filterDefinition.compositeFieldName ===
    ('source' satisfies keyof FieldActorValue)
  );
};
