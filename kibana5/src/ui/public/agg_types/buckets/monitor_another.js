import AggTypesBucketsBucketAggTypeProvider from 'ui/agg_types/buckets/_bucket_agg_type';
export default function MonitorAnotherAggDefinition(Private, Notifier) {
  let BucketAggType = Private(AggTypesBucketsBucketAggTypeProvider);

  return new BucketAggType({
    name: 'monitor_another',
    title: 'monitor_another',
    customLabels: false,
  });
};
