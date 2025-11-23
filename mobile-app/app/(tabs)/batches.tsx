/**
 * ELMS Mobile - Batches List
 * View handler's current batches
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  ScreenContainer,
  ScreenHeader,
  Section,
  ListItem,
  Badge,
  EmptyState,
  SkeletonList,
  ChipGroup,
} from '@/components/ui';
import { useMyBatches } from '@/hooks/useBatch';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'COLLECTED', label: 'Collected' },
  { id: 'TRANSFERRED', label: 'Transferred' },
];

export default function BatchesScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<string[]>(['all']);

  const filter = selectedFilter[0] === 'all' ? undefined : { status: selectedFilter[0] };
  const { data: batches, isLoading, refetch } = useMyBatches(filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COLLECTED':
        return <Badge variant="success" size="sm">Collected</Badge>;
      case 'TRANSFERRED':
        return <Badge variant="info" size="sm">Transferred</Badge>;
      case 'ASSIGNED':
        return <Badge variant="warning" size="sm">Assigned</Badge>;
      case 'GRADING':
        return <Badge variant="default" size="sm">Grading</Badge>;
      default:
        return null;
    }
  };

  return (
    <ScreenContainer scrollable refreshing={isLoading} onRefresh={refetch}>
      <ScreenHeader title="My Batches" variant="large" />

      <Section spacing="md" className="px-4">
        <ChipGroup
          chips={filterOptions}
          selectedIds={selectedFilter}
          onSelect={(id: string) => setSelectedFilter([id])}
          variant="outlined"
          color="primary"
        />
      </Section>

      <Section spacing="lg">
        {isLoading ? (
          <SkeletonList count={5} showAvatar={false} />
        ) : !batches || batches.length === 0 ? (
          <EmptyState
            icon="albums-outline"
            title="No Batches Found"
            description="You don't have any batches at the moment"
          />
        ) : (
          <View className="bg-white">
            {batches.map((batch: any) => (
              <ListItem
                key={batch.id}
                title={batch.batchNumber}
                subtitle={`${batch.courseCode} - ${batch.courseName}`}
                description={`${batch.scriptCount} scripts • Collected ${new Date(batch.collectedAt).toLocaleDateString()}`}
                leftIcon="albums"
                leftIconColor="#2563eb"
                rightElement={getStatusBadge(batch.status)}
                showChevron
                onPress={() => console.log('Navigate to batch', batch.id)}
              />
            ))}
          </View>
        )}
      </Section>
    </ScreenContainer>
  );
}
