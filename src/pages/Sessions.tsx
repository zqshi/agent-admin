import { useState } from 'react';
import { Eye } from 'lucide-react';
import { mockSessions } from '../data/mockData';
import { humanEmployees } from '../data/realtimeData';
import { Session } from '../types';
import { PageLayout, PageHeader, PageContent, Card, CardHeader, CardBody, FilterSection } from '../components/ui';

const Sessions = () => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  // Helper function to get user name by user ID
  const getUserName = (userId: string) => {
    const user = humanEmployees.find(emp => emp.id === userId);
    return user ? user.name : userId; // Fallback to ID if name not found
  };

  // 筛选会话
  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         getUserName(session.userId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <PageLayout>
      <PageHeader 
        title="会话查询" 
        subtitle="搜索和查看数字员工会话的详细执行过程"
      />

      <PageContent>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 搜索和筛选 */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <h3 className="card-title">搜索和筛选</h3>
              </CardHeader>
              <CardBody>
                <FilterSection
                  searchProps={{
                    value: searchQuery,
                    onChange: setSearchQuery,
                    placeholder: "搜索Session ID或用户姓名"
                  }}
                  filters={[
                    {
                      key: 'status',
                      placeholder: '所有状态',
                      showIcon: true,
                      value: statusFilter,
                      onChange: (value) => setStatusFilter(value as 'all' | 'success' | 'failed'),
                      options: [
                        { value: 'success', label: '成功', count: mockSessions.filter(s => s.status === 'success').length },
                        { value: 'failed', label: '失败', count: mockSessions.filter(s => s.status === 'failed').length }
                      ],
                      showCount: true,
                      className: 'w-full'
                    }
                  ]}
                  layout="vertical"
                  showCard={false}
                />
              </CardBody>
            </Card>

          <Card>
            <CardHeader>
              <h3 className="card-title">会话列表 ({filteredSessions.length})</h3>
            </CardHeader>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto scrollbar-thin">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-8 cursor-pointer hover:bg-gray-50 transition-all duration-300 hover:shadow-apple-lg ${
                    selectedSession?.id === session.id ? 'bg-primary-50 border-l-4 border-primary-500 shadow-apple' : ''
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{session.id}</span>
                    <span className={`badge ${
                      session.status === 'success' ? 'badge-success' : 'badge-error'
                    }`}>
                      {session.status === 'success' ? '成功' : '失败'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    用户: {getUserName(session.userId)} ({session.userId}) | {session.totalMessages}条消息 | {session.responseTime}s
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          {selectedSession ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="card-title">会话详情</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-500">会话 ID</p>
                      <p className="text-gray-900 font-mono">{selectedSession.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">用户信息</p>
                      <p className="text-gray-900">{getUserName(selectedSession.userId)}</p>
                      <p className="text-xs text-gray-500">ID: {selectedSession.userId}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">消息数</p>
                      <p className="text-gray-900">{selectedSession.totalMessages}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">响应时间</p>
                      <p className="text-gray-900">{selectedSession.responseTime}s</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h4 className="card-title">对话流</h4>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {selectedSession.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-sm lg:max-w-md px-4 py-3 rounded-xl ${
                            message.role === 'user'
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {message.role === 'user' ? '用户' : '数字员工'}
                          </div>
                          <div className="text-sm">{message.content}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card>
              <CardBody className="empty-state">
                <div className="empty-icon">
                  <Eye className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <h3 className="empty-title">选择一个会话开始查看</h3>
                <p className="empty-description">从左侧列表中选择一个会话来查看详细的执行过程和对话内容</p>
              </CardBody>
            </Card>
          )}
        </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Sessions;