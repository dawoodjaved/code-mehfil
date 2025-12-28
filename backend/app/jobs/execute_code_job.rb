class ExecuteCodeJob < ApplicationJob
  queue_as :default
  
  def perform(execution_id)
    execution = Execution.find(execution_id)
    execution.update!(status: :running)
    
    service = Judge0Service.new
    result = service.execute(
      code: execution.code,
      language: execution.language,
      stdin: execution.stdin
    )
    
    if result[:success]
      execution.mark_completed(
        output: result[:output],
        execution_time_ms: result[:execution_time_ms],
        memory_kb: result[:memory_kb]
      )
    else
      execution.mark_failed(error: result[:error])
    end
    
    # Broadcast result to session
    broadcast_execution_result(execution)
  rescue StandardError => e
    execution.mark_failed(error: "Execution failed: #{e.message}")
    broadcast_execution_result(execution)
  end
  
  private
  
  def broadcast_execution_result(execution)
    SessionsChannel.broadcast_to(
      execution.session,
      type: 'execution_completed',
      execution: execution.as_json
    )
  end
end
