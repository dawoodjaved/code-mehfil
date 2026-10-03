class SessionsChannel < ApplicationCable::Channel
  PERSIST_INTERVAL_SECONDS = 0.5

  def subscribed
    session = current_session

    if session.is_participant?(current_user)
      stream_for session

      participant = session.participants.find_by(user_id: current_user.id)
      participant&.update_last_seen!

      # Late joiners get the latest saved file contents immediately
      session.files.find_each do |file|
        transmit({
          type: "code_sync",
          file_id: file.id,
          content: file.content.to_s,
          language: file.language,
          path: file.path,
          filename: file.filename
        })
      end

      broadcast_to session, {
        type: "user_joined",
        user: {
          id: current_user.id,
          name: current_user.name,
          email: current_user.email
        }
      }
    else
      reject
    end
  end

  def unsubscribed
    flush_pending_persists

    return unless params[:session_id]

    session = Session.find_by(id: params[:session_id])
    return unless session

    broadcast_to session, {
      type: "user_left",
      user: {
        id: current_user.id,
        name: current_user.name
      }
    }
  end

  def code_change(data)
    session = current_session
    file_id = data["file_id"]
    content = data["content"]

    # Broadcast first so collaborators stay snappy
    broadcast_to session, {
      type: "code_change",
      file_id: file_id,
      content: content,
      cursor_position: data["cursor_position"],
      user_id: current_user.id
    }

    # Debounce DB writes — frontend also PATCHes; this is a safety net for late joiners
    return unless file_id.present? && content.is_a?(String)

    @pending_file_content ||= {}
    @last_persist_at ||= {}
    @pending_file_content[file_id] = content

    now = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    last = @last_persist_at[file_id] || 0.0
    persist_pending_file(session, file_id) if (now - last) >= PERSIST_INTERVAL_SECONDS
  end

  def cursor_update(data)
    session = current_session

    broadcast_to session, {
      type: "cursor_update",
      user_id: current_user.id,
      user_name: current_user.name,
      file_id: data["file_id"],
      position: data["position"]
    }
  end

  def typing(data)
    session = current_session

    broadcast_to session, {
      type: "typing",
      user_id: current_user.id,
      user_name: current_user.name,
      is_typing: data["is_typing"]
    }
  end

  def selection_update(data)
    session = current_session

    broadcast_to session, {
      type: "selection_update",
      user_id: current_user.id,
      file_id: data["file_id"],
      selection: data["selection"]
    }
  end

  def whiteboard_update(data)
    session = current_session

    broadcast_to session, {
      type: "whiteboard_update",
      user_id: current_user.id,
      user_name: current_user.name,
      elements: data["elements"],
      app_state: data["app_state"],
      files: data["files"]
    }
  end

  private

  def current_session
    @current_session ||= Session.find(params[:session_id])
  end

  def persist_pending_file(session, file_id)
    content = @pending_file_content&.delete(file_id)
    return unless content.is_a?(String)

    file = session.files.find_by(id: file_id)
    return unless file

    file.update_columns(content: content, updated_at: Time.current)
    @last_persist_at[file_id] = Process.clock_gettime(Process::CLOCK_MONOTONIC)
  end

  def flush_pending_persists
    return if @pending_file_content.blank?

    session = Session.find_by(id: params[:session_id])
    return unless session

    @pending_file_content.keys.each do |file_id|
      persist_pending_file(session, file_id)
    end
  end
end
