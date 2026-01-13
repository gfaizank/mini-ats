'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { inviteMember, updateMemberRole, removeMember } from '@/app/actions/companies'
import { toast } from 'sonner'
import { UserPlus, Trash2, Settings2, Loader2 } from 'lucide-react'

interface Member {
  id: string
  user_id: string
  role: 'admin' | 'member'
  created_at: string
  email: string
}

interface TeamMembersCardProps {
  members: Member[]
  companyId: string
  userRole: 'admin' | 'member'
  currentUserId: string
}

// Helper function to format date consistently on both server and client
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export function TeamMembersCard({ members, companyId, userRole, currentUserId }: TeamMembersCardProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [updatingMember, setUpdatingMember] = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsInviting(true)

    try {
      const result = await inviteMember(companyId, inviteEmail, inviteRole)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Member added successfully!')
        setInviteEmail('')
        setInviteRole('member')
        setIsInviteOpen(false)
      }
    } catch (error) {
      toast.error('Failed to add member')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    setUpdatingMember(memberId)

    try {
      const result = await updateMemberRole(companyId, memberId, newRole)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Role updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update role')
    } finally {
      setUpdatingMember(null)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    setUpdatingMember(memberId)

    try {
      const result = await removeMember(companyId, memberId)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Member removed successfully!')
      }
    } catch (error) {
      toast.error('Failed to remove member')
    } finally {
      setUpdatingMember(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              {userRole === 'admin' ? 'Manage your team members' : 'View team members'}
            </CardDescription>
          </div>
          {userRole === 'admin' && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                  <DialogDescription>
                    Add an existing user to your company by their email address. They must already have an account.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      disabled={isInviting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: 'admin' | 'member') => setInviteRole(value)} disabled={isInviting}>
                      <SelectTrigger disabled={isInviting}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#64748b]">
                      Admins can manage company settings and members. Members can manage hiring data.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)} disabled={isInviting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isInviting}>
                      {isInviting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!members || members.length === 0 ? (
          <p className="text-[#64748b]">No members found</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId
              const isUpdating = updatingMember === member.id

              return (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {member.email}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#64748b]">
                      Joined {formatDate(member.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {userRole === 'admin' && !isCurrentUser ? (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(value: 'admin' | 'member') => handleRoleChange(member.id, value)}
                          disabled={isUpdating}
                        >
                          <SelectTrigger className="w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

