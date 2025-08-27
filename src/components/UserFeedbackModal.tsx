import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Star, MessageSquare, Send, ThumbsUp, ThumbsDown, 
  AlertTriangle, Lightbulb, TrendingUp, Zap 
} from 'lucide-react';
import { errorHandler, UserFeedback, ErrorContext } from '../services/errorHandling';

interface UserFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: ErrorContext;
  trigger: 'error' | 'success' | 'manual';
  title?: string;
  message?: string;
}

const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({
  isOpen,
  onClose,
  context,
  trigger,
  title,
  message
}) => {
  const [step, setStep] = useState<'rating' | 'details' | 'thanks'>('rating');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative' | 'suggestion'>('positive');
  const [category, setCategory] = useState<'parsing_accuracy' | 'suggestion_quality' | 'ui_experience' | 'performance'>('parsing_accuracy');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // 根据触发类型设置默认值
  const getDefaultTitle = () => {
    switch (trigger) {
      case 'error':
        return '遇到了问题？';
      case 'success':
        return '体验如何？';
      case 'manual':
        return '您的反馈';
      default:
        return '反馈';
    }
  };

  const getDefaultMessage = () => {
    switch (trigger) {
      case 'error':
        return '很抱歉您遇到了问题，请告诉我们具体情况以便改进。';
      case 'success':
        return '实验配置已成功生成！请为我们的服务打分。';
      case 'manual':
        return '您的反馈对我们非常重要，请分享您的想法。';
      default:
        return '请分享您的使用体验。';
    }
  };

  const handleRatingSelect = (selectedRating: 1 | 2 | 3 | 4 | 5) => {
    setRating(selectedRating);
    setFeedbackType(selectedRating >= 4 ? 'positive' : selectedRating <= 2 ? 'negative' : 'suggestion');
    
    // 如果是高分且非错误触发，可以直接提交
    if (selectedRating >= 4 && trigger === 'success') {
      submitFeedback(selectedRating, 'positive', 'parsing_accuracy', '');
    } else {
      setStep('details');
    }
  };

  const submitFeedback = async (
    finalRating: 1 | 2 | 3 | 4 | 5,
    finalType: 'positive' | 'negative' | 'suggestion',
    finalCategory: 'parsing_accuracy' | 'suggestion_quality' | 'ui_experience' | 'performance',
    finalComment: string
  ) => {
    setIsSubmitting(true);

    const feedback: UserFeedback = {
      type: finalType,
      rating: finalRating,
      comment: finalComment || undefined,
      context,
      category: finalCategory
    };

    try {
      // 记录反馈
      errorHandler.recordFeedback(feedback);
      
      // 模拟网络请求
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('thanks');
      
      // 2秒后自动关闭
      setTimeout(() => {
        onClose();
        resetModal();
      }, 2000);
      
    } catch (error) {
      console.error('提交反馈失败:', error);
      // 可以显示错误消息
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (rating) {
      submitFeedback(rating, feedbackType, category, comment);
    }
  };

  const resetModal = () => {
    setStep('rating');
    setRating(null);
    setFeedbackType('positive');
    setCategory('parsing_accuracy');
    setComment('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {trigger === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
            {trigger === 'success' && <ThumbsUp className="h-5 w-5 text-green-500" />}
            {trigger === 'manual' && <MessageSquare className="h-5 w-5 text-blue-500" />}
            <h3 className="text-lg font-semibold text-gray-900">
              {title || getDefaultTitle()}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {step === 'rating' && (
            <div className="space-y-6">
              <p className="text-gray-600">
                {message || getDefaultMessage()}
              </p>

              {/* 星级评分 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  整体满意度评分：
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingSelect(star as 1 | 2 | 3 | 4 | 5)}
                      className={`p-2 rounded-full transition-colors ${
                        rating && rating >= star
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      <Star className={`h-8 w-8 ${rating && rating >= star ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500">
                  {rating ? (
                    <span className="font-medium">
                      {rating === 5 ? '非常满意' : 
                       rating === 4 ? '满意' : 
                       rating === 3 ? '一般' : 
                       rating === 2 ? '不满意' : '非常不满意'}
                    </span>
                  ) : (
                    '请选择您的评分'
                  )}
                </div>
              </div>

              {/* 快速反馈按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRatingSelect(5)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">很好</span>
                </button>
                <button
                  onClick={() => handleRatingSelect(2)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-red-50 text-red-700 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span className="text-sm">有问题</span>
                </button>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        rating && rating >= star
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  感谢您的评分，请告诉我们更多详情
                </p>
              </div>

              {/* 反馈类型 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  反馈类型：
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'positive', label: '表扬', icon: ThumbsUp, color: 'green' },
                    { value: 'negative', label: '问题', icon: AlertTriangle, color: 'red' },
                    { value: 'suggestion', label: '建议', icon: Lightbulb, color: 'blue' }
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      onClick={() => setFeedbackType(value as typeof feedbackType)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
                        feedbackType === value
                          ? `bg-${color}-50 text-${color}-700 border-${color}-200`
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 问题分类 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  具体方面：
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="parsing_accuracy">解析准确性</option>
                  <option value="suggestion_quality">建议质量</option>
                  <option value="ui_experience">界面体验</option>
                  <option value="performance">响应速度</option>
                </select>
              </div>

              {/* 详细评论 */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  详细说明 (可选)：
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    feedbackType === 'negative' 
                      ? '请描述您遇到的具体问题...'
                      : feedbackType === 'suggestion'
                      ? '请分享您的改进建议...'
                      : '请告诉我们做得好的地方...'
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="text-xs text-gray-500">
                  {comment.length}/500 字符
                </div>
              </div>

              {/* 提交按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('rating')}
                  className="flex-1 py-2 px-4 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>提交中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>提交反馈</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'thanks' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <ThumbsUp className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  感谢您的反馈！
                </h4>
                <p className="text-gray-600">
                  您的意见对我们改进产品非常重要
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <Zap className="h-4 w-4" />
                  <span>您的反馈已记录，我们会持续优化体验</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserFeedbackModal;