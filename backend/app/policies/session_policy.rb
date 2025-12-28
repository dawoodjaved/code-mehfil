class SessionPolicy < ApplicationPolicy
  def show?
    user.present? && (record.created_by == user || record.participants.exists?(user: user))
  end

  def create?
    user.present?
  end

  def update?
    user.present? && (record.created_by == user || workspace_admin?)
  end

  def destroy?
    user.present? && (record.created_by == user || workspace_admin?)
  end

  def start?
    show?
  end

  def end?
    update?
  end

  private

  def workspace_admin?
    return false unless record.workspace_id

    workspace = record.workspace
    membership = workspace.members.find_by(user: user)
    membership&.admin? || membership&.owner?
  end
end

