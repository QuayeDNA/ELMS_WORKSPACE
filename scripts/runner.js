#!/usr/bin/env node

const chalk = require("chalk");
const figlet = require("figlet");
const inquirer = require("inquirer");
const { spawn } = require("child_process");
const ora = require("ora").default;

// Create inquirer prompt instance
const prompt = inquirer.createPromptModule();

// ASCII Art Banner
function displayBanner() {
  console.clear();
  console.log(
    chalk.cyan(
      figlet.textSync("ELMS", {
        font: "Big",
        horizontalLayout: "full",
        verticalLayout: "full",
      })
    )
  );

  console.log(
    chalk.yellow.bold(
      "╔══════════════════════════════════════════════════════════════════════════════╗"
    )
  );
  console.log(
    chalk.yellow.bold("║") +
      chalk.white.bold(
        "               Examination Logistics Management System                  "
      ) +
      chalk.yellow.bold("║")
  );
  console.log(
    chalk.yellow.bold("║") +
      chalk.gray(
        "                          Complete Workspace Runner                           "
      ) +
      chalk.yellow.bold("║")
  );
  console.log(
    chalk.yellow.bold(
      "╚══════════════════════════════════════════════════════════════════════════════╝"
    )
  );
  console.log("");
}

// Platform Status Indicators
function getPlatformStatus(platform) {
  const statuses = {
    backend: { color: "blue", icon: "🔧", name: "Backend (Node.js/Express)" },
    frontend: { color: "green", icon: "⚛️", name: "Frontend (React/Electron)" },
    mobile: {
      color: "magenta",
      icon: "📱",
      name: "Mobile (React Native/Expo)",
    },
  };
  return statuses[platform] || { color: "gray", icon: "❓", name: platform };
}

// Menu Options
const menuOptions = [
  {
    name: `${chalk.green("🚀 Start All Services")} - Run backend, frontend, and mobile in parallel`,
    value: "dev",
    description: "Start development servers for all platforms concurrently",
  },
  {
    name: `${chalk.blue("🔧 Backend Only")} - Start backend development server`,
    value: "dev:backend",
    description: "Run only the backend server with hot reload",
  },
  {
    name: `${chalk.cyan("⚛️  Frontend Only")} - Start frontend development server`,
    value: "dev:frontend",
    description: "Run only the React frontend with Vite",
  },
  {
    name: `${chalk.magenta("📱 Mobile Only")} - Start mobile development server`,
    value: "dev:mobile",
    description: "Run Expo development server for mobile app",
  },
  {
    name: `${chalk.yellow("🌐 Web Only")} - Start backend and frontend servers`,
    value: "dev:web",
    description: "Run backend and frontend servers without mobile",
  },
  chalk.gray("─".repeat(70)),
  {
    name: `${chalk.yellow("🔨 Build All")} - Build all platforms for production`,
    value: "build",
    description: "Build all platforms for production deployment",
  },
  {
    name: `${chalk.red("🧪 Test All")} - Run tests and linting for all platforms`,
    value: "test",
    description: "Run linting and tests across all platforms",
  },
  {
    name: `${chalk.blue("💾 Database")} - Database management tools`,
    value: "database",
    description: "Setup, migrate, or open Prisma Studio",
  },
  chalk.gray("─".repeat(70)),
  {
    name: `${chalk.cyan("📦 Install Dependencies")} - Install all dependencies`,
    value: "install:all",
    description: "Install dependencies for root and all workspaces",
  },
  {
    name: `${chalk.red("🧹 Clean All")} - Clean build artifacts and caches`,
    value: "clean",
    description: "Remove dist folders and cache files",
  },
  chalk.gray("─".repeat(70)),
  {
    name: `${chalk.gray("❌ Exit")} - Close the workspace runner`,
    value: "exit",
    description: "Exit the application",
  },
];

// Database submenu
const databaseOptions = [
  {
    name: `${chalk.green("🚀 Setup Database")} - Push schema and generate client`,
    value: "db:setup",
    description: "Initialize database with schema and generate Prisma client",
  },
  {
    name: `${chalk.blue("📊 Run Migrations")} - Apply pending migrations`,
    value: "db:migrate",
    description: "Run Prisma migrations for database changes",
  },
  {
    name: `${chalk.magenta("🎨 Open Studio")} - Launch Prisma Studio`,
    value: "db:studio",
    description: "Open web interface for database management",
  },
  {
    name: `${chalk.gray("⬅️  Back to Main Menu")}`,
    value: "back",
    description: "Return to main menu",
  },
];

// Execute npm script
function runScript(scriptName, description) {
  const spinner = ora({
    text: chalk.cyan(`Starting: ${description}`),
    spinner: "dots",
  }).start();

  const child = spawn("npm", ["run", scriptName], {
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    if (code === 0) {
      spinner.succeed(chalk.green(`${description} completed successfully!`));
    } else {
      spinner.fail(chalk.red(`${description} failed with exit code ${code}`));
    }
  });

  child.on("error", (error) => {
    spinner.fail(chalk.red(`Error running ${description}: ${error.message}`));
  });

  return child;
}

