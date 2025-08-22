import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { mockSessions } from '../data/mockData';
import { Session } from '../types';

const Sessions = () => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">会话查询与追溯</h1>
        <p className="text-gray-600 mt-2">搜索和查看数字员工会话的详细执行过程</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex items-center mb-4">
              <Search className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="搜索Session ID或用户ID"
                className="flex-1 border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select className="flex-1 border-gray-300 rounded-md shadow-sm">
                <option value="all">所有状态</option>
                <option value="success">成功</option>
                <option value="failed">失败</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">会话列表 ({mockSessions.length})</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {mockSessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSession?.id === session.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{session.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {session.status === 'success' ? '成功' : '失败'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    用户: {session.userId} | {session.totalMessages}条消息 | {session.responseTime}s
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedSession ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">会话详情</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">会话 ID</p>
                    <p className="text-gray-900 font-mono">{selectedSession.id}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-500">用户 ID</p>
                    <p className="text-gray-900">{selectedSession.userId}</p>
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
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">对话流</h4>
                <div className="space-y-4">
                  {selectedSession.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
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
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">请从左侧列表中选择一个会话来查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;