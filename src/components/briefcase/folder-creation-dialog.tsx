"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import { Button} from '@/components/ui/button'
import { Input} from '@/components/ui/input'
import { Label} from '@/components/ui/label'
import { Textarea} from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select'
import { Folder, Palette} from 'lucide-react'

interface FolderCreationDialogProps {
  isOpen: boolean
  onCloseAction: () => void
  onCreateFolderAction: (name: string, description?: string, color?: string, parentId?: string) => void
  parentFolder?: string
  availableFolders?: Array<{ id: string; name: string; color: string }>
}

const FOLDER_COLORS = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Teal', value: '#14B8A6' },
]

export default function FolderCreationDialog({ 
  isOpen, 
  onCloseAction, 
  onCreateFolderAction, 
  parentFolder,
  availableFolders = []
}: FolderCreationDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#8B5CF6')
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await onCreateFolderAction(name.trim(), description.trim() || undefined, color, selectedParentId === '__root__' ? undefined : selectedParentId || undefined)
      // Reset form
      setName('')
      setDescription('')
      setColor('#8B5CF6')
      setSelectedParentId('')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setName('')
      setDescription('')
      setColor('#8B5CF6')
      setSelectedParentId('')
      onCloseAction()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-neon-purple" />
            <span className="font-orbitron uppercase tracking-wider">Create New Folder</span>
          </DialogTitle>
          <DialogDescription className="text-gray-300 font-mono">
            {parentFolder 
              ? `Create a new folder inside "${parentFolder}"`
              : 'Create a new folder to organize your files'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="folder-name" className="text-neon-cyan font-mono font-bold uppercase tracking-wider">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              required
              disabled={loading}
              className="mt-1 bg-dark-card border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan rounded-sm font-mono"
            />
          </div>

          <div>
            <Label htmlFor="folder-description" className="text-gray-300 font-mono font-bold uppercase tracking-wider">Description (Optional)</Label>
            <Textarea
              id="folder-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this folder contains..."
              disabled={loading}
              className="mt-1 bg-dark-card border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-neon-cyan rounded-sm font-mono"
              rows={3}
            />
          </div>

          {availableFolders.length > 0 && (
            <div>
              <Label htmlFor="parent-folder" className="text-gray-300 font-mono font-bold uppercase tracking-wider">Parent Folder (Optional)</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId} disabled={loading}>
                <SelectTrigger className="mt-1 bg-dark-card border-2 border-gray-700 text-white rounded-sm font-mono">
                  <SelectValue placeholder="Select parent folder..." />
                </SelectTrigger>
                <SelectContent className="bg-dark-card border-2 border-gray-700">
                  <SelectItem value="__root__" className="text-gray-300 font-mono hover:bg-dark-hover">Root Level</SelectItem>
                  {availableFolders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id} className="text-gray-300 font-mono hover:bg-dark-hover">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border-2 border-gray-700"
                        style={{ backgroundColor: folder.color }}
                        aria-hidden="true"
                      />
                      {folder.name}
                    </div>
                  </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="flex items-center gap-2 text-gray-300 font-mono font-bold uppercase tracking-wider">
              <Palette className="w-4 h-4 text-neon-purple" />
              Folder Color
            </Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {FOLDER_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setColor(colorOption.value)}
                  disabled={loading}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption.value 
                      ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-2 border-gray-700 text-gray-300 hover:border-neon-cyan hover:text-neon-cyan font-mono font-bold uppercase tracking-wider rounded-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || loading}
              variant="purple"
              className="font-mono font-bold uppercase tracking-wider rounded-sm"
            >
              {loading ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
