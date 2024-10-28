import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLimitPerMetadataItem } from '@/object-record/relation-picker/hooks/useLimitPerMetadataItem';
import { RelationPickerScopeInternalContext } from '@/object-record/relation-picker/scopes/scope-internal-context/RelationPickerScopeInternalContext';

const scopeId = 'scopeId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RelationPickerScopeInternalContext.Provider value={{ scopeId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </RelationPickerScopeInternalContext.Provider>
);

describe('useLimitPerMetadataItem', () => {
  const objectData: ObjectMetadataItem[] = [
    {
      createdAt: 'createdAt',
      id: 'id',
      isActive: true,
      isCustom: true,
      isSystem: true,
      isRemote: false,
      labelPlural: 'labelPlural',
      labelSingular: 'labelSingular',
      namePlural: 'namePlural',
      nameSingular: 'nameSingular',
      updatedAt: 'updatedAt',
      isLabelSyncedWithName: false,
      fields: [],
      indexMetadatas: [],
    },
  ];

  it('should return object with nameSingular and default limit', async () => {
    const { result } = renderHook(
      () => useLimitPerMetadataItem({ objectMetadataItems: objectData }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.limitPerMetadataItem).toStrictEqual({
      limitNameSingular: 60,
    });
  });

  it('should return an object with nameSingular and specified limit', async () => {
    const { result } = renderHook(
      () =>
        useLimitPerMetadataItem({ objectMetadataItems: objectData, limit: 30 }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.limitPerMetadataItem).toStrictEqual({
      limitNameSingular: 30,
    });
  });
});
