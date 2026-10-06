import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, UserPlus, Shield, Trash2, AlertCircle } from 'lucide-react';
import { projectsApi } from '../../api/projects.api.js';
import { QUERY_KEYS } from '../../constants/queryKeys.js';
import { ROLES, ROLE_LABELS } from '../../constants/roles.js';
import { useProjectRole } from '../../hooks/useProjectRole.js';
import { useAuth } from '../../hooks/useAuth.js';
import { PageHeader } from '../../components/common/PageHeader.jsx';
import { Breadcrumbs } from '../../components/common/Breadcrumbs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { RoleBadge } from '../../components/common/StatusBadge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { FullPageSpinner } from '../../components/feedback/FullPageSpinner.jsx';
import { EmptyState } from '../../components/feedback/EmptyState.jsx';
import { InviteMemberModal } from '../../components/projects/InviteMemberModal.jsx';
import { getInitials } from '../../utils/formatters.js';
import { parseApiError } from '../../utils/errorHandler.js';
import { showToast } from '../../utils/toast.js';

export default function ProjectMembersPage() {
  const { projectId } = useParams();
  const { user: currentUser } = useAuth();
  const { projectRole } = useProjectRole();
  const queryClient = useQueryClient();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Fetch Project Members
  const {
    data: members = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId),
    queryFn: () => projectsApi.getMembers(projectId),
    enabled: !!projectId,
  });

  // Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }) => {
      return await projectsApi.updateMemberRole(projectId, userId, { newRole, role: newRole });
    },
    onSuccess: () => {
      showToast.success('Member role updated successfully!');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId) });
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      showToast.error(parsed.message);
    },
  });

  // Remove Member Mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (userId) => {
      return await projectsApi.removeMember(projectId, userId);
    },
    onSuccess: () => {
      showToast.success('Member removed from project team.');
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECT_MEMBERS(projectId) });
      setMemberToRemove(null);
    },
    onError: (err) => {
      const parsed = parseApiError(err);
      setApiError(parsed.message);
    },
  });

  const canManageMembers = projectRole === ROLES.ADMIN || projectRole === ROLES.PROJECT_ADMIN;
  const isAdmin = projectRole === ROLES.ADMIN;

  if (isLoading) {
    return <FullPageSpinner message="Loading team members..." />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <PageHeader
        title={`Project Members (${members.length})`}
        description="Collaborators assigned to this workspace and their permission roles"
        actions={
          canManageMembers && (
            <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add Member
            </Button>
          )
        }
      />

      {isError && (
        <div className="p-4 text-center rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-xs">
          Failed to load project members list.
        </div>
      )}

      {members.length === 0 ? (
        <EmptyState
          title="No team members"
          description="Add registered users by email to start collaborating."
          icon={Users}
          actionLabel={canManageMembers ? 'Add Member' : null}
          onAction={() => setIsInviteModalOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  {canManageMembers && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {members.map((m) => {
                  const u = m.user || {};
                  const userId = u._id;
                  const isSelf = currentUser?._id === userId;
                  const avatar = typeof u.avatar === 'string' ? u.avatar : u.avatar?.url;

                  return (
                    <tr key={m._id || userId} className="hover:bg-accent/40 transition-colors">
                      {/* Avatar & Username */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                            {avatar ? (
                              <img src={avatar} alt={u.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              getInitials(u.username || u.email)
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {u.username || 'User'}{' '}
                              {isSelf && <span className="text-[10px] text-muted-foreground font-normal">(You)</span>}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">{u.email}</td>

                      {/* Role Dropdown / Badge */}
                      <td className="py-3 px-4">
                        {isAdmin && !isSelf ? (
                          <select
                            value={m.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({ userId, newRole: e.target.value })
                            }
                            className="h-8 rounded-md border border-input bg-background px-2 text-xs font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border-border"
                          >
                            <option value={ROLES.MEMBER}>{ROLE_LABELS[ROLES.MEMBER]}</option>
                            <option value={ROLES.PROJECT_ADMIN}>{ROLE_LABELS[ROLES.PROJECT_ADMIN]}</option>
                            <option value={ROLES.ADMIN}>{ROLE_LABELS[ROLES.ADMIN]}</option>
                          </select>
                        ) : (
                          <RoleBadge role={m.role} />
                        )}
                      </td>

                      {/* Actions */}
                      {canManageMembers && (
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setMemberToRemove(m)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={projectId}
      />

      {/* Confirm Remove Member Modal */}
      <Modal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        title="Remove Member from Project"
        description="Are you sure you want to remove this user from the project workspace?"
      >
        <div className="space-y-4 pt-2">
          {apiError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            User <span className="font-bold text-foreground">{memberToRemove?.user?.username || memberToRemove?.user?.email}</span> will lose access to project tasks and notes.
          </p>

          <div className="flex justify-end gap-3 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={removeMemberMutation.isPending}
              onClick={() => removeMemberMutation.mutate(memberToRemove?.user?._id)}
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
