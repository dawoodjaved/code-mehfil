module Api
  class QuestionsController < ApplicationController
    before_action :set_question, only: [:show, :update, :destroy]
    before_action :require_question_owner!, only: [:update, :destroy]

    def index
      questions = Question.includes(:created_by, :test_cases)

      questions = questions.by_difficulty(params[:difficulty]) if params[:difficulty].present?
      questions = questions.by_category(params[:category]) if params[:category].present?
      questions = questions.by_source(params[:source]) if params[:source].present?
      questions = questions.search(params[:q]) if params[:q].present?

      if params[:language].present?
        questions = questions.select do |q|
          q.starter_code.present? && q.starter_code.key?(params[:language])
        end
      end

      render json: questions.map { |q| format_question_json(q) }
    end

    def show
      render json: format_question_json(@question)
    end

    def create
      question = current_user.questions_created.build(question_params)

      if question.save
        render json: format_question_json(question), status: :created
      else
        render json: { errors: question.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def update
      if @question.update(question_params)
        render json: format_question_json(@question)
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

    def require_question_owner!
      return if @question.created_by_id == current_user.id

      render json: { error: "Only the question author can modify this" }, status: :forbidden
    end

    def format_question_json(question)
      templates = []
      if question.starter_code.present?
        question.starter_code.each do |lang, code|
          templates << { language: lang, code: code }
        end
      end

      test_cases = question.test_cases.map do |tc|
        {
          id: tc.id,
          input: tc.input,
          expectedOutput: tc.expected_output,
          isPublic: tc.respond_to?(:is_public) ? tc.is_public : true,
          isHidden: tc.respond_to?(:is_public) ? !tc.is_public : false
        }
      end

      topics = []
      topics << question.category.to_s if question.category.present?
      topics += question.topics if question.topics.present? && question.topics.is_a?(Array)
      topics += question.tags if question.respond_to?(:tags) && question.tags.present?

      {
        id: question.id,
        title: question.title,
        description: question.description,
        difficulty: question.difficulty,
        category: question.category,
        topics: topics.uniq,
        timeLimitMinutes: question.time_limit_minutes,
        templates: templates,
        testCases: test_cases,
        starterCode: question.starter_code,
        solution: question.solution,
        source: question.source,
        externalId: question.external_id,
        externalUrl: question.external_url,
        sourceMetadata: question.source_metadata,
        createdBy: question.created_by && {
          id: question.created_by.id,
          name: question.created_by.name
        },
        createdAt: question.created_at,
        updatedAt: question.updated_at
      }
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
        :source,
        :external_id,
        :external_url,
        tags: [],
        topics: [],
        source_metadata: {}
      )
    end
  end
end
