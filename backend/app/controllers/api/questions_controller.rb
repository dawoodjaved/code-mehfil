module Api
  class QuestionsController < ApplicationController
    before_action :set_question, only: [:show, :update, :destroy]
    
    def index
      questions = Question.includes(:created_by, :test_cases)
      
      # Filtering
      questions = questions.by_difficulty(params[:difficulty]) if params[:difficulty]
      questions = questions.by_category(params[:category]) if params[:category]
      questions = questions.search(params[:q]) if params[:q]
      
      render json: questions.as_json(
        include: {
          created_by: { only: [:id, :name] },
          test_cases: { only: [:id, :input, :expected_output, :is_hidden] }
        }
      )
    end
    
    def show
      render json: @question.as_json(
        include: {
          created_by: { only: [:id, :name] },
          test_cases: { only: [:id, :input, :expected_output, :is_hidden] }
        }
      )
    end
    
    def create
      question = current_user.questions_created.build(question_params)
      
      if question.save
        render json: question, status: :created
      else
        render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def update
      if @question.update(question_params)
        render json: @question
      else
        render json: { errors: @question.errors.full_messages }, status: :unprocessable_entity
      end
    end
    
    def destroy
      @question.destroy
      head :no_content
    end
    
    private
    
    def set_question
      @question = Question.find(params[:id])
    end
    
    def question_params
      params.require(:question).permit(
        :title,
        :description,
        :difficulty,
        :category,
        :time_limit_minutes,
        :starter_code,
        :solution,
        tags: []
      )
    end
  end
end
