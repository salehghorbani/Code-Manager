const LANGUAGES = [
  "Bash","C","C#","C++","CSS","Dart","Dockerfile",".env","Go","GraphQL","HTML","INI",
  "Java","JavaScript","JSON","JSX","Kotlin","Lua","Markdown","MATLAB","Objective-C","Perl",
  "PHP","PowerShell","Python","R","Ruby","Rust","Scala","Shell","SQL","Svelte","Swift",
  "TOML","TSX","TypeScript","Vue","XML","YAML"
];

const LANGUAGE_ICONS = {
  Bash:"bash", C:"c", "C#":"csharp", "C++":"cpp", CSS:"css", Dart:"dart",
  Dockerfile:"docker", ".env":"env", Go:"go", GraphQL:"graphql", HTML:"html", INI:"ini",
  Java:"java", JavaScript:"javascript", JSON:"json", JSX:"jsx", Kotlin:"kotlin", Lua:"lua",
  Markdown:"markdown", MATLAB:"matlab", "Objective-C":"objective-c", Perl:"perl", PHP:"php",
  PowerShell:"powershell", Python:"python", R:"r", Ruby:"ruby", Rust:"rust", Scala:"scala",
  Shell:"shell", SQL:"sql", Svelte:"svelte", Swift:"swift", TOML:"toml", TSX:"tsx",
  TypeScript:"typescript", Vue:"vue", XML:"xml", YAML:"yaml"
};

const STORAGE_KEY = "code-manager-state-v1";
const SETTINGS_KEY = "code-manager-settings-v1";
const DATA_VERSION = 2;

const DEFAULT_STATE = {
  version: DATA_VERSION,
  metadata: {
    app: "Code Manager",
    schemaVersion: DATA_VERSION,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  items: []
};
