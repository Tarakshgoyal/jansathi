import BackHeader from '@/components/BackHeader';
import ReportDetail from '@/components/ReportDetail';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const issueId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id as string);

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <SafeAreaView style={{ flex: 1 }} className="bg-background-50">
        <BackHeader title="Report Details" />
        <ReportDetail issueId={issueId} />
      </SafeAreaView>
    </>
  );
}
