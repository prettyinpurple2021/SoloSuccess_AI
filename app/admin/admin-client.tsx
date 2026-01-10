'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { motion } from 'framer-motion'
import { 
  Crown,
  Shield, 
  Target, 
  Users, 
  TrendingUp, 
  Activity, 
  Settings, 
  BarChart3, 
  Server, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Eye,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  Star,
  Trophy,
  Sword,
  Gem,
  Infinity,
  Flame,
  Award,
  Rocket,
  Brain,
  Briefcase,
  Calendar,
  MessageCircle,
  Palette,
  Focus
} from 'lucide-react'
import { 
  TacticalButton, 
  GlassCard, 
  RankStars, 
  CamoBackground, 
  SergeantDivider,
  StatsBadge,
  TacticalGrid,
  TacticalGridItem
} from '@/components/military'
import Link from 'next/link'

type AdminStatus = {
  uptimeSeconds: number
  serverTime: string
  notifications: {
    status: { running: boolean; lastProcessedAt: string | null }
    stats: {
      pending: number
      processing: number
      completed: number
      failed: number
      cancelled: number
      total: number
    }
  }
  scraping: {
    running: boolean
    lastLoopAt: string | null
    metrics: {
      totalJobs: number
      pendingJobs: number
      runningJobs: number
      completedJobs: number
      failedJobs: number
      averageExecutionTime: number
    }
  }
  database: {
    connectionCount: number
    queryCount: number
    averageQueryTime: number
  }
  system: {
    memoryUsage: number
    cpuUsage: number
    diskUsage: number
  }
}

export default function AdminClient() {
  const { user, loading } = useAuth()
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdminStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/admin/status')
        if (!response.ok) {
          throw new Error('Failed to fetch admin status')
        }
        const data = await response.json()
        setAdminStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAdminStatus()
    const interval = setInterval(fetchAdminStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase tracking-wider">Access Denied</h1>
          <p className="text-gray-300 font-mono">You don't have permission to access this area.</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden">
      <CamoBackground opacity={0.1} withGrid={true} />
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b-2 border-neon-magenta/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center gap-3">
                <motion.div 
                  className="w-12 h-12 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_20px_rgba(255,0,110,0.3)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <Crown className="w-6 h-6 text-white" />
                </motion.div>
                <span className="font-orbitron text-xl font-bold text-white uppercase tracking-wider">SoloSuccess AI</span>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <TacticalButton variant="outline" size="sm">
                    Dashboard
                  </TacticalButton>
                </Link>
                <TacticalButton size="sm" onClick={() => window.location.reload()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </TacticalButton>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center gap-2 mb-6">
                <RankStars count={5} size="lg" />
                <span className="text-neon-magenta font-orbitron font-bold text-sm uppercase tracking-wider">
                  Elite Command Center
                </span>
              </div>
              
              <h1 className="font-orbitron text-5xl font-bold text-white mb-6 uppercase tracking-wider">
                Tactical <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-magenta to-neon-purple">Admin</span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl font-mono">
                Monitor and control your elite AI platform with military precision. 
                Real-time system status and tactical operations management.
              </p>
            </motion.div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-neon-magenta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-300 font-mono">Loading tactical status...</p>
              </div>
            ) : error ? (
              <GlassCard className="p-8 text-center">
                <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="font-orbitron text-2xl font-bold text-white mb-2">Status Error</h2>
                <p className="text-military-storm-grey">{error}</p>
              </GlassCard>
            ) : adminStatus ? (
              <>
                {/* System Status Overview */}
                <div className="mb-12">
                  <GlassCard className="p-8">
                    <h2 className="font-orbitron text-3xl font-bold text-white mb-6 uppercase tracking-wider">System Status</h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                          <Server className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-orbitron text-2xl font-bold text-white mb-2 uppercase tracking-wider">
                          {formatUptime(adminStatus.uptimeSeconds)}
                        </h3>
                        <p className="text-gray-300 font-mono">Uptime</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                          <Activity className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                          {adminStatus.system.cpuUsage}%
                        </h3>
                        <p className="text-gray-300 font-mono">CPU Usage</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                          <Database className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                          {adminStatus.system.memoryUsage}%
                        </h3>
                        <p className="text-gray-300 font-mono">Memory Usage</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-gradient-to-br from-neon-magenta to-neon-purple flex items-center justify-center shadow-[0_0_15px_rgba(255,0,110,0.3)]">
                          <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                          {adminStatus.database.queryCount}
                        </h3>
                        <p className="text-gray-300 font-mono">Database Queries</p>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Service Status */}
                <div className="mb-12">
                  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                    <div>
                      <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-orbitron text-2xl font-bold text-white uppercase tracking-wider">Notification Service</h3>
                          <div className="flex items-center gap-2">
                            {adminStatus.notifications.status.running ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-red-400" />
                            )}
                            <span className={`text-sm font-mono font-bold uppercase tracking-wider ${
                              adminStatus.notifications.status.running ? 'text-neon-lime' : 'text-neon-magenta'
                            }`}>
                              {adminStatus.notifications.status.running ? 'Running' : 'Stopped'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-magenta mb-1">
                              {adminStatus.notifications.stats.pending}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-orange mb-1">
                              {adminStatus.notifications.stats.processing}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Processing</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-lime mb-1">
                              {adminStatus.notifications.stats.completed}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Completed</div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                    
                    <div>
                      <GlassCard className="p-8">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-orbitron text-2xl font-bold text-white uppercase tracking-wider">Scraping Service</h3>
                          <div className="flex items-center gap-2">
                            {adminStatus.scraping.running ? (
                              <CheckCircle className="w-5 h-5 text-neon-lime" />
                            ) : (
                              <AlertTriangle className="w-5 h-5 text-neon-magenta" />
                            )}
                            <span className={`text-sm font-mono font-bold uppercase tracking-wider ${
                              adminStatus.scraping.running ? 'text-neon-lime' : 'text-neon-magenta'
                            }`}>
                              {adminStatus.scraping.running ? 'Running' : 'Stopped'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-cyan mb-1">
                              {adminStatus.scraping.metrics.totalJobs}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Total Jobs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-orange mb-1">
                              {adminStatus.scraping.metrics.runningJobs}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Running</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold font-orbitron text-neon-lime mb-1">
                              {adminStatus.scraping.metrics.completedJobs}
                            </div>
                            <div className="text-gray-300 text-sm font-mono">Completed</div>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-12">
                  <GlassCard className="p-8">
                    <h2 className="font-orbitron text-3xl font-bold text-white mb-6 uppercase tracking-wider">Tactical Operations</h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <TacticalButton className="group">
                        <Play className="w-4 h-4 mr-2" />
                        Start Services
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </TacticalButton>
                      
                      <TacticalButton variant="outline" className="group">
                        <Pause className="w-4 h-4 mr-2" />
                        Stop Services
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </TacticalButton>
                      
                      <TacticalButton variant="outline" className="group">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restart System
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </TacticalButton>
                      
                      <TacticalButton variant="outline" className="group">
                        <Eye className="w-4 h-4 mr-2" />
                        View Logs
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </TacticalButton>
                    </div>
                  </GlassCard>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

