import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined, useIcons } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { useLastVisitedView } from '@/navigation/hooks/useLastVisitedView';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { getNavigationSubItemState } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemState';
import { View } from '@/views/types/View';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';

const ORDERED_STANDARD_OBJECTS = [
  'person',
  'company',
  'opportunity',
  'task',
  'note',
];

export const NavigationDrawerSectionForObjectMetadataItems = ({
  isRemote,
}: {
  isRemote: boolean;
}) => {
  const currentUser = useRecoilValue(currentUserState);

  const { toggleNavigationSection, isNavigationSectionOpenState } =
    useNavigationSection('Objects' + (isRemote ? 'Remote' : 'Workspace'));
  const isNavigationSectionOpen = useRecoilValue(isNavigationSectionOpenState);

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => (isRemote ? item.isRemote : !item.isRemote),
  );
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const loading = useIsPrefetchLoading();

  const { getLastVisitedViewIdFromObjectMetadataItemId } = useLastVisitedView();

  if (loading && isDefined(currentUser)) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  // TODO: refactor this by splitting into separate components
  return (
    filteredActiveObjectMetadataItems.length > 0 && (
      <NavigationDrawerSection>
        <NavigationDrawerSectionTitle
          label={isRemote ? 'Remote' : 'Workspace'}
          onClick={() => toggleNavigationSection()}
        />

        {isNavigationSectionOpen &&
          [
            ...filteredActiveObjectMetadataItems
              .filter((item) =>
                ORDERED_STANDARD_OBJECTS.includes(item.nameSingular),
              )
              .sort((objectMetadataItemA, objectMetadataItemB) => {
                const indexA = ORDERED_STANDARD_OBJECTS.indexOf(
                  objectMetadataItemA.nameSingular,
                );
                const indexB = ORDERED_STANDARD_OBJECTS.indexOf(
                  objectMetadataItemB.nameSingular,
                );
                if (indexA === -1 || indexB === -1) {
                  return objectMetadataItemA.nameSingular.localeCompare(
                    objectMetadataItemB.nameSingular,
                  );
                }
                return indexA - indexB;
              }),
            ...filteredActiveObjectMetadataItems
              .filter(
                (item) => !ORDERED_STANDARD_OBJECTS.includes(item.nameSingular),
              )
              .sort((objectMetadataItemA, objectMetadataItemB) => {
                return new Date(objectMetadataItemA.createdAt) <
                  new Date(objectMetadataItemB.createdAt)
                  ? 1
                  : -1;
              }),
          ].map((objectMetadataItem) => {
            const objectMetadataViews = getObjectMetadataItemViews(
              objectMetadataItem.id,
              views,
            );
            const lastVisitedViewId =
              getLastVisitedViewIdFromObjectMetadataItemId(
                objectMetadataItem.id,
              );
            const viewId = lastVisitedViewId ?? objectMetadataViews[0]?.id;

            const navigationPath = `/objects/${objectMetadataItem.namePlural}${
              viewId ? `?view=${viewId}` : ''
            }`;

            const shouldSubItemsBeDisplayed =
              currentPath === `/objects/${objectMetadataItem.namePlural}` &&
              objectMetadataViews.length > 1;

            const sortedObjectMetadataViews = [...objectMetadataViews].sort(
              (viewA, viewB) =>
                viewA.key === 'INDEX' ? -1 : viewA.position - viewB.position,
            );

            const selectedSubItemIndex = sortedObjectMetadataViews.findIndex(
              (view) => viewId === view.id,
            );

            const subItemArrayLength = sortedObjectMetadataViews.length;

            return (
              <div key={objectMetadataItem.id}>
                <NavigationDrawerItem
                  key={objectMetadataItem.id}
                  label={objectMetadataItem.labelPlural}
                  to={navigationPath}
                  Icon={getIcon(objectMetadataItem.icon)}
                  active={
                    currentPath === `/objects/${objectMetadataItem.namePlural}`
                  }
                />
                {shouldSubItemsBeDisplayed &&
                  sortedObjectMetadataViews.map((view, index) => (
                    <NavigationDrawerSubItem
                      label={view.name}
                      to={`/objects/${objectMetadataItem.namePlural}?view=${view.id}`}
                      active={viewId === view.id}
                      subItemState={getNavigationSubItemState({
                        index,
                        arrayLength: subItemArrayLength,
                        selectedIndex: selectedSubItemIndex,
                      })}
                      Icon={getIcon(view.icon)}
                      key={view.id}
                    />
                  ))}
              </div>
            );
          })}
      </NavigationDrawerSection>
    )
  );
};