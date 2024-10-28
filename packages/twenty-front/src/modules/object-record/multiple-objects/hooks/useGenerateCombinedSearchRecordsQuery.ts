import { gql } from '@apollo/client';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { getSearchRecordsQueryResponseField } from '@/object-record/utils/getSearchRecordsQueryResponseField';
import { isObjectMetadataItemSearchable } from '@/object-record/utils/isObjectMetadataItemSearchable';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateCombinedSearchRecordsQuery = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (!isNonEmptyArray(operationSignatures)) {
    return null;
  }

  const filterPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$filter${capitalize(objectNameSingular)}: ${capitalize(
          objectNameSingular,
        )}FilterInput`,
    )
    .join(', ');

  const limitPerMetadataItemArray = operationSignatures
    .map(
      ({ objectNameSingular }) =>
        `$limit${capitalize(objectNameSingular)}: Int`,
    )
    .join(', ');

  const queryKeyWithObjectMetadataItemArray = operationSignatures.map(
    (queryKey) => {
      const objectMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular === queryKey.objectNameSingular,
      );

      if (isUndefined(objectMetadataItem)) {
        throw new Error(
          `Object metadata item not found for object name singular: ${queryKey.objectNameSingular}`,
        );
      }

      return { ...queryKey, objectMetadataItem };
    },
  );

  const filteredQueryKeyWithObjectMetadataItemArray =
    queryKeyWithObjectMetadataItemArray.filter(({ objectMetadataItem }) =>
      isObjectMetadataItemSearchable(objectMetadataItem),
    );

  return gql`
    query CombinedSearchRecords(
      ${filterPerMetadataItemArray}, 
      ${limitPerMetadataItemArray},
      $search: String,
    ) {
      ${filteredQueryKeyWithObjectMetadataItemArray
        .map(
          ({ objectMetadataItem, fields }) =>
            `${getSearchRecordsQueryResponseField(objectMetadataItem.namePlural)}(filter: $filter${capitalize(
              objectMetadataItem.nameSingular,
            )},
              limit: $limit${capitalize(objectMetadataItem.nameSingular)},
              searchInput: $search
            ){
          edges {
            node ${mapObjectMetadataToGraphQLQuery({
              objectMetadataItems: objectMetadataItems,
              objectMetadataItem,
              recordGqlFields:
                fields ??
                generateDepthOneRecordGqlFields({
                  objectMetadataItem,
                }),
            })}
            cursor
          }
          totalCount
        }`,
        )
        .join('\n')}
    }
  `;
};
