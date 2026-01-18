class Judge0Service
  LANGUAGE_IDS = {
    'javascript' => 63,
    'typescript' => 74,
    'python' => 71,
    'java' => 62,
    'cpp' => 54,
    'c' => 50,
    'go' => 60,
    'rust' => 73,
    'php' => 68,
    'ruby' => 72,
    'swift' => 83
  }.freeze
  
  def initialize
    @base_url = ENV['JUDGE0_API_URL'] || 'https://judge0-ce.p.rapidapi.com'
    @api_key = ENV['JUDGE0_API_KEY']
    @api_host = ENV['JUDGE0_API_HOST'] || 'judge0-ce.p.rapidapi.com'
  end
  
  def configured?
    @api_key.present?
  end
  
  def execute(code:, language:, stdin: nil)
    # Check if Judge0 is configured
    unless configured?
      return {
        success: false,
        error: "Judge0 API is not configured. Please set JUDGE0_API_KEY environment variable or use fallback execution."
      }
    end
    
    # Convert language to string (handles both integer and string inputs)
    language_str = language.is_a?(Integer) ? Execution::LANGUAGE_MAP_REVERSE[language] : language.to_s
    language_id = LANGUAGE_IDS[language_str&.downcase]
    
    unless language_id
      return {
        success: false,
        error: "Unsupported language: #{language}"
      }
    end
    
    # Create submission
    submission_response = create_submission(code, language_id, stdin)
    
    unless submission_response[:success]
      return submission_response
    end
    
    token = submission_response[:token]
    
    # Poll for result
    result = poll_submission(token)
    
    format_result(result)
  rescue StandardError => e
    Rails.logger.error "Judge0 execution error: #{e.message}\n#{e.backtrace.join("\n")}"
    {
      success: false,
      error: "Execution failed: #{e.message}"
    }
  end
  
  def supported_languages
    LANGUAGE_IDS.keys
  end
  
  private
  
  def create_submission(code, language_id, stdin)
    response = HTTParty.post(
      "#{@base_url}/submissions?base64_encoded=false&wait=false",
      headers: headers,
      body: {
        source_code: code,
        language_id: language_id,
        stdin: stdin
      }.to_json
    )
    
    if response.success?
      { success: true, token: response['token'] }
    else
      { success: false, error: response['error'] || 'Failed to create submission' }
    end
  end
  
  def poll_submission(token, max_attempts: 10)
    max_attempts.times do
      response = HTTParty.get(
        "#{@base_url}/submissions/#{token}?base64_encoded=false",
        headers: headers
      )
      
      if response.success?
        status_id = response['status']['id']
        
        # Status IDs: 1-2 = In Queue/Processing, 3 = Accepted, 4+ = Error states
        if status_id > 2
          return response
        end
      end
      
      sleep 0.5
    end
    
    { 'status' => { 'id' => 13, 'description' => 'Timeout' } }
  end
  
  def format_result(result)
    status = result['status']
    status_id = status['id']
    
    # Status IDs mapping
    # 3 = Accepted
    # 4 = Wrong Answer
    # 5 = Time Limit Exceeded
    # 6 = Compilation Error
    # 7-12 = Runtime Errors
    # 13 = Internal Error
    # 14 = Exec Format Error
    
    if status_id == 3
      {
        success: true,
        output: result['stdout'] || '',
        error: result['stderr'] || '',
        execution_time_ms: (result['time'].to_f * 1000).to_i,
        memory_kb: result['memory'],
        status: 'completed'
      }
    elsif status_id == 6
      {
        success: false,
        output: '',
        error: result['compile_output'] || 'Compilation error',
        execution_time_ms: 0,
        memory_kb: 0,
        status: 'failed'
      }
    elsif status_id == 5
      {
        success: false,
        output: result['stdout'] || '',
        error: 'Time limit exceeded',
        execution_time_ms: (result['time'].to_f * 1000).to_i,
        memory_kb: result['memory'],
        status: 'timeout'
      }
    else
      {
        success: false,
        output: result['stdout'] || '',
        error: result['stderr'] || status['description'] || 'Runtime error',
        execution_time_ms: (result['time'].to_f * 1000).to_i,
        memory_kb: result['memory'],
        status: 'failed'
      }
    end
  end
  
  def headers
    {
      'Content-Type' => 'application/json',
      'X-RapidAPI-Key' => @api_key,
      'X-RapidAPI-Host' => @api_host
    }
  end
end
