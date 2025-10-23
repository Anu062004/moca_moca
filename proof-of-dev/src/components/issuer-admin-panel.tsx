'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit, CheckCircle, AlertCircle, Users, Shield, Key } from 'lucide-react'

interface Issuer {
  id: string
  name: string
  did: string
  type: 'Organization' | 'Individual'
  description: string
  website?: string
  verified: boolean
  createdAt: string
  credentials: string[]
}

interface IssuerFormData {
  name: string
  did: string
  type: 'Organization' | 'Individual'
  description: string
  website: string
}

export function IssuerAdminPanel() {
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingIssuer, setEditingIssuer] = useState<Issuer | null>(null)
  const [formData, setFormData] = useState<IssuerFormData>({
    name: '',
    did: '',
    type: 'Organization',
    description: '',
    website: ''
  })

  // Load issuers on component mount
  useEffect(() => {
    loadIssuers()
  }, [])

  const loadIssuers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/issuers')
      const data = await response.json()
      
      if (data.success) {
        setIssuers(data.issuers)
      } else {
        setError(data.error || 'Failed to load issuers')
      }
    } catch (err) {
      setError('Failed to load issuers')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = editingIssuer 
        ? `/api/admin/issuers/${editingIssuer.id}`
        : '/api/admin/issuers'
      
      const method = editingIssuer ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadIssuers()
        setShowForm(false)
        setEditingIssuer(null)
        setFormData({
          name: '',
          did: '',
          type: 'Organization',
          description: '',
          website: ''
        })
      } else {
        setError(data.error || 'Failed to save issuer')
      }
    } catch (err) {
      setError('Failed to save issuer')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (issuer: Issuer) => {
    setEditingIssuer(issuer)
    setFormData({
      name: issuer.name,
      did: issuer.did,
      type: issuer.type,
      description: issuer.description,
      website: issuer.website || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (issuerId: string) => {
    if (!confirm('Are you sure you want to delete this issuer?')) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/issuers/${issuerId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadIssuers()
      } else {
        setError(data.error || 'Failed to delete issuer')
      }
    } catch (err) {
      setError('Failed to delete issuer')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingIssuer(null)
    setFormData({
      name: '',
      did: '',
      type: 'Organization',
      description: '',
      website: ''
    })
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Shield className="w-8 h-8 mr-3" />
          Issuer Administration
        </h1>
        <p className="text-gray-300">
          Manage trusted credential issuers for the Proof of Dev network
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">{issuers.length}</p>
              <p className="text-gray-400 text-sm">Total Issuers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                {issuers.filter(i => i.verified).length}
              </p>
              <p className="text-gray-400 text-sm">Verified Issuers</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center">
            <Key className="w-8 h-8 text-purple-400 mr-3" />
            <div>
              <p className="text-2xl font-bold text-white">
                {issuers.reduce((sum, i) => sum + i.credentials.length, 0)}
              </p>
              <p className="text-gray-400 text-sm">Total Credentials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Add Issuer Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Issuer</span>
        </button>
      </div>

      {/* Issuer Form */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingIssuer ? 'Edit Issuer' : 'Add New Issuer'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issuer Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., GitHub, Microsoft, Open Source Foundation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.did}
                  onChange={(e) => setFormData({ ...formData, did: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="did:moca:issuer:github"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Organization' | 'Individual' })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Organization">Organization</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief description of the issuer and their authority"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>{editingIssuer ? 'Update Issuer' : 'Add Issuer'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issuers List */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Registered Issuers</h3>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading issuers...</p>
          </div>
        ) : issuers.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No issuers registered yet</p>
            <p className="text-gray-400 text-sm">Add your first issuer to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {issuers.map((issuer) => (
              <div key={issuer.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">{issuer.name}</h4>
                      {issuer.verified && (
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
                          Verified
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        issuer.type === 'Organization' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {issuer.type}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{issuer.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Key className="w-4 h-4 mr-1" />
                        {issuer.did}
                      </span>
                      <span>{issuer.credentials.length} credentials</span>
                      <span>Added {new Date(issuer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(issuer)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(issuer.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
