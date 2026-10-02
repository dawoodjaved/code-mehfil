class SessionsChannel < ApplicationCable::Channel
  def subscribed
    session = Session.find(params[:session_id])

    if session.is_participant?(current_user)
      stream_for session

      participant = session.participants.find_by(user: current_user)
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
    session = Session.find(params[:session_id])
    file_id = data["file_id"]
    content = data["content"]

    # Persist so joiners load the latest code from the API / sync snapshot
    if file_id.present? && content.is_a?(String)
      file = session.files.find_by(id: file_id)
      if file
        file.update_columns(content: content, updated_at: Time.current)
      end
    end

    broadcast_to session, {
      type: "code_change",
      file_id: file_id,
      content: content,
      cursor_position: data["cursor_position"],
      user_id: current_user.id
    }
  end

  def cursor_update(data)
    session = Session.find(params[:session_id])
    participant = session.participants.find_by(user: current_user)

    if participant
      participant.cursor_position = data["position"]

      broadcast_to session, {
        type: "cursor_update",
        user_id: current_user.id,
        user_name: current_user.name,
        file_id: data["file_id"],
        position: data["position"]
      }
    end
  end

  def typing(data)
    session = Session.find(params[:session_id])

    broadcast_to session, {
      type: "typing",
      user_id: current_user.id,
      user_name: current_user.name,
      is_typing: data["is_typing"]
    }
  end

  def selection_update(data)
    session = Session.find(params[:session_id])

    broadcast_to session, {
      type: "selection_update",
      user_id: current_user.id,
      file_id: data["file_id"],
      selection: data["selection"]
    }
  end

  def whiteboard_update(data)
    session = Session.find(params[:session_id])

    broadcast_to session, {
      type: "whiteboard_update",
      user_id: current_user.id,
      user_name: current_user.name,
      elements: data["elements"],
      app_state: data["app_state"],
      files: data["files"]
    }
  end
end
