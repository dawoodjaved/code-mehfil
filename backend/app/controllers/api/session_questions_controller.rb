module Api
  class SessionQuestionsController < ApplicationController
    include SessionAccess

    before_action :set_session
    before_action :require_session_manager!, only: [:create, :destroy]

    def index
      questions = @session.session_questions.includes(question: :test_cases).order(assigned_at: :asc)
      render json: questions.map { |sq| format_session_question(sq) }
    end

    def create
      question = Question.find(params[:question_id])
      session_question = @session.session_questions.build(question: question)

      if session_question.save
        session_question = @session.session_questions.includes(question: :test_cases).find(session_question.id)
        render json: format_session_question(session_question), status: :created
      else
        render json: { errors: session_question.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      session_question = @session.session_questions.includes(question: :test_cases).find(params[:id])

      if params[:status] == "completed"
        session_question.mark_completed(params[:time_taken_seconds])
      elsif params[:status] == "in_progress"
        session_question.mark_in_progress
      else
        session_question.update(status: params[:status])
      end

      render json: format_session_question(session_question.reload)
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

    def format_session_question(session_question)
      q = session_question.question
      manager = current_participant&.owner? ||
                current_participant&.interviewer? ||
                @session.created_by_id == current_user.id

      question_json =
        if q
          base = q.as_json(
            only: [
              :id, :title, :description, :difficulty, :category,
              :time_limit_minutes, :starter_code, :source,
              :external_id, :external_url, :created_at, :updated_at
            ]
          )
          if manager
            base["solution"] = q.solution
            base["source_metadata"] = q.source_metadata
            base["test_cases"] = q.test_cases.as_json
          else
            base["test_cases"] = q.test_cases.select { |tc|
              !tc.respond_to?(:is_public) || tc.is_public
            }.as_json
          end
          base
        end

      session_question.as_json.merge("question" => question_json)
    end
  end
end
