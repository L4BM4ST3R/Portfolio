import React, { useState, useEffect } from 'react';
import { Terminal, Folder, FileText, Code, AppWindow as Windows, Link as Linux } from 'lucide-react';

interface Command {
  input: string;
  output: string | React.ReactNode;
  isError?: boolean;
}

const DIRECTORIES = {
  about: {
    type: 'file',
    content: 'About Sliced Labs',
  },
  projects: {
    type: 'directory',
    content: ['web-apps', 'mobile-apps', 'blockchain'],
  },
  services: {
    type: 'directory',
    content: ['consulting', 'development', 'design'],
  },
  contact: {
    type: 'file',
    content: 'Contact information',
  },
  blog: {
    type: 'directory',
    content: ['tech-insights', 'case-studies', 'tutorials'],
  },
  challenges: {
    type: 'directory',
    content: ['algorithms', 'puzzles', 'games'],
  }
};

const EASTER_EGGS = {
  matrix: `Wake up, Neo...
The Matrix has you...
Follow the white rabbit.
Knock, knock, Neo.`,
  coffee: `
       )  (
      (   ) )
       ) ( (
     _______)_
  .-'---------|  
  ( C|======| |
   '-.________|
    '-------'`,
  konami: `↑↑↓↓←→←→BA`,
  hack: `ACCESS GRANTED
SYSTEM COMPROMISED
WELCOME TO THE MAINFRAME`,
};

