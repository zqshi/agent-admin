import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MoreHorizontal,
  User,
  Settings,
  Trash2,
  Play,
  Pause,
  Clock,
  Building2,
  Brain
} from 'lucide-react';
import { DigitalEmployeeManagement } from '../types';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';
import { PageLayout, PageHeader, PageContent, MetricCard, Card, CardHeader, CardBody, Button, FilterSection } from '../components/ui';
import CreateDigitalEmployee from '../components/CreateDigitalEmployee';

const DigitalEmployees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<DigitalEmployeeManagement[]>(mockDigitalEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled' | 'retired'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const departments = Array.from(new Set(employees.map(emp => emp.department)));

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'badge-success',
      disabled: 'badge-warning', 
      retired: 'badge-gray'
    };
    const labels = {
      active: '启用',
      disabled: '禁用',
      retired: '停用'
    };
    return (
      <span className={`badge ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id 
        ? { ...emp, status: currentStatus === 'active' ? 'disabled' : 'active' as any }
        : emp
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个数字员工吗？此操作不可撤销。')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  const handleViewDetail = (employee: DigitalEmployeeManagement) => {
    navigate(`/digital-employees/${employee.id}`);
  };

  const handleCreateEmployee = (newEmployee: DigitalEmployeeManagement) => {
    setEmployees(prev => [newEmployee, ...prev]);
    setShowCreateForm(false);
  };

  return (
    <PageLayout>
      <PageHeader 
        title="员工管理" 
        subtitle="管理和配置您的数字员工团队"
      >
        <Button 
          onClick={() => setShowCreateForm(true)}
          variant="primary"
        >
          <Plus className="h-4 w-4" />
          添加数字员工
        </Button>
      </PageHeader>

      <PageContent>
        {/* 搜索和筛选 */}
        <FilterSection
          searchProps={{
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "搜索数字员工姓名或编号..."
          }}
          filters={[
            {
              key: 'status',
              placeholder: '全部状态',
              showIcon: true,
              value: statusFilter,
              onChange: (value) => setStatusFilter(value as any),
              options: [
                { value: 'active', label: '启用', count: employees.filter(e => e.status === 'active').length },
                { value: 'disabled', label: '禁用', count: employees.filter(e => e.status === 'disabled').length },
                { value: 'retired', label: '停用', count: employees.filter(e => e.status === 'retired').length }
              ],
              showCount: true
            },
            {
              key: 'department',
              placeholder: '全部部门',
              value: departmentFilter,
              onChange: setDepartmentFilter,
              options: departments.map(dept => ({
                value: dept,
                label: dept,
                count: employees.filter(e => e.department === dept).length
              })),
              showCount: true
            }
          ]}
        />

        {/* 统计指标 */}
        <div className="grid-responsive">
          <MetricCard
            title="总数字员工"
            value={employees.length}
            icon={User}
            color="blue"
          />
          
          <MetricCard
            title="运行中"
            value={employees.filter(e => e.status === 'active').length}
            icon={Play}
            color="green"
          />
          
          <MetricCard
            title="已禁用"
            value={employees.filter(e => e.status === 'disabled').length}
            icon={Pause}
            color="yellow"
          />
          
          <MetricCard
            title="活跃部门"
            value={departments.length}
            icon={Building2}
            color="purple"
          />
        </div>

        {/* 数字员工列表 */}
        <Card>
          <CardHeader>
            <h2 className="card-title">数字员工列表</h2>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">
                    数字员工
                  </th>
                  <th className="table-header-cell">
                    部门
                  </th>
                  <th className="table-header-cell">
                    状态
                  </th>
                  <th className="table-header-cell">
                    会话统计
                  </th>
                  <th className="table-header-cell">
                    最近活跃
                  </th>
                  <th className="table-header-cell">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          {employee.avatar ? (
                            <img src={employee.avatar} alt={employee.name} className="h-10 w-10 rounded-xl" />
                          ) : (
                            <Brain className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900" style={{fontWeight: 500, letterSpacing: '-0.005em'}}>{employee.name}</div>
                          <div className="text-sm text-gray-500">#{employee.employeeNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(employee.status)}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        总计: {employee.metrics.totalSessions}
                      </div>
                      <div className="text-sm text-gray-500">
                        成功率: {(employee.metrics.successfulSessions / employee.metrics.totalSessions * 100).toFixed(1)}%
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {employee.lastActiveAt ? 
                          new Date(employee.lastActiveAt).toLocaleDateString() : 
                          '从未活跃'
                        }
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(employee.id, employee.status)}
                          className={
                            employee.status === 'active' 
                              ? 'text-warning-600 hover:text-warning-700 hover:bg-warning-50' 
                              : 'text-success-600 hover:text-success-700 hover:bg-success-50'
                          }
                          title={employee.status === 'active' ? '禁用' : '启用'}
                        >
                          {employee.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(employee)}
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                          title="查看详情"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(employee.id)}
                          className="text-error-600 hover:text-error-700 hover:bg-error-50"
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                          title="更多操作"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
              
              {filteredEmployees.length === 0 && (
                <div className="empty-state">
                  <Brain className="empty-icon" />
                  <h3 className="empty-title">暂无数字员工</h3>
                  <p className="empty-description">
                    {searchQuery || statusFilter !== 'all' || departmentFilter !== 'all' 
                      ? '没有符合条件的数字员工' 
                      : '开始创建您的第一个数字员工'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* 创建表单弹窗 */}
        {showCreateForm && (
          <CreateDigitalEmployee
            onClose={() => setShowCreateForm(false)}
            onSave={handleCreateEmployee}
          />
        )}
      </PageContent>
    </PageLayout>
  );
};

export default DigitalEmployees;