module Api
  class SessionQuestionsController < ApplicationController
    include SessionAccess

    before_action :set_session
    before_action :require_session_manager!, only: [:create, :destroy]

    def index
      questions = @session.session_questions.includes(:question)
      render json: questions.as_json(include: :question)
    end

    def create
      question = Question.find(params[:question_id])
      session_question = @session.session_questions.build(question: question)

      if session_question.save
        render json: session_question.as_json(include: :question), status: :created
      else
        render json: { errors: session_question.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      session_question = @session.session_questions.find(params[:id])

      if params[:status] == "completed"
        session_question.mark_completed(params[:time_taken_seconds])
      elsif params[:status] == "in_progress"
        session_question.mark_in_progress
      else
        session_question.update(status: params[:status])
      end

      render json: session_question.as_json(include: :question)
    end

    def destroy
      session_question = @session.session_questions.find(params[:id])
      session_question.destroy
      head :no_content
    end

    private

    def set_session
      load_session_from_params!
      require_session_participant!
    end
  end
end
