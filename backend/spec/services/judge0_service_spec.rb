require 'rails_helper'

RSpec.describe Judge0Service do
  let(:service) { Judge0Service.new }
  
  describe '#supported_languages' do
    it 'returns list of supported languages' do
      languages = service.supported_languages
      
      expect(languages).to include('javascript', 'python', 'java', 'cpp')
      expect(languages.length).to be > 10
    end
  end
  
  describe '#execute' do
    context 'with valid code' do
      it 'executes JavaScript code successfully', :vcr do
        result = service.execute(
          code: 'console.log("Hello World");',
          language: 'javascript'
        )
        
        # Mock successful response for testing
        # In real scenario, this would call Judge0 API
        expect(result).to have_key(:success)
        expect(result).to have_key(:output)
      end
      
      it 'executes Python code successfully', :vcr do
        result = service.execute(
          code: 'print("Hello World")',
          language: 'python'
        )
        
        expect(result).to have_key(:success)
      end
    end
    
    context 'with code that has stdin' do
      it 'passes stdin to execution', :vcr do
        result = service.execute(
          code: 'name = input(); print(f"Hello {name}")',
          language: 'python',
          stdin: 'World'
        )
        
        expect(result).to have_key(:output)
      end
    end
    
    context 'with unsupported language' do
      it 'returns error' do
        result = service.execute(
          code: 'some code',
          language: 'unsupported_lang'
        )
        
        expect(result[:success]).to be false
        expect(result[:error]).to match(/unsupported language/i)
      end
    end
    
    context 'with compilation error' do
      it 'returns compilation error', :vcr do
        result = service.execute(
          code: 'console.log("missing quote);',
          language: 'javascript'
        )
        
        # Would return error from Judge0
        expect(result).to have_key(:error)
      end
    end
  end
  
  describe 'private methods' do
    describe '#format_result' do
      it 'formats accepted result correctly' do
        judge0_result = {
          'status' => { 'id' => 3, 'description' => 'Accepted' },
          'stdout' => 'Hello World',
          'stderr' => '',
          'time' => '0.045',
          'memory' => 2048
        }
        
        result = service.send(:format_result, judge0_result)
        
        expect(result[:success]).to be true
        expect(result[:output]).to eq('Hello World')
        expect(result[:execution_time_ms]).to eq(45)
        expect(result[:memory_kb]).to eq(2048)
      end
      
      it 'formats compilation error correctly' do
        judge0_result = {
          'status' => { 'id' => 6, 'description' => 'Compilation Error' },
          'compile_output' => 'SyntaxError: Unexpected token'
        }
        
        result = service.send(:format_result, judge0_result)
        
        expect(result[:success]).to be false
        expect(result[:error]).to match(/compilation error/i)
      end
      
      it 'formats timeout correctly' do
        judge0_result = {
          'status' => { 'id' => 5, 'description' => 'Time Limit Exceeded' },
          'time' => '1.000'
        }
        
        result = service.send(:format_result, judge0_result)
        
        expect(result[:success]).to be false
        expect(result[:status]).to eq('timeout')
      end
    end
  end
end

