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
        input: params[:stdin] || params[:input] || "",
        file_id: params[:session_file_id] || params[:file_id],
        status: :pending
      )
      
      if execution.save
        begin
          # Try to execute synchronously first (for immediate feedback)
          # If Judge0 is not configured, use fallback
          service = Judge0Service.new
          
          # Check if Judge0 is configured
          if !service.configured?
            # Use fallback execution
            result = execute_code_fallback(execution)
            if result[:success]
              execution.mark_completed(
                output: result[:output] || "",
                execution_time_ms: result[:execution_time_ms] || result[:execution_time] || 0,
                memory_kb: result[:memory_kb] || result[:memory_used]
              )
            else
              execution.mark_failed(error: result[:error] || "Execution failed")
            end
            render json: execution.reload, status: :created
          else
            # Execute asynchronously with Judge0
            ExecuteCodeJob.perform_later(execution.id)
            render json: execution, status: :created
          end
        rescue StandardError => e
          Rails.logger.error "Execution error: #{e.message}\n#{e.backtrace.join("\n")}"
          execution.mark_failed(error: "Execution setup failed: #{e.message}")
          render json: { error: "Execution failed: #{e.message}", execution: execution.reload }, status: :internal_server_error
        end
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
    rescue ActiveRecord::RecordNotFound
      render json: { error: 'Session not found' }, status: :not_found
    end
    
    def execute_code_fallback(execution)
      # Get language name (handles both integer and string)
      language_name = execution.language_name.downcase
      
      # Simple fallback execution for common languages
      case language_name
      when 'javascript', 'typescript'
        execute_javascript(execution.code, execution.input)
      when 'python'
        execute_python(execution.code, execution.input)
      when 'java'
        execute_java(execution.code, execution.input)
      when 'cpp', 'c++'
        execute_cpp(execution.code, execution.input)
      when 'c'
        execute_c(execution.code, execution.input)
      when 'go'
        execute_go(execution.code, execution.input)
      when 'rust'
        execute_rust(execution.code, execution.input)
      when 'ruby'
        execute_ruby(execution.code, execution.input)
      when 'php'
        execute_php(execution.code, execution.input)
      when 'swift'
        execute_swift(execution.code, execution.input)
      else
        {
          success: false,
          error: "Language #{language_name} not supported in fallback mode. Please configure Judge0 API."
        }
      end
    rescue StandardError => e
      {
        success: false,
        error: "Execution error: #{e.message}"
      }
    end
    
    def execute_javascript(code, stdin)
      # Use Node.js if available
      require 'open3'
      
      # Replace browser-specific APIs with console equivalents
      # This is a simple polyfill for common browser APIs
      polyfilled_code = code.gsub(/alert\s*\(/, 'console.log(')
      
      # Wrap code to capture console.log output
      wrapped_code = <<~JS
        (function() {
          const originalLog = console.log;
          let output = [];
          console.log = function(...args) {
            output.push(args.join(' '));
            originalLog.apply(console, arguments);
          };
          try {
            #{polyfilled_code}
          } catch (e) {
            console.error(e.message);
            process.exit(1);
          }
          if (output.length > 0) {
            process.stdout.write(output.join('\\n') + '\\n');
          }
        })();
      JS
      
      Open3.popen3('node', '-e', wrapped_code) do |stdin_stream, stdout, stderr, wait_thr|
        stdin_stream.puts(stdin) if stdin.present?
        stdin_stream.close
        
        output = stdout.read
        error = stderr.read
        exit_status = wait_thr.value.exitstatus
        
        if exit_status == 0
          {
            success: true,
            output: output,
            error: error,
            execution_time_ms: 0,
            memory_kb: nil
          }
        else
          {
            success: false,
            output: output,
            error: error.presence || "Execution failed with exit code #{exit_status}",
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Node.js is not installed. Please install Node.js or configure Judge0 API."
      }
    end
    
    def execute_python(code, stdin)
      # Use Python if available
      require 'open3'
      
      Open3.popen3('python3', '-c', code) do |stdin_stream, stdout, stderr, wait_thr|
        stdin_stream.puts(stdin) if stdin.present?
        stdin_stream.close
        
        output = stdout.read
        error = stderr.read
        exit_status = wait_thr.value.exitstatus
        
        if exit_status == 0
          {
            success: true,
            output: output,
            error: error,
            execution_time_ms: 0,
            memory_kb: nil
          }
        else
          {
            success: false,
            output: output,
            error: error.presence || "Execution failed with exit code #{exit_status}",
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Python3 is not installed. Please install Python3 or configure Judge0 API."
      }
    end
    
    def execute_java(code, stdin)
      require 'open3'
      require 'tempfile'
      
      # Java requires a class file, so we'll create a temporary file
      temp_dir = Dir.mktmpdir
      begin
        # Extract class name from code or use default
        class_name = code.match(/public\s+class\s+(\w+)/)&.captures&.first || 'Main'
        java_file = File.join(temp_dir, "#{class_name}.java")
        File.write(java_file, code)
        
        # Compile
        compile_output = ''
        compile_error = ''
        compile_status = nil
        
        Open3.popen3('javac', java_file) do |_, stdout, stderr, wait_thr|
          compile_output = stdout.read
          compile_error = stderr.read
          compile_status = wait_thr.value.exitstatus
        end
        
        if compile_status != 0
          return {
            success: false,
            output: compile_output,
            error: compile_error.presence || 'Compilation failed',
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
        
        # Execute
        Open3.popen3('java', '-cp', temp_dir, class_name) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Java is not installed. Please install Java JDK or configure Judge0 API."
      }
    end
    
    def execute_cpp(code, stdin)
      require 'open3'
      require 'tempfile'
      
      temp_dir = Dir.mktmpdir
      begin
        cpp_file = File.join(temp_dir, 'main.cpp')
        exe_file = File.join(temp_dir, 'main')
        File.write(cpp_file, code)
        
        # Compile
        compile_output = ''
        compile_error = ''
        compile_status = nil
        
        Open3.popen3('g++', '-o', exe_file, cpp_file) do |_, stdout, stderr, wait_thr|
          compile_output = stdout.read
          compile_error = stderr.read
          compile_status = wait_thr.value.exitstatus
        end
        
        if compile_status != 0
          return {
            success: false,
            output: compile_output,
            error: compile_error.presence || 'Compilation failed',
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
        
        # Execute
        Open3.popen3(exe_file) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "G++ compiler is not installed. Please install G++ or configure Judge0 API."
      }
    end
    
    def execute_c(code, stdin)
      require 'open3'
      require 'tempfile'
      
      temp_dir = Dir.mktmpdir
      begin
        c_file = File.join(temp_dir, 'main.c')
        exe_file = File.join(temp_dir, 'main')
        File.write(c_file, code)
        
        # Compile
        compile_output = ''
        compile_error = ''
        compile_status = nil
        
        Open3.popen3('gcc', '-o', exe_file, c_file) do |_, stdout, stderr, wait_thr|
          compile_output = stdout.read
          compile_error = stderr.read
          compile_status = wait_thr.value.exitstatus
        end
        
        if compile_status != 0
          return {
            success: false,
            output: compile_output,
            error: compile_error.presence || 'Compilation failed',
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
        
        # Execute
        Open3.popen3(exe_file) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "GCC compiler is not installed. Please install GCC or configure Judge0 API."
      }
    end
    
    def execute_go(code, stdin)
      require 'open3'
      require 'tempfile'
      
      temp_dir = Dir.mktmpdir
      begin
        go_file = File.join(temp_dir, 'main.go')
        File.write(go_file, code)
        
        Open3.popen3('go', 'run', go_file) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Go is not installed. Please install Go or configure Judge0 API."
      }
    end
    
    def execute_rust(code, stdin)
      require 'open3'
      require 'tempfile'
      
      temp_dir = Dir.mktmpdir
      begin
        rust_file = File.join(temp_dir, 'main.rs')
        File.write(rust_file, code)
        
        # Rust requires a main function, wrap if needed
        rust_code = code.include?('fn main') ? code : "fn main() {\n#{code}\n}"
        File.write(rust_file, rust_code)
        
        # Compile and run
        compile_status = nil
        compile_output = ''
        compile_error = ''
        
        Open3.popen3('rustc', rust_file, '-o', File.join(temp_dir, 'main')) do |_, stdout, stderr, wait_thr|
          compile_output = stdout.read
          compile_error = stderr.read
          compile_status = wait_thr.value.exitstatus
        end
        
        if compile_status != 0
          return {
            success: false,
            output: compile_output,
            error: compile_error.presence || 'Compilation failed',
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
        
        # Execute
        exe_file = File.join(temp_dir, 'main')
        Open3.popen3(exe_file) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Rust compiler is not installed. Please install Rust or configure Judge0 API."
      }
    end
    
    def execute_ruby(code, stdin)
      require 'open3'
      
      Open3.popen3('ruby', '-e', code) do |stdin_stream, stdout, stderr, wait_thr|
        stdin_stream.puts(stdin) if stdin.present?
        stdin_stream.close
        
        output = stdout.read
        error = stderr.read
        exit_status = wait_thr.value.exitstatus
        
        if exit_status == 0
          {
            success: true,
            output: output,
            error: error,
            execution_time_ms: 0,
            memory_kb: nil
          }
        else
          {
            success: false,
            output: output,
            error: error.presence || "Execution failed with exit code #{exit_status}",
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Ruby is not installed. Please install Ruby or configure Judge0 API."
      }
    end
    
    def execute_php(code, stdin)
      require 'open3'
      
      Open3.popen3('php', '-r', code) do |stdin_stream, stdout, stderr, wait_thr|
        stdin_stream.puts(stdin) if stdin.present?
        stdin_stream.close
        
        output = stdout.read
        error = stderr.read
        exit_status = wait_thr.value.exitstatus
        
        if exit_status == 0
          {
            success: true,
            output: output,
            error: error,
            execution_time_ms: 0,
            memory_kb: nil
          }
        else
          {
            success: false,
            output: output,
            error: error.presence || "Execution failed with exit code #{exit_status}",
            execution_time_ms: 0,
            memory_kb: nil
          }
        end
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "PHP is not installed. Please install PHP or configure Judge0 API."
      }
    end
    
    def execute_swift(code, stdin)
      require 'open3'
      require 'tempfile'
      
      temp_dir = Dir.mktmpdir
      begin
        swift_file = File.join(temp_dir, 'main.swift')
        File.write(swift_file, code)
        
        # Execute
        Open3.popen3('swift', swift_file) do |stdin_stream, stdout, stderr, wait_thr|
          stdin_stream.puts(stdin) if stdin.present?
          stdin_stream.close
          
          output = stdout.read
          error = stderr.read
          exit_status = wait_thr.value.exitstatus
          
          if exit_status == 0
            {
              success: true,
              output: output,
              error: error,
              execution_time_ms: 0,
              memory_kb: nil
            }
          else
            {
              success: false,
              output: output,
              error: error.presence || "Execution failed with exit code #{exit_status}",
              execution_time_ms: 0,
              memory_kb: nil
            }
          end
        end
      ensure
        FileUtils.rm_rf(temp_dir) if Dir.exist?(temp_dir)
      end
    rescue Errno::ENOENT
      {
        success: false,
        error: "Swift is not installed. Please install Swift or configure Judge0 API."
      }
    end
  end
end
