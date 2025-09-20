/**
 * ReAct 引擎 Hook
 * 提供 ReAct 引擎的状态管理和操作方法
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { ReActEngine } from '../core/ReActEngine';
import type { CreationSession, CreationMode, ReActEngineConfig } from '../types';
import type { CreateDigitalEmployeeForm } from '../../../types';

interface UseReActEngineOptions {
  config?: Partial<ReActEngineConfig>;
  onSessionComplete?: (session: CreationSession) => void;
  onError?: (error: Error) => void;
}

interface UseReActEngineReturn {
  // 状态
  engine: ReActEngine;
  activeSessions: CreationSession[];
  isProcessing: boolean;
  currentSession: CreationSession | null;

  // 操作方法
  createSession: (mode: CreationMode, input?: string) => CreationSession;
  processInput: (sessionId: string, input: string) => Promise<void>;
  updateSessionConfig: (sessionId: string, config: Partial<CreateDigitalEmployeeForm>) => void;
  cleanupSession: (sessionId: string) => void;
  getSession: (sessionId: string) => CreationSession | undefined;

  // 工具方法
  restart: () => void;
  getStats: () => any;
}

export const useReActEngine = (options: UseReActEngineOptions = {}): UseReActEngineReturn => {
  const { config, onSessionComplete, onError } = options;

  // 创建引擎实例（只创建一次）
  const engineRef = useRef<ReActEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new ReActEngine(config);
  }
  const engine = engineRef.current;

  // 状态管理
  const [activeSessions, setActiveSessions] = useState<CreationSession[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<CreationSession | null>(null);

  // 同步活跃会话
  const syncActiveSessions = useCallback(() => {
    const sessions = engine.getActiveSessions();
    setActiveSessions(sessions);
  }, [engine]);

  // 创建会话
  const createSession = useCallback((mode: CreationMode, input?: string): CreationSession => {
    const session = engine.createSession(mode, input);
    setCurrentSession(session);
    syncActiveSessions();
    return session;
  }, [engine, syncActiveSessions]);

  // 处理用户输入
  const processInput = useCallback(async (sessionId: string, input: string): Promise<void> => {
    setIsProcessing(true);

    try {
      const session = await engine.processInput(sessionId, input);
      setCurrentSession(session);
      syncActiveSessions();

      // 检查会话是否完成
      if (session.status === 'completed') {
        onSessionComplete?.(session);
      }
    } catch (error) {
      console.error('Processing input failed:', error);
      onError?.(error as Error);
    } finally {
      setIsProcessing(false);
    }
  }, [engine, syncActiveSessions, onSessionComplete, onError]);

  // 更新会话配置
  const updateSessionConfig = useCallback((
    sessionId: string,
    config: Partial<CreateDigitalEmployeeForm>
  ): void => {
    engine.updateSessionConfig(sessionId, config);

    // 更新当前会话状态
    if (currentSession?.id === sessionId) {
      const updatedSession = engine.getSession(sessionId);
      if (updatedSession) {
        setCurrentSession(updatedSession);
      }
    }

    syncActiveSessions();
  }, [engine, currentSession, syncActiveSessions]);

  // 清理会话
  const cleanupSession = useCallback((sessionId: string): void => {
    engine.cleanupSession(sessionId);

    // 如果清理的是当前会话，重置当前会话
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }

    syncActiveSessions();
  }, [engine, currentSession, syncActiveSessions]);

  // 获取会话
  const getSession = useCallback((sessionId: string): CreationSession | undefined => {
    return engine.getSession(sessionId);
  }, [engine]);

  // 重新开始
  const restart = useCallback((): void => {
    // 清理所有活跃会话
    activeSessions.forEach(session => {
      engine.cleanupSession(session.id);
    });

    setCurrentSession(null);
    setActiveSessions([]);
    setIsProcessing(false);
  }, [engine, activeSessions]);

  // 获取统计信息
  const getStats = useCallback(() => {
    return engine.getStats();
  }, [engine]);

  // 初始化时同步会话
  useEffect(() => {
    syncActiveSessions();
  }, [syncActiveSessions]);

  // 清理：组件卸载时清理所有会话
  useEffect(() => {
    return () => {
      activeSessions.forEach(session => {
        engine.cleanupSession(session.id);
      });
    };
  }, [engine, activeSessions]);

  return {
    // 状态
    engine,
    activeSessions,
    isProcessing,
    currentSession,

    // 操作方法
    createSession,
    processInput,
    updateSessionConfig,
    cleanupSession,
    getSession,

    // 工具方法
    restart,
    getStats
  };
};

export default useReActEngine;