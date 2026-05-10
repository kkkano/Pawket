import React, { useState } from 'react'
import { Provider } from '../types'

interface SettingsProps {
  provider: Provider
  onUpdate: (provider: Provider) => void
  onClose: () => void
}

export const Settings: React.FC<SettingsProps> = ({
  provider,
  onUpdate,
  onClose
}) => {
  const [formData, setFormData] = useState({
    id: provider.id,
    name: provider.name,
    type: provider.type,
    baseUrl: provider.baseUrl,
    apiKey: provider.apiKey,
    defaultModel: provider.defaultModel,
    availableModels: provider.availableModels.join(', ')
  })

  const handleSave = () => {
    onUpdate({
      ...provider,
      id: formData.id,
      name: formData.name,
      type: formData.type as Provider['type'],
      baseUrl: formData.baseUrl,
      apiKey: formData.apiKey,
      defaultModel: formData.defaultModel,
      availableModels: formData.availableModels.split(',').map(m => m.trim()).filter(Boolean)
    })
    onClose()
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h3>⚙️ Provider 设置</h3>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          <div className="form-group">
            <label>Provider ID</label>
            <input
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="unique-id"
            />
          </div>
          <div className="form-group">
            <label>显示名称</label>
            <input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="My Provider"
            />
          </div>
          <div className="form-group">
            <label>类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="openai-compatible">OpenAI 兼容</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>
          <div className="form-group">
            <label>API Base URL</label>
            <input
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="https://api.example.com/v1"
            />
          </div>
          <div className="form-group">
            <label>API Key</label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
          <div className="form-group">
            <label>默认模型</label>
            <input
              value={formData.defaultModel}
              onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
              placeholder="gpt-4"
            />
          </div>
          <div className="form-group">
            <label>可用模型（逗号分隔）</label>
            <textarea
              value={formData.availableModels}
              onChange={(e) => setFormData({ ...formData, availableModels: e.target.value })}
              placeholder="gpt-4, gpt-3.5-turbo"
              rows={3}
            />
          </div>
        </div>
        <div className="settings-footer">
          <button className="cancel-button" onClick={onClose}>取消</button>
          <button className="save-button" onClick={handleSave}>保存</button>
        </div>
      </div>
    </div>
  )
}
