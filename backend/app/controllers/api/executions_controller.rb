module Api
  class ExecutionsController < ApplicationController
    before_action :set_session, only: [:create]
    
    def index
      executions = current_user.executions.recent.limit(50)
      render json: executions
    end
    
    def show
      execution = Execution.find(params[:id])
      render json: execution
    end
    
    def create
      execution = @session.executions.build(
        user: current_user,
        code: params[:code],
        language: params[:language],
        stdin: params[:stdin],
        session_file_id: params[:session_file_id],
        status: :pending
      )
      
      if execution.save
        # Execute code asynchronously
        ExecuteCodeJob.perform_later(execution.id)
        
        render json: execution, status: :created
      else
        render json: { errors: execution.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    private
    
    def set_session
      @session = Session.find(params[:session_id])
      
      unless @session.is_participant?(current_user)
        render json: { error: 'Access denied' }, status: :forbidden
      end
    end
  end
end