function App() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentPath, setCurrentPath] = useState('~');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [konamiProgress, setKonamiProgress] = useState('');
  const [showMatrix, setShowMatrix] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const konamiCode = "ArrowUpArrowUpArrowDownArrowDownArrowLeftArrowRightArrowLeftArrowRightba";
      const newProgress = konamiProgress + e.key;
      if (konamiCode.startsWith(newProgress.toLowerCase())) {
        setKonamiProgress(newProgress);
        if (newProgress.toLowerCase() === konamiCode.toLowerCase()) {
          setCommands(prev => [...prev, {
            input: "KONAMI CODE ACTIVATED",
            output: (
              <div className="text-yellow-500 animate-pulse">
                {EASTER_EGGS.konami}
                <div className="mt-2">Congratulations! You've unlocked the secret code!</div>
              </div>
            )
          }]);
          setKonamiProgress('');
        }
      } else {
        setKonamiProgress('');
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [konamiProgress]);

  const renderTree = (obj: any, prefix = '') => {
    return Object.entries(obj).map(([key, value]: [string, any]) => (
      <div key={key} className="font-mono">
        {prefix}
        {value.type === 'directory' ? '├── ' : '└── '}
        <span className={value.type === 'directory' ? 'font-bold text-yellow-500' : 'text-white'}>
          {key}
        </span>
        {value.type === 'directory' && value.content && (
          <div className="ml-4">
            {value.content.map((item: string) => (
              <div key={item} className="text-orange-500">{prefix}    └── {item}</div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  const handleCommand = (input: string) => {
    const parts = input.trim().split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: string | React.ReactNode = '';
    let isError = false;

    // Easter Eggs
    if (command === 'matrix') {
      setShowMatrix(true);
      setTimeout(() => setShowMatrix(false), 5000);
      output = <div className="text-green-500 animate-pulse whitespace-pre">{EASTER_EGGS.matrix}</div>;
    } else if (command === 'coffee') {
      output = <div className="text-yellow-500 whitespace-pre">{EASTER_EGGS.coffee}</div>;
    } else if (command === 'hack') {
      output = <div className="text-red-500 animate-pulse whitespace-pre">{EASTER_EGGS.hack}</div>;
    } else {
      switch (command) {
        case 'ls':
          output = (
            <div className="flex flex-col space-y-1">
              {Object.entries(DIRECTORIES).map(([name, data]) => (
                <div key={name} className="flex items-center space-x-2">
                  {data.type === 'directory' ? (
                    <Folder className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <FileText className="w-4 h-4 text-white" />
                  )}
                  <span className={`font-bold ${data.type === 'directory' ? 'text-yellow-500' : 'text-white'}`}>
                    {name}
                  </span>
                </div>
              ))}
            </div>
          );
          break;
        case 'tree':
          output = (
            <div className="font-mono">
              <div className="font-bold text-yellow-500">.</div>
              {renderTree(DIRECTORIES, '')}
            </div>
          );
          break;
        case 'cd':
          if (!args[0]) {
            setCurrentPath('~');
          } else if (DIRECTORIES[args[0]]) {
            if (DIRECTORIES[args[0]].type === 'directory') {
              setCurrentPath(`~/${args[0]}`);
              output = renderDirectory(args[0]);
            } else {
              output = renderFile(args[0]);
            }
          } else {
            output = 'Directory not found';
            isError = true;
          }
          break;
        case 'help':
          output = (
            <div className="space-y-2">
              <div className="font-bold text-yellow-500">Available Commands:</div>
              <div className="text-white">• ls    - List directories and files</div>
              <div className="text-white">• cd    - Change directory or open file</div>
              <div className="text-white">• tree  - Display directory structure</div>
              <div className="text-white">• clear - Clear terminal</div>
              <div className="text-white">• help  - Show this help message</div>
              <div className="text-orange-500 mt-2">Try to find hidden easter eggs! 🎮</div>
              <div className="mt-4 font-bold text-yellow-500">Directory Structure:</div>
              {renderTree(DIRECTORIES)}
            </div>
          );
          break;
        case 'clear':
          setCommands([]);
          return;
        default:
          output = `Command not found: ${command}`;
          isError = true;
      }
    }

    setCommands([...commands, { input, output, isError }]);
    setCurrentInput('');
  };

  const renderCodingChallenge = () => {
    const [currentChallenge, setCurrentChallenge] = useState(0);
    const challenges = [
      {
        title: "FizzBuzz",
        description: "Write a program that prints numbers from 1 to 100. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For numbers that are multiples of both 3 and 5, print 'FizzBuzz'.",
        difficulty: "Easy",
      },
      {
        title: "Palindrome Check",
        description: "Write a function that checks if a given string is a palindrome (reads the same forwards and backwards).",
        difficulty: "Easy",
      },
      {
        title: "Binary Search",
        description: "Implement a binary search algorithm to find a target number in a sorted array.",
        difficulty: "Medium",
      },
    ];

    return (
      <div className="space-y-4 font-mono">
        <div className="border border-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-yellow-500">{challenges[currentChallenge].title}</h3>
            <span className={`px-2 py-1 text-sm ${
              challenges[currentChallenge].difficulty === 'Easy' ? 'text-green-500' : 'text-orange-500'
            }`}>
              {challenges[currentChallenge].difficulty}
            </span>
          </div>
          <p className="mt-2 text-white">{challenges[currentChallenge].description}</p>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setCurrentChallenge((prev) => (prev > 0 ? prev - 1 : challenges.length - 1))}
              className="text-yellow-500 hover:text-yellow-400"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentChallenge((prev) => (prev < challenges.length - 1 ? prev + 1 : 0))}
              className="text-yellow-500 hover:text-yellow-400"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDirectory = (dir: string) => {
    switch (dir) {
      case 'projects':
        return (
          <div className="space-y-4 font-mono">
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Web Applications</h3>
              <p className="text-white">Enterprise-grade web solutions built with cutting-edge technology</p>
              <div className="mt-2">
                <span className="mr-2 border border-white px-2 text-orange-500">React</span>
                <span className="mr-2 border border-white px-2 text-orange-500">Node.js</span>
              </div>
            </div>
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Mobile Applications</h3>
              <p className="text-white">Cross-platform mobile apps for iOS and Android</p>
              <div className="mt-2">
                <span className="mr-2 border border-white px-2 text-orange-500">React Native</span>
                <span className="mr-2 border border-white px-2 text-orange-500">Flutter</span>
              </div>
            </div>
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Blockchain Solutions</h3>
              <p className="text-white">Web3 applications and smart contracts</p>
              <div className="mt-2">
                <span className="mr-2 border border-white px-2 text-orange-500">Ethereum</span>
                <span className="mr-2 border border-white px-2 text-orange-500">Solidity</span>
              </div>
            </div>
          </div>
        );
      case 'services':
        return (
          <div className="space-y-4 font-mono">
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Technical Consulting</h3>
              <p className="text-white">Expert guidance on architecture and technology choices</p>
            </div>
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Custom Development</h3>
              <p className="text-white">Full-stack development services for web and mobile</p>
            </div>
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">UI/UX Design</h3>
              <p className="text-white">User-centered design solutions</p>
            </div>
          </div>
        );
      case 'challenges':
        return renderCodingChallenge();
      case 'blog':
        return (
          <div className="space-y-4 font-mono">
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Tech Insights</h3>
              <p className="text-white">Latest trends and technology analysis</p>
              <span className="text-sm text-orange-500">March 15, 2024</span>
            </div>
            <div className="border border-white p-4">
              <h3 className="font-bold text-yellow-500">Case Studies</h3>
              <p className="text-white">Real-world project implementations</p>
              <span className="text-sm text-orange-500">March 10, 2024</span>
            </div>
          </div>
        );
      default:
        return 'Directory not found';
    }
  };

  const renderFile = (file: string) => {
    switch (file) {
      case 'about':
        return (
          <div className="space-y-4 font-mono">
            <div className="border border-white p-4">
              <h2 className="font-bold text-xl mb-4 text-yellow-500">About Sliced Labs</h2>
              <p className="mb-4 text-white">
                Sliced Labs is a cutting-edge software development studio specializing in
                creating exceptional digital experiences. We combine technical expertise
                with creative innovation to deliver solutions that drive business growth.
              </p>
              <div className="space-y-2 text-orange-500">
                <div>→ Founded: 2024</div>
                <div>→ Focus: Web, Mobile, and Blockchain Development</div>
                <div>→ Mission: Crafting Digital Excellence</div>
              </div>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4 font-mono">
            <div className="border border-white p-4">
              <h2 className="font-bold text-xl mb-4 text-yellow-500">Contact Information</h2>
              <div className="space-y-2 text-orange-500">
                <div>→ Email: hello@slicedlabs.dev</div>
                <div>→ Location: Silicon Valley</div>
                <div>→ Hours: Mon-Fri, 9:00-18:00 PST</div>
              </div>
            </div>
          </div>
        );
      default:
        return 'File not found';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="border border-white">
          <div className="flex items-center justify-between px-4 py-2 bg-white text-black border-b border-white">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span className="text-sm">SLICED-LABS-TERMINAL</span>
            </div>
          </div>
          <div className="p-4 space-y-2 h-[80vh] overflow-y-auto">
            <pre className="text-white mb-4">
{`
 ███████ ██      ██  ██████ ███████ ██████      ██       █████  ██████  ███████ 
 ██      ██      ██ ██      ██      ██   ██     ██      ██   ██ ██   ██ ██      
 ███████ ██      ██ ██      █████   ██   ██     ██      ███████ ██████  ███████ 
      ██ ██      ██ ██      ██      ██   ██     ██      ██   ██ ██   ██      ██ 
 ███████ ███████ ██  ██████ ███████ ██████      ███████ ██   ██ ██████  ███████ 
                                                                                  
`}
            </pre>
            <div className="mb-4 text-orange-500">
              Welcome to Sliced Labs Terminal Interface. Type 'help' for available commands.
              <div className="text-yellow-500 text-sm mt-1">
                Hint: There might be some hidden easter eggs... Try 'matrix', 'coffee', 'hack', or the legendary Konami code!
              </div>
            </div>
            {commands.map((cmd, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-500">{currentPath}</span>
                  <span className="text-white">$</span>
                  <span className="text-orange-500">{cmd.input}</span>
                </div>
                <div className={cmd.isError ? 'text-red-500' : ''}>
                  {cmd.output}
                </div>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">{currentPath}</span>
              <span className="text-white">$</span>
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && currentInput.trim()) {
                    handleCommand(currentInput);
                  }
                }}
                className="flex-1 bg-transparent outline-none text-orange-500"
                autoFocus
              />
              <span className={`w-2 h-5 bg-white ${cursorVisible ? 'opacity-100' : 'opacity-0'}`} />
            </div>
          </div>
        </div>
      </div>
      {showMatrix && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center text-green-500 text-2xl animate-pulse">
          {EASTER_EGGS.matrix}
        </div>
      )}
    </div>
  );
}

export default App;