// Main menu loop
async function showMainMenu() {
  displayBanner();

  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: chalk.white.bold("What would you like to do?"),
      choices: menuOptions,
      pageSize: 15,
      loop: false,
    },
  ]);

  return choice;
}

// Database menu
async function showDatabaseMenu() {
  displayBanner();
  console.log(chalk.blue.bold("\n📊 Database Management\n"));

  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: chalk.white.bold("Database Operations:"),
      choices: databaseOptions,
      pageSize: 10,
    },
  ]);

  return choice;
}

// Main application loop
async function main() {
  let running = true;

  while (running) {
    const choice = await showMainMenu();

    switch (choice) {
      case "dev":
        console.log(
          chalk.green.bold("\n🚀 Starting all development services...\n")
        );
        runScript("dev", "All Services Development Mode");
        // Don't exit, let the services run
        running = false;
        break;

      case "dev:backend":
        console.log(
          chalk.blue.bold("\n🔧 Starting backend development server...\n")
        );
        runScript("dev:backend", "Backend Development Server");
        running = false;
        break;

      case "dev:frontend":
        console.log(
          chalk.cyan.bold("\n⚛️ Starting frontend development server...\n")
        );
        runScript("dev:frontend", "Frontend Development Server");
        running = false;
        break;

      case "dev:mobile":
        console.log(
          chalk.magenta.bold("\n📱 Starting mobile development server...\n")
        );
        runScript("dev:mobile", "Mobile Development Server");
        running = false;
        break;

      case "dev:web":
        console.log(
          chalk.yellow.bold(
            "\n🌐 Starting web development servers (backend + frontend)...\n"
          )
        );
        runScript("dev:web", "Web Development Servers");
        running = false;
        break;

      case "build":
        console.log(chalk.yellow.bold("\n🔨 Building all platforms...\n"));
        runScript("build", "Build All Platforms");
        break;

      case "test":
        console.log(chalk.red.bold("\n🧪 Running tests and linting...\n"));
        runScript("test", "Test All Platforms");
        break;

      case "database":
        let dbRunning = true;
        while (dbRunning) {
          const dbChoice = await showDatabaseMenu();
          switch (dbChoice) {
            case "db:setup":
              console.log(chalk.green.bold("\n🚀 Setting up database...\n"));
              runScript("db:setup", "Database Setup");
              break;
            case "db:migrate":
              console.log(
                chalk.blue.bold("\n📊 Running database migrations...\n")
              );
              runScript("db:migrate", "Database Migration");
              break;
            case "db:studio":
              console.log(
                chalk.magenta.bold("\n🎨 Opening Prisma Studio...\n")
              );
              runScript("db:studio", "Prisma Studio");
              break;
            case "back":
              dbRunning = false;
              break;
          }
          if (!["back"].includes(dbChoice)) {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Brief pause
          }
        }
        break;

      case "install:all":
        console.log(chalk.cyan.bold("\n📦 Installing all dependencies...\n"));
        runScript("install:all", "Install All Dependencies");
        break;

      case "clean":
        console.log(chalk.red.bold("\n🧹 Cleaning build artifacts...\n"));
        runScript("clean", "Clean All Artifacts");
        break;

      case "exit":
        console.log(
          chalk.yellow.bold("\n👋 Goodbye! Happy coding with ELMS!\n")
        );
        running = false;
        break;

      default:
        console.log(chalk.red("Invalid choice. Please try again."));
        break;
    }

    if (running && choice !== "database") {
      console.log(chalk.gray("\nPress Enter to continue..."));
      await prompt([{ type: "input", name: "continue", message: "" }]);
    }
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  displayBanner();
  console.log(chalk.white.bold("\nUsage:"));
  console.log("  npm run runner          # Interactive mode");
  console.log("  npm run dev            # Start all services");
  console.log("  npm run dev:web        # Start backend and frontend only");
  console.log("  npm run dev:backend    # Start backend only");
  console.log("  npm run dev:frontend   # Start frontend only");
  console.log("  npm run dev:mobile     # Start mobile only");
  console.log("  npm run build          # Build all platforms");
  console.log("  npm run test           # Run all tests");
  console.log("  npm run db:setup       # Setup database");
  console.log("  npm run install:all    # Install all dependencies");
  console.log("  npm run clean          # Clean build artifacts");
  console.log(
    "\nFor more information, visit: https://github.com/QuayeDNA/ELMS_WORKSPACE\n"
  );
  process.exit(0);
}

// Check if running in direct mode
if (args.length > 0 && !args.includes("--help") && !args.includes("-h")) {
  const script = args[0];
  const validScripts = [
    "dev",
    "dev:web",
    "dev:backend",
    "dev:frontend",
    "dev:mobile",
    "build",
    "test",
    "db:setup",
    "db:migrate",
    "db:studio",
    "install:all",
    "clean",
  ];

  if (validScripts.includes(script)) {
    displayBanner();
    console.log(chalk.green(`\n🚀 Running: ${script}\n`));
    runScript(script, script);
  } else {
    console.error(chalk.red(`❌ Invalid script: ${script}`));
    console.log(chalk.yellow("Run with --help for available options"));
    process.exit(1);
  }
} else {
  // Interactive mode
  main().catch(console.error);
}
