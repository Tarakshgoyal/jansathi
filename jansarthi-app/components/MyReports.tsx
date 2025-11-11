import React, { useEffect, useState } from 'react';
import { ScrollView, RefreshControl, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Box } from '@/components/ui/box';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, Issue } from '@/services/api';
import { Droplet, Zap, Construction, Trash2, MapPin, Calendar } from 'lucide-react-native';

interface MyReportsProps {}

const MyReports: React.FC<MyReportsProps> = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIssues();
  }, []);

  const loadIssues = async () => {
    try {
      setError(null);
      
      if (!isAuthenticated) {
        router.push('/login' as any);
        return;
      }

      const response = await apiService.getMyIssues({
        page: 1,
        page_size: 50,
      });
      
      setIssues(response.items);
    } catch (err) {
      console.error('Failed to load issues:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load issues';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadIssues();
  };

  const handleIssuePress = (issueId: number) => {
    // TODO: Navigate to issue detail screen
    console.log('View issue:', issueId);
  };

  const getIssueIcon = (issueType: string) => {
    switch (issueType) {
      case 'water':
        return <Droplet size={24} color="#3b82f6" />;
      case 'electricity':
        return <Zap size={24} color="#eab308" />;
      case 'road':
        return <Construction size={24} color="#ef4444" />;
      case 'garbage':
        return <Trash2 size={24} color="#22c55e" />;
      default:
        return <MapPin size={24} color="#6b7280" />;
    }
  };

  const getIssueTypeLabel = (issueType: string) => {
    switch (issueType) {
      case 'water':
        return 'Water Issue';
      case 'electricity':
        return 'Electricity Issue';
      case 'road':
        return 'Road Issue';
      case 'garbage':
        return 'Garbage Issue';
      default:
        return issueType;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-background-50">
        <Text className="text-gray-600">Loading your reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background-50"
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      <VStack className="flex-1 p-4" space="md">
        <Heading size="xl" className="text-typography-900 mb-2">
          My Reports
        </Heading>

        {error && (
          <Box className="p-4 bg-red-50 rounded-lg mb-4">
            <Text className="text-red-600">{error}</Text>
          </Box>
        )}

        {issues.length === 0 ? (
          <Box className="p-8 bg-white rounded-lg items-center">
            <MapPin size={48} color="#d1d5db" />
            <Heading size="md" className="text-gray-600 mt-4 mb-2">
              No Reports Yet
            </Heading>
            <Text className="text-gray-500 text-center">
              You haven't submitted any issue reports yet.
            </Text>
          </Box>
        ) : (
          <VStack space="md">
            {issues.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                onPress={() => handleIssuePress(issue.id)}
                activeOpacity={0.7}
              >
                <Box className="bg-white rounded-lg p-4 shadow-sm">
                  <HStack className="items-start justify-between mb-3">
                    <HStack space="md" className="flex-1 items-start">
                      <View className="mt-1">
                        {getIssueIcon(issue.issue_type)}
                      </View>
                      <VStack className="flex-1" space="xs">
                        <Text className="font-semibold text-typography-900 text-base">
                          {getIssueTypeLabel(issue.issue_type)}
                        </Text>
                        <Text className="text-gray-600 text-sm" numberOfLines={2}>
                          {issue.description}
                        </Text>
                      </VStack>
                    </HStack>
                    <Box className={`px-3 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                      <Text className="text-xs font-medium">
                        {getStatusLabel(issue.status)}
                      </Text>
                    </Box>
                  </HStack>

                  <HStack space="lg" className="mt-2">
                    <HStack space="xs" className="items-center">
                      <MapPin size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500">
                        {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                      </Text>
                    </HStack>
                    <HStack space="xs" className="items-center">
                      <Calendar size={14} color="#6b7280" />
                      <Text className="text-xs text-gray-500">
                        {formatDate(issue.created_at)}
                      </Text>
                    </HStack>
                  </HStack>

                  {issue.photos && issue.photos.length > 0 && (
                    <HStack space="xs" className="mt-3">
                      <Text className="text-xs text-gray-500">
                        📷 {issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  )}
                </Box>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </VStack>
    </ScrollView>
  );
};

export default MyReports;
