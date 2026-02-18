/**
 * Capy Social Network Graph Component
 *
 * Visualizes relationships between different Capys
 * Shows interaction network in a simple node-link diagram
 * Optional feature - displays when there are multiple Max users
 */

'use client'

import { useEffect, useState } from 'react'
import { CapyAgent, CapyPersonality } from '@/types/database'

interface CapySocialGraphProps {
  capyId: string
}

interface CapyNode extends CapyAgent {
  interaction_count: number
}

interface CapyConnection {
  capy_1_id: string
  capy_2_id: string
  interaction_count: number
  recent_interaction: string
}

interface NetworkData {
  nodes: CapyNode[]
  connections: CapyConnection[]
}

const personalityEmoji: Record<CapyPersonality, string> = {
  lazy: '😴',
  active: '⚡',
  curious: '🔍',
  friendly: '🤗',
  shy: '😊'
}

const personalityColors: Record<CapyPersonality, string> = {
  lazy: '#60a5fa',
  active: '#fb923c',
  curious: '#a78bfa',
  friendly: '#4ade80',
  shy: '#f472b6'
}

export default function CapySocialGraph({ capyId }: CapySocialGraphProps) {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCapy, setSelectedCapy] = useState<CapyNode | null>(null)

  useEffect(() => {
    fetchNetworkData()
  }, [capyId])

  const fetchNetworkData = async () => {
    try {
      const response = await fetch(`/api/capy/social-network?capy_id=${capyId}`, {
        headers: {
          'X-User-ID': 'mock-max-user-id' // TODO: Replace with real auth
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNetworkData(data.network)
      } else {
        // Mock data for demonstration
        setNetworkData({
          nodes: [],
          connections: []
        })
      }
    } catch (err) {
      // Use empty data on error
      setNetworkData({
        nodes: [],
        connections: []
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-amber-200">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin text-4xl">🦫</div>
        </div>
      </div>
    )
  }

  if (!networkData || networkData.nodes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-amber-300 text-center">
        <div className="flex justify-center gap-3 mb-4">
          <div className="text-5xl">🦫</div>
          <div className="text-3xl opacity-30">🦫</div>
          <div className="text-3xl opacity-30">🦫</div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          社交网络建设中
        </h3>
        <p className="text-gray-500 text-sm">
          当有更多Max用户的Capy加入社区时，<br />
          这里会显示Capy之间的社交网络关系图
        </p>
      </div>
    )
  }

  // Find the main Capy node
  const mainCapy = networkData.nodes.find(node => node.id === capyId)

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-4 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌐</span>
          <h3 className="text-lg font-bold text-gray-800">Capy社交网络</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {networkData.nodes.length} 个Capy · {networkData.connections.length} 个互动关系
        </p>
      </div>

      {/* Simple Network Visualization */}
      <div className="p-6">
        {/* Center node (main Capy) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg ring-4 ring-amber-200 transition-transform group-hover:scale-110">
              <div className="text-5xl">🦫</div>
            </div>
            {mainCapy && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-sm font-bold text-amber-700">{mainCapy.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Connected Capys */}
        {networkData.nodes.filter(node => node.id !== capyId).length > 0 && (
          <>
            <div className="flex justify-center mb-4">
              <div className="h-12 w-px bg-gradient-to-b from-amber-300 to-transparent"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {networkData.nodes
                .filter(node => node.id !== capyId)
                .map(node => {
                  const connection = networkData.connections.find(
                    conn =>
                      (conn.capy_1_id === capyId && conn.capy_2_id === node.id) ||
                      (conn.capy_2_id === capyId && conn.capy_1_id === node.id)
                  )

                  return (
                    <div
                      key={node.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedCapy(selectedCapy?.id === node.id ? null : node)}
                    >
                      <div className="bg-white border-2 border-amber-200 rounded-xl p-4 hover:border-amber-400 hover:shadow-lg transition-all">
                        <div className="flex flex-col items-center text-center">
                          <div
                            className="w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-2 transition-transform group-hover:scale-110"
                            style={{
                              backgroundColor: personalityColors[node.personality] + '40'
                            }}
                          >
                            <div className="text-3xl">🦫</div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 mb-1">
                            {node.name}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <span>{personalityEmoji[node.personality]}</span>
                            <span>{node.personality}</span>
                          </span>
                          {connection && (
                            <div className="mt-2 text-xs text-amber-600 font-medium">
                              {connection.interaction_count} 次互动
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </>
        )}

        {/* Selected Capy Details */}
        {selectedCapy && (
          <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-300">
            <div className="flex items-start gap-3">
              <div className="text-4xl">🦫</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-800">{selectedCapy.name}</h4>
                  <span className="text-xl">{personalityEmoji[selectedCapy.personality]}</span>
                </div>
                {selectedCapy.bio && (
                  <p className="text-sm text-gray-600 italic mb-2">&quot;{selectedCapy.bio}&quot;</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="px-2 py-1 bg-white rounded-full border border-amber-200">
                    {selectedCapy.personality} 性格
                  </span>
                  <span className="px-2 py-1 bg-white rounded-full border border-amber-200">
                    {selectedCapy.interaction_count} 次互动
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCapy(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t border-amber-200">
        <p className="text-xs text-gray-600 mb-2 font-medium">性格类型说明：</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(personalityEmoji) as CapyPersonality[]).map(personality => (
            <div
              key={personality}
              className="flex items-center gap-1 px-2 py-1 bg-white rounded-full border border-gray-200 text-xs"
            >
              <span>{personalityEmoji[personality]}</span>
              <span className="text-gray-700 capitalize">{personality}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
