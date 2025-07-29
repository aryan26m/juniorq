import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface ExecuteCodeOptions {
  code: string;
  language: string;
  input?: any;
  expectedOutput?: any;
  timeout?: number;
}

interface ExecutionResult {
  output: string;
  executionTime: number;
  error: string | null;
  passed: boolean;
  actualOutput?: any;
}

// Supported languages and their file extensions and commands
const languageConfigs: Record<string, { 
  extension: string; 
  compileCommand?: string; 
  runCommand: (fileName: string) => string;
}> = {
  javascript: {
    extension: 'js',
    runCommand: (fileName) => `node ${fileName}`,
  },
  python: {
    extension: 'py',
    runCommand: (fileName) => `python3 ${fileName}`,
  },
  java: {
    extension: 'java',
    compileCommand: 'javac {fileName}',
    runCommand: (fileName) => `java ${path.basename(fileName, '.java')}`,
  },
  c: {
    extension: 'c',
    compileCommand: 'gcc {fileName} -o {fileName}.out',
    runCommand: (fileName) => `./${fileName}.out`,
  },
  cpp: {
    extension: 'cpp',
    compileCommand: 'g++ {fileName} -o {fileName}.out',
    runCommand: (fileName) => `./${fileName}.out`,
  },
};

export async function executeCode(options: ExecuteCodeOptions): Promise<ExecutionResult> {
  const {
    code,
    language = 'javascript',
    input,
    expectedOutput,
    timeout = 5000, // Default 5 seconds
  } = options;

  const config = languageConfigs[language.toLowerCase()];
  
  if (!config) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const tempDir = path.join(__dirname, '../../temp');
  const fileName = `${uuidv4()}.${config.extension}`;
  const filePath = path.join(tempDir, fileName);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // Write code to a temporary file
    await writeFile(filePath, code);

    // Compile code if needed
    if (config.compileCommand) {
      const compileCmd = config.compileCommand
        .replace('{fileName}', filePath)
        .replace('{fileNameWithoutExt}', path.basename(filePath, `.${config.extension}`));
      
      try {
        await execPromise(compileCmd, { timeout, cwd: tempDir });
      } catch (compileError: any) {
        return {
          output: '',
          executionTime: 0,
          error: `Compilation error: ${compileError.stderr || compileError.message}`,
          passed: false,
        };
      }
    }

    // Prepare input as string
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Run the code
    const startTime = process.hrtime();
    const runCmd = config.runCommand(filePath);
    const child = spawn(runCmd, {
      shell: true,
      cwd: tempDir,
      timeout,
    });

    let output = '';
    let errorOutput = '';
    let executionTime = 0;

    // Handle stdout
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Handle stderr
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Write input to stdin if provided
    if (inputStr) {
      child.stdin.write(inputStr);
      child.stdin.end();
    }

    // Wait for the process to exit
    const exitCode = await new Promise<number | null>((resolve) => {
      child.on('close', (code) => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        executionTime = seconds * 1000 + nanoseconds / 1e6; // Convert to milliseconds
        resolve(code);
      });
    });

    // Check if the process was killed due to timeout
    if (child.killed) {
      return {
        output,
        executionTime,
        error: 'Execution timed out',
        passed: false,
      };
    }

    // Check for runtime errors
    if (exitCode !== 0) {
      return {
        output,
        executionTime,
        error: errorOutput || `Process exited with code ${exitCode}`,
        passed: false,
      };
    }

    // Parse output if expectedOutput is provided
    let actualOutput: any = output.trim();
    let passed = true;

    if (expectedOutput !== undefined) {
      try {
        // Try to parse output as JSON if it looks like JSON
        if (actualOutput.startsWith('{') || actualOutput.startsWith('[')) {
          actualOutput = JSON.parse(actualOutput);
        }
        
        // Compare with expected output
        passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
      } catch (e) {
        // If parsing fails, do a string comparison
        passed = actualOutput === expectedOutput;
      }
    }

    return {
      output,
      executionTime,
      error: errorOutput || null,
      passed,
      actualOutput: actualOutput,
    };
  } catch (error: any) {
    return {
      output: '',
      executionTime: 0,
      error: error.message || 'Unknown error occurred',
      passed: false,
    };
  } finally {
    // Clean up temporary files
    try {
      await unlink(filePath);
      
      // Clean up compiled files if they exist
      if (config.compileCommand) {
        const compiledFilePath = config.compileCommand.includes('.out')
          ? `${filePath}.out`
          : path.join(tempDir, path.basename(filePath, `.${config.extension}`) + '.class');
        
        if (fs.existsSync(compiledFilePath)) {
          await unlink(compiledFilePath);
        }
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temporary files:', cleanupError);
    }
  }
}

// Utility function to run code with multiple test cases
export async function runTestCases(
  code: string,
  language: string,
  testCases: Array<{ input: any; expectedOutput: any }>,
  timeout = 5000
): Promise<{
  results: Array<{ input: any; expectedOutput: any; result: ExecutionResult }>;
  passed: number;
  failed: number;
  total: number;
}> {
  const results = [];
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    const result = await executeCode({
      code,
      language,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      timeout,
    });

    results.push({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      result,
    });

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }

  return {
    results,
    passed,
    failed,
    total: testCases.length,
  };
}
