'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Box } from 'lucide-react';

export default function StatsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        totalFrags: number;
        totalMembers: number;
        dbtcFrags: number;
        pifFrags: number;
        privateFrags: number;
        aliveFrags: number;
        topTypes: Array<{ type: string; count: number }>;
      }>('/public/stats');
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Statistics</h1>
          </div>
          <p className="text-xl text-indigo-100">
            Community insights and trends
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Corals</CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalFrags || 0}</div>
              <p className="text-xs text-muted-foreground">
                {data?.aliveFrags || 0} alive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.totalMembers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active participants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DBTC Corals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.dbtcFrags || 0}</div>
              <p className="text-xs text-muted-foreground">
                Don't Break The Chain
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PIF Corals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.pifFrags || 0}</div>
              <p className="text-xs text-muted-foreground">
                Pay It Forward
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top 10 Types */}
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Coral Types</CardTitle>
            <CardDescription>
              The most common corals in our community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topTypes?.map((item, index) => (
                <div key={item.type} className="flex items-center">
                  <div className="w-8 text-center font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{item.type}</span>
                      <span className="text-sm text-muted-foreground">{item.count} corals</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                        style={{
                          width: `${(item.count / (data.topTypes[0]?.count || 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
