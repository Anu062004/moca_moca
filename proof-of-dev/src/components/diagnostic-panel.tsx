'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle, RefreshCw, Settings } from 'lucide-react'

export function DiagnosticPanel() {
  const [diagnostics, setDiagnostics] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runDiagnostics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/diagnostics')
      const data = await response.json()
      
      if (data.success) {
        setDiagnostics(data.diagnostics)
      } else {
        setError(data.error || 'Diagnostics failed')
      }
    } catch (err) {
      setError('Failed to run diagnostics')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-400" />
    )
  }

  const getStatusColor = (status) => {
    return status ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          System Diagnostics
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Running...' : 'Run Diagnostics'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {diagnostics && (
        <div className="space-y-4">
          {/* Environment Variables Status */}
          <div>
            <h4 className="text-md font-medium text-white mb-2">Environment Variables</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(diagnostics.environment).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-300">{key.replace('has', '').replace(/([A-Z])/g, ' $1').trim()}</span>
                  <div className="flex items-center">
                    {getStatusIcon(value)}
                    <span className={`ml-2 ${getStatusColor(value)}`}>
                      {value ? 'Set' : 'Missing'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configuration Values */}
          <div>
            <h4 className="text-md font-medium text-white mb-2">Configuration</h4>
            <div className="space-y-2 text-sm">
              {diagnostics.configuration && Object.entries(diagnostics.configuration).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-300">{key}</span>
                  <span className="text-white font-mono text-xs max-w-xs truncate">
                    {value}
                  </span>
                </div>
              ))}
              {!diagnostics.configuration && (
                <div className="text-gray-400 text-sm">Configuration data not available</div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-white mb-2">Recommendations</h4>
              <div className="space-y-2">
                {diagnostics.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-yellow-200 text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div>
            <h4 className="text-md font-medium text-white mb-2">Next Steps</h4>
            <div className="space-y-1">
              {[
                '1. Check the recommendations above',
                '2. Create/update .env.local file with missing variables',
                '3. Restart the development server',
                '4. Try minting credentials again'
              ].map((step, index) => (
                <div key={index} className="text-gray-300 text-sm">
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!diagnostics && !loading && (
        <div className="text-center py-8">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">
            Run diagnostics to check your system configuration
          </p>
          <p className="text-gray-400 text-sm">
            This will help identify why credential minting might not be working
          </p>
        </div>
      )}
    </div>
  )
}
