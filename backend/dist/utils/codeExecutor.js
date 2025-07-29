"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = executeCode;
exports.runTestCases = runTestCases;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
const unlink = (0, util_1.promisify)(fs_1.default.unlink);
// Supported languages and their file extensions and commands
const languageConfigs = {
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
        runCommand: (fileName) => `java ${path_1.default.basename(fileName, '.java')}`,
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
async function executeCode(options) {
    const { code, language = 'javascript', input, expectedOutput, timeout = 5000, // Default 5 seconds
     } = options;
    const config = languageConfigs[language.toLowerCase()];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }
    const tempDir = path_1.default.join(__dirname, '../../temp');
    const fileName = `${(0, uuid_1.v4)()}.${config.extension}`;
    const filePath = path_1.default.join(tempDir, fileName);
    // Create temp directory if it doesn't exist
    if (!fs_1.default.existsSync(tempDir)) {
        fs_1.default.mkdirSync(tempDir, { recursive: true });
    }
    try {
        // Write code to a temporary file
        await writeFile(filePath, code);
        // Compile code if needed
        if (config.compileCommand) {
            const compileCmd = config.compileCommand
                .replace('{fileName}', filePath)
                .replace('{fileNameWithoutExt}', path_1.default.basename(filePath, `.${config.extension}`));
            try {
                await execPromise(compileCmd, { timeout, cwd: tempDir });
            }
            catch (compileError) {
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
        const child = (0, child_process_1.spawn)(runCmd, {
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
        const exitCode = await new Promise((resolve) => {
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
        let actualOutput = output.trim();
        let passed = true;
        if (expectedOutput !== undefined) {
            try {
                // Try to parse output as JSON if it looks like JSON
                if (actualOutput.startsWith('{') || actualOutput.startsWith('[')) {
                    actualOutput = JSON.parse(actualOutput);
                }
                // Compare with expected output
                passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);
            }
            catch (e) {
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
    }
    catch (error) {
        return {
            output: '',
            executionTime: 0,
            error: error.message || 'Unknown error occurred',
            passed: false,
        };
    }
    finally {
        // Clean up temporary files
        try {
            await unlink(filePath);
            // Clean up compiled files if they exist
            if (config.compileCommand) {
                const compiledFilePath = config.compileCommand.includes('.out')
                    ? `${filePath}.out`
                    : path_1.default.join(tempDir, path_1.default.basename(filePath, `.${config.extension}`) + '.class');
                if (fs_1.default.existsSync(compiledFilePath)) {
                    await unlink(compiledFilePath);
                }
            }
        }
        catch (cleanupError) {
            console.error('Error cleaning up temporary files:', cleanupError);
        }
    }
}
// Utility function to run code with multiple test cases
async function runTestCases(code, language, testCases, timeout = 5000) {
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
        }
        else {
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
