if defined?(ActionCable)
  class SessionsChannel < ApplicationCable::Channel
  def subscribed
    session = Session.find(params[:session_id])
    
    # Verify user has access
    if session.is_participant?(current_user)
      stream_for session
      
      # Update participant's last seen
      participant = session.participants.find_by(user: current_user)
      participant&.update_last_seen!
      
      # Broadcast user joined
      broadcast_to session, {
        type: 'user_joined',
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
    session = Session.find(params[:session_id])
    
    # Broadcast user left
    broadcast_to session, {
      type: 'user_left',
      user: {
        id: current_user.id,
        name: current_user.name
      }
    }
  end
  
  # Handle code changes
  def code_change(data)
    session = Session.find(params[:session_id])
    
    broadcast_to session, {
      type: 'code_change',
      file_id: data['file_id'],
      content: data['content'],
      cursor_position: data['cursor_position'],
      user_id: current_user.id
    }
  end
  
  # Handle cursor position updates
  def cursor_update(data)
    session = Session.find(params[:session_id])
    participant = session.participants.find_by(user: current_user)
    
    if participant
      participant.cursor_position = data['position']
      
      broadcast_to session, {
        type: 'cursor_update',
        user_id: current_user.id,
        file_id: data['file_id'],
        position: data['position']
      }
    end
  end
  
  # Handle typing indicators
  def typing(data)
    session = Session.find(params[:session_id])
    
    broadcast_to session, {
      type: 'typing',
      user_id: current_user.id,
      user_name: current_user.name,
      is_typing: data['is_typing']
    }
  end
  
  # Handle selection updates
  def selection_update(data)
    session = Session.find(params[:session_id])
    
    broadcast_to session, {
      type: 'selection_update',
      user_id: current_user.id,
      file_id: data['file_id'],
      selection: data['selection']
    }
  end
  end
end
