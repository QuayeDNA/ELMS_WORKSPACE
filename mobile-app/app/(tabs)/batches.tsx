import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Link } from 'expo-router';
import {
  ScreenContainer,
  Section,
  ListItem,
  EmptyState,
  SkeletonList,
  Typography,
  Badge,
} from '@/components/ui';
import { useMyBatches } from '@/services/queries';
import { BatchScript } from '@/types';

export default function BatchesScreen() {
  const { data: batchesResponse, isLoading, refetch, isRefetching } = useMyBatches();

  const batches = batchesResponse?.data || [];

  const getStatusColor = (status: BatchScript['status']) => {
    switch (status) {
      case 'collected':
        return 'success';
      case 'transferred':
        return 'warning';
      case 'assigned':
        return 'info';
      case 'generated':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <ScreenContainer edges={['bottom', 'left', 'right']}>
        <Section title="My Batches" spacing="lg">
          <SkeletonList count={3} />
        </Section>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      scrollable
      refreshing={isRefetching}
      onRefresh={refetch}
      edges={['bottom', 'left', 'right']}
    >
      <Section title="My Batches" spacing="lg">
        <Typography variant="bodyMedium" color="secondary">
          Script batches currently in your possession
        </Typography>
      </Section>

      {batches.length === 0 ? (
        <EmptyState
          icon="archive"
          title="No Batches"
          description="You don't have any script batches assigned at the moment."
          action={
            <Typography variant="bodyMedium" color="secondary">
              Batches will appear here when you collect scripts from exam sessions.
            </Typography>
          }
        />
      ) : (
        <Section spacing="lg">
          {batches.map((batch) => (
            <Link
              key={batch.id}
              href={`/batch-details?batchId=${batch.id}`}
              asChild
            >
              <ListItem
                title={`Batch ${batch.batchNumber}`}
                subtitle={`${batch.course.code} • ${batch.venue.name} • ${batch.scriptCount} scripts`}
                description={
                  batch.collectedAt
                    ? `Collected ${formatDate(batch.collectedAt)}`
                    : 'Not yet collected'
                }
                leftIcon="archive"
                leftIconColor="#2563eb"
                rightElement={
                  <Badge variant={getStatusColor(batch.status)} size="sm">
                    {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                  </Badge>
                }
                showChevron
              />
            </Link>
          ))}
        </Section>
      )}

      {batches.length > 0 && (
        <Section title="Actions" spacing="lg">
          <View style={{ gap: 12 }}>
            <Link href="/transfer-batch" asChild>
              <Typography
                variant="bodyMedium"
                color="primary"
                style={{ textDecorationLine: 'underline' }}
              >
                Transfer a batch to another handler
              </Typography>
            </Link>
          </View>
        </Section>
      )}
    </ScreenContainer>
  );
}
