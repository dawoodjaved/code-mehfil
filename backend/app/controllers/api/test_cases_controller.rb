module Api
  class TestCasesController < ApplicationController
    before_action :set_question
    before_action :require_question_owner!

    def create
      test_case = @question.test_cases.build(
        input: params[:input].to_s,
        expected_output: (params[:expected_output].presence || params[:expectedOutput]).to_s,
        is_public: boolean_param(:is_public, :isPublic, default: true),
        order: params[:order].presence || @question.test_cases.count
      )

      if test_case.save
        render json: format_test_case(test_case), status: :created
      else
        render json: { errors: test_case.errors.full_messages }, status: :unprocessable_entity
      end
    end

    def destroy
      test_case = @question.test_cases.find(params[:id])
      test_case.destroy
      head :no_content
    end

    private

    def set_question
      @question = Question.find(params[:question_id])
    end

    def require_question_owner!
      return if @question.created_by_id == current_user.id

      # Allow any authenticated user to add session-local style cases on bank questions
      # only when they own the question. For shared bank content, reject writes.
      render json: { error: "Only the question author can modify test cases" }, status: :forbidden
    end

    def boolean_param(*keys, default: true)
      keys.each do |key|
        return ActiveModel::Type::Boolean.new.cast(params[key]) if params.key?(key)
      end
      default
    end

    def format_test_case(tc)
      {
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expected_output,
        isPublic: tc.respond_to?(:is_public) ? tc.is_public : true,
        isHidden: tc.respond_to?(:is_public) ? !tc.is_public : false,
        order: tc.order
      }
    end
  end
end
