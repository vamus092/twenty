import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';

export const NavigationDrawerSectionForObjectMetadataItemsWrapper = ({
  isRemote,
}: {
  isRemote: boolean;
}) => {
  const currentUser = useRecoilValue(currentUserState);

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => (isRemote ? item.isRemote : !item.isRemote),
  );
  const loading = useIsPrefetchLoading();

  if (loading && isDefined(currentUser)) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={isRemote ? 'Remote' : 'Workspace'}
      objectMetadataItems={filteredActiveObjectMetadataItems}
      isRemote={isRemote}
    />
  );
};
