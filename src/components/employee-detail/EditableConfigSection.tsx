/**
 * 可编辑配置区域包装器
 * 为各配置项提供统一的编辑状态管理
 */

import React, { useState, ReactNode } from 'react';
import { Edit3, Save, X, AlertCircle } from 'lucide-react';

interface EditableConfigSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: (isEditing: boolean, onSave: (data: any) => void) => ReactNode;
  onSave?: (data: any) => Promise<void> | void;
  rightActions?: ReactNode;
  canEdit?: boolean;
}

const EditableConfigSection: React.FC<EditableConfigSectionProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  children,
  onSave,
  rightActions,
  canEdit = true
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async (data: any) => {
    if (!onSave) {
      console.log('保存配置:', data);
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(data);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Icon className={`h-6 w-6 ${iconColor}`} />
          <div>
            <h4 className="text-lg font-semibold flex items-center gap-2">
              {title}
              {isEditing && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-normal">
                  编辑中
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {rightActions}

          {canEdit && !isEditing && (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              <Edit3 className="h-4 w-4" />
              编辑
            </button>
          )}

          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                取消
              </button>
              <button
                onClick={() => handleSave({})}
                disabled={isSaving}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      <div className={isEditing ? 'border-l-2 border-blue-500 pl-4' : ''}>
        {children(isEditing, handleSave)}
      </div>
    </div>
  );
};

export default EditableConfigSection;