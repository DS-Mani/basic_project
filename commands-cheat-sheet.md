# Basic Commands Cheat Sheet

> **What each command does, why you need it, and why it got its name.**

---

## Table of Contents

1. [Maven](#1-maven)
2. [Linux](#2-linux)
3. [Git](#3-git)
4. [Docker](#4-docker)
5. [Terraform](#5-terraform)

---

## 1. Maven

**What is Maven?** Maven is a build-automation and dependency-management tool for Java projects. The name *Maven* comes from the Yiddish word meaning **"accumulator of knowledge"** — it knows how to build your project and where to find all its dependencies.

### Project Lifecycle Commands

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `mvn clean` | Deletes the `target/` directory (all compiled output). | Start fresh — removes stale `.class` files and old artifacts so nothing from a previous build leaks in. | **clean** — you are literally *cleaning up* the workspace. |
| `mvn compile` | Compiles the Java source code in `src/main/java` into `.class` files inside `target/classes`. | Turns human-readable `.java` files into bytecode the JVM can run. | **compile** — from Latin *compilare* ("to plunder / gather together"). The compiler *gathers* your source and produces bytecode. |
| `mvn test` | Runs unit tests found in `src/test/java` using a test framework (JUnit, TestNG). | Catches bugs early by executing your test suite automatically. | **test** — straightforward: you are *testing* your code. |
| `mvn package` | Compiles + tests, then bundles the result into a distributable format (JAR, WAR, EAR). | Produces the artifact you ship or deploy — a single file containing everything. | **package** — you are *packaging* the compiled code into an archive. |
| `mvn install` | Runs the full lifecycle up to `package`, then copies the artifact into your **local Maven repository** (`~/.m2/repository`). | Makes this project available as a dependency for *other* local projects on your machine. | **install** — you *install* the artifact into the local repo, like installing software on your system. |
| `mvn deploy` | Runs the full lifecycle up to `install`, then uploads the artifact to a **remote repository** (Nexus, Artifactory). | Shares the built artifact with your entire team or CI/CD pipeline. | **deploy** — from French *déployer* ("to unfold / spread out"). You are *deploying* the artifact out to a shared location. |
| `mvn validate` | Checks that the project structure and POM are correct — no actual compilation. | Quick sanity check before kicking off a long build. | **validate** — you are *validating* the project is well-formed. |
| `mvn verify` | Runs all phases up to and including integration tests and quality checks. | Ensures the package is valid and meets quality criteria *before* installing. | **verify** — you *verify* correctness through deeper checks than `test`. |

### Dependency & Info Commands

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `mvn dependency:tree` | Prints the full dependency tree (all JARs your project pulls in, including transitive ones). | Debugging "why is library X on the classpath?" or spotting version conflicts. | **dependency:tree** — displays your *dependencies* in a *tree* structure. |
| `mvn dependency:resolve` | Downloads and resolves all dependencies to the local repo. | Pre-fetches everything so later offline builds succeed. | **resolve** — *resolves* (finds and downloads) each dependency. |
| `mvn help:effective-pom` | Shows the full POM after merging parent POMs, profiles, and defaults. | See exactly what Maven "sees" — invaluable when inheriting from parent POMs. | **effective-pom** — the *effective* (final, merged) Project Object Model. |
| `mvn versions:display-dependency-updates` | Lists dependencies that have newer versions available. | Keep your dependencies up to date and patched. | Self-descriptive: *display dependency updates*. |

### Useful Flags

| Flag | What It Does | Why You Need It | Why That Name? |
|------|-------------|-----------------|----------------|
| `-DskipTests` | Skips **running** tests (still compiles them). | Speed up builds when you know tests pass. | `-D` sets a system *property*; `skipTests` is the property name. |
| `-Dmaven.test.skip=true` | Skips **compiling and running** tests entirely. | Even faster — don't even compile test code. | Same `-D` mechanism; the property is `maven.test.skip`. |
| `-pl <module>` | Build only the listed module(s) in a multi-module project. | Save time by building only what changed. | **pl** = *project list*. |
| `-am` | Also build modules that the `-pl` targets depend on. | Ensures dependencies of your target module are up to date. | **am** = *also make*. |
| `-X` | Debug output — extremely verbose logging. | Troubleshoot build failures by seeing every Maven decision. | `-X` is a common Unix convention for *extra* debug/trace output. |
| `-U` | Force-update snapshots from remote repositories. | Get the latest SNAPSHOT artifacts instead of stale cached copies. | **U** = *update*. |

---

## 2. Linux

**What is Linux?** Linux is an open-source operating system kernel, and the commands below belong to the GNU/Linux userland. The name *Linux* is a portmanteau of **Linus** (Linus Torvalds, the creator) + **Unix** (the OS it was inspired by).

### Navigation & File System

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `pwd` | Prints the absolute path of your current directory. | Know *where* you are before running commands. | **p**rint **w**orking **d**irectory. |
| `ls` | Lists files and directories in the current (or given) directory. | See what's here — the most basic way to explore the file system. | **l**i**s**t. |
| `ls -la` | Lists *all* files (including hidden `.` files) in *long* format (permissions, owner, size, date). | Get the full picture — hidden files, permissions, sizes. | `-l` = **long** listing; `-a` = **all** (include hidden). |
| `cd <path>` | Changes the current directory to `<path>`. | Move around the file system. | **c**hange **d**irectory. |
| `cd ..` | Go up one level (parent directory). | Navigate backwards. | `..` is the universal shorthand for *parent directory* in Unix. |
| `cd ~` | Go to your home directory. | Quick shortcut home. | `~` (tilde) is a shell alias for `$HOME`. Chosen in early Unix because it was on a convenient key. |
| `mkdir <dir>` | Creates a new directory. | Organize files into folders. | **m**a**k**e **dir**ectory. |
| `mkdir -p a/b/c` | Creates nested directories, including any missing parents. | Build a deep folder structure in one command. | `-p` = **parents** — create parent directories as needed. |
| `rmdir <dir>` | Removes an *empty* directory. | Clean up empty folders safely (won't delete if contents exist). | **r**e**m**ove **dir**ectory. |
| `touch <file>` | Creates an empty file, or updates the timestamp if it already exists. | Quickly create placeholder files or refresh timestamps. | You *touch* the file — originally meant to update its access/modification time. |

### File Operations

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `cp <src> <dest>` | Copies a file or directory. | Duplicate files. | **c**o**p**y. |
| `cp -r <src> <dest>` | Copies a directory *recursively* (all contents). | Duplicate an entire folder tree. | `-r` = **recursive**. |
| `mv <src> <dest>` | Moves (or renames) a file or directory. | Relocate or rename. | **m**o**v**e. |
| `rm <file>` | Deletes a file permanently. | Remove files you no longer need. | **r**e**m**ove. |
| `rm -rf <dir>` | Deletes a directory and all its contents, no prompts. | Nuclear option — wipe an entire tree. Use with extreme caution. | `-r` = **recursive**; `-f` = **force** (no confirmation). |
| `cat <file>` | Prints the entire file content to the terminal. | Quick peek at small files. | **cat**enate — originally designed to con**cat**enate multiple files together. |
| `less <file>` | Opens the file in a scrollable viewer. | Read large files page by page without flooding the terminal. | Named as a joke on `more` (an older pager) — *"less is more"*. |
| `head -n 20 <file>` | Shows the first 20 lines of a file. | Quickly preview the beginning. | **head** — the *head* (top) of the file. |
| `tail -n 20 <file>` | Shows the last 20 lines. | Check the end — great for logs. | **tail** — the *tail* (bottom) of the file. |
| `tail -f <file>` | Continuously streams new lines appended to a file. | Monitor live logs in real time. | `-f` = **follow**. |

### Search & Filter

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `grep <pattern> <file>` | Searches for lines matching a pattern. | Find specific text in files. | **g**lobal **r**egular **e**xpression **p**rint — from the `ed` editor command `g/re/p`. |
| `grep -r <pattern> <dir>` | Searches recursively through directories. | Find text across an entire codebase. | `-r` = **recursive**. |
| `grep -i <pattern>` | Case-insensitive search. | Match regardless of upper/lower case. | `-i` = **ignore** case. |
| `find <path> -name "*.log"` | Finds files by name pattern. | Locate files anywhere in the tree. | **find** — you are *finding* files. |
| `wc -l <file>` | Counts the number of lines in a file. | Quick metrics on file size. | **w**ord **c**ount; `-l` = **lines**. |
| `sort <file>` | Sorts lines alphabetically. | Order data for analysis or deduplication. | **sort** — *sorts* lines. |
| `uniq` | Removes adjacent duplicate lines (use after `sort`). | Deduplicate sorted data. | **uniq**ue — keeps only *unique* lines. |
| `awk '{print $1}'` | A pattern-scanning language; here prints the first column. | Extract and transform structured text. | Named after its creators: **A**ho, **W**einberger, **K**ernighan. |
| `sed 's/old/new/g'` | Stream editor — performs find-and-replace on text streams. | Batch text transformations in scripts. | **s**tream **ed**itor. |

### Permissions & Ownership

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `chmod 755 <file>` | Changes file permissions (here: owner rwx, group r-x, others r-x). | Control who can read/write/execute a file. | **ch**ange **mod**e — the file's permission *mode*. |
| `chmod +x <file>` | Adds execute permission. | Make a script runnable. | `+x` = add e**x**ecute. |
| `chown user:group <file>` | Changes the owner and group of a file. | Transfer ownership or fix permission issues. | **ch**ange **own**er. |
| `sudo <command>` | Runs a command as the superuser (root). | Perform administrative tasks that need elevated privileges. | **s**uper **u**ser **do** — "*do* this as the *super user*." |

### Process & System

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `ps aux` | Lists all running processes with details. | See what's consuming resources. | **p**rocess **s**tatus. `a` = all users, `u` = user-oriented format, `x` = include processes without a terminal. |
| `top` | Real-time view of system resource usage. | Monitor CPU/memory like a task manager. | Shows the *top* resource-consuming processes. |
| `kill <PID>` | Sends a signal (default SIGTERM) to a process. | Gracefully stop a misbehaving process. | **kill** — you *kill* (terminate) the process. |
| `kill -9 <PID>` | Sends SIGKILL — forces immediate termination. | Last resort when a process ignores SIGTERM. | Signal **9** = SIGKILL. Cannot be caught or ignored. |
| `df -h` | Shows disk space usage for all mounted filesystems. | Check if you're running out of disk. | **d**isk **f**ree; `-h` = **human**-readable (KB, MB, GB). |
| `du -sh <dir>` | Shows total size of a directory. | Find out how much space a folder uses. | **d**isk **u**sage; `-s` = **summary**, `-h` = **human**-readable. |
| `free -h` | Displays memory (RAM) usage. | Check available memory. | **free** — shows *free* (and used) memory. |
| `uname -a` | Prints system information (kernel, hostname, architecture). | Identify the OS and kernel version. | **u**nix **name** — prints the *name* and info of the Unix system. |

### Networking

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `ping <host>` | Sends ICMP echo packets to test connectivity. | "Is this server reachable?" | Named after **sonar ping** — you send a signal and listen for the echo. |
| `curl <url>` | Transfers data from or to a URL. | Test APIs, download files. | **c**lient for **URL**s. |
| `wget <url>` | Downloads a file from the web. | Fetch files non-interactively. | **w**eb **get**. |
| `ssh user@host` | Opens a secure remote shell session. | Manage remote servers. | **S**ecure **Sh**ell — an encrypted replacement for `telnet`/`rsh`. |
| `scp <src> user@host:<dest>` | Copies files over SSH. | Transfer files to/from remote machines securely. | **s**ecure **c**o**p**y. |
| `netstat -tuln` | Lists listening ports and network connections. | See which services are running and on what ports. | **net**work **stat**istics. |

### Piping & Redirection

| Symbol | What It Does | Why You Need It | Why That Name? |
|--------|-------------|-----------------|----------------|
| `\|` (pipe) | Sends the output of one command as input to another. | Chain commands together for powerful one-liners. | Visualizes a *pipe* — data flows through it from left to right. |
| `>` | Redirects output to a file (overwrites). | Save command output. | The arrow points *toward* the file — output goes *into* it. |
| `>>` | Redirects output to a file (appends). | Add to a file without losing existing content. | Double arrow = *append* (goes further into the file). |
| `2>&1` | Redirects stderr (2) to wherever stdout (1) goes. | Capture both normal output and errors in one place. | File descriptor **2** (stderr) is redirected **&** to file descriptor **1** (stdout). |

---

## 3. Git

**What is Git?** Git is a distributed version control system. Linus Torvalds named it *Git* — British slang for **"an unpleasant person"** — as a self-deprecating joke. He said: *"I'm an egotistical bastard, so I name all my projects after myself."*

### Setup & Config

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git init` | Creates a new empty Git repository in the current directory. | Start tracking a project with version control. | **init**ialize — you *initialize* a new repo. |
| `git clone <url>` | Downloads an entire repository (all history + branches) from a remote. | Get a copy of someone else's project to work on. | **clone** — you make an exact *clone* (copy) of the repository. |
| `git config --global user.name "Name"` | Sets your name for all commits. | Git needs to know *who* made each commit. | **config**uration — you *configure* Git settings. |
| `git config --global user.email "email"` | Sets your email for all commits. | Associates your identity with your work. | Same as above. |

### Daily Workflow (The Big 5)

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git status` | Shows which files are modified, staged, or untracked. | The dashboard — see the current state before doing anything. | **status** — the *status* of your working directory. |
| `git add <file>` | Stages changes (moves them to the "staging area" / index). | Choose *exactly* what goes into your next commit. | **add** — you *add* changes to the staging area. |
| `git add .` | Stages *all* changes in the current directory. | Quick way to stage everything. | `.` means *current directory* in Unix. |
| `git commit -m "message"` | Records the staged changes as a new snapshot in history. | Save a permanent checkpoint you can always return to. | **commit** — you *commit* (permanently record) the changes. `-m` = **message**. |
| `git push origin <branch>` | Uploads local commits to the remote repository. | Share your work with the team. | **push** — you *push* commits from local to remote. **origin** is the default name for the remote (where the repo *originated*). |
| `git pull origin <branch>` | Downloads remote changes and merges them into your branch. | Stay up to date with what others have pushed. | **pull** — you *pull* changes from remote to local. |

### Branching

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git branch` | Lists all local branches. | See what branches exist. | **branch** — a *branch* is a parallel line of development, like a tree branch. |
| `git branch <name>` | Creates a new branch. | Start a new feature or fix without touching `main`. | You create a new *branch*. |
| `git checkout <branch>` | Switches to an existing branch. | Move between different lines of work. | **checkout** — borrowed from library terminology: you *check out* a branch to work on it. |
| `git checkout -b <branch>` | Creates a new branch *and* switches to it in one step. | Shortcut for `branch` + `checkout`. | `-b` = create **b**ranch. |
| `git switch <branch>` | (Modern) switches to a branch. | Cleaner alternative to `checkout` for switching. | **switch** — you *switch* branches. Introduced because `checkout` was overloaded with too many meanings. |
| `git merge <branch>` | Merges the given branch into your current branch. | Combine completed feature work back into `main`. | **merge** — you *merge* two histories together. |
| `git rebase <branch>` | Replays your commits on top of another branch's tip. | Keep a linear, clean history. | **rebase** — you change the *base* commit of your branch. |
| `git branch -d <branch>` | Deletes a branch (safe — only if merged). | Clean up after a feature is done. | `-d` = **delete**. |

### Inspection & History

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git log` | Shows the commit history. | Review what happened and when. | **log** — a chronological *log* of events. |
| `git log --oneline` | Compact one-line-per-commit view. | Quick overview without clutter. | Each commit on *one line*. |
| `git diff` | Shows unstaged changes (working directory vs. index). | See exactly what you've modified before staging. | **diff**erence — shows the *difference* between two states. |
| `git diff --staged` | Shows staged changes (index vs. last commit). | Review what will go into the next commit. | `--staged` = look at the *staging area*. |
| `git show <commit>` | Displays the details and diff of a specific commit. | Inspect a particular change. | **show** — *show* me this commit. |
| `git blame <file>` | Shows who last modified each line and when. | Find out *who* introduced a specific line (for context, not actual blame!). | **blame** — humorously, *blame* someone for each line. |

### Undoing Things

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git restore <file>` | Discards working directory changes (reverts to last staged/committed version). | Undo edits you don't want. | **restore** — *restore* the file to its previous state. |
| `git restore --staged <file>` | Unstages a file (opposite of `git add`). | Oops — I didn't mean to stage that. | Removes the file from the *staged* area. |
| `git reset --soft HEAD~1` | Undoes the last commit but keeps changes staged. | "I want to re-do that commit message or add more files." | **reset** — *resets* the branch pointer. `--soft` keeps the index (staging area) intact. `HEAD~1` = one commit before HEAD. |
| `git reset --hard HEAD~1` | Undoes the last commit *and* discards all changes. | Nuclear undo — erase the commit and its changes. | `--hard` = *hard* reset — wipes working directory too. |
| `git stash` | Temporarily shelves uncommitted changes. | Switch branches without committing half-done work. | **stash** — *stash away* your changes for later. |
| `git stash pop` | Restores the most recently stashed changes. | Get your stashed work back. | **pop** — *pops* the top item off the stash stack (like a stack data structure). |

### Remote Operations

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `git remote -v` | Lists remote repositories and their URLs. | See where `push` and `pull` go. | **remote** — the *remote* server; `-v` = **verbose** (show URLs). |
| `git fetch origin` | Downloads objects and refs from the remote *without* merging. | See what's new on the remote before deciding to merge. | **fetch** — *fetch* (retrieve) data from the remote. |
| `git remote add origin <url>` | Connects a local repo to a remote URL. | First-time setup after `git init`. | You *add* a *remote* named **origin**. |

---

## 4. Docker

**What is Docker?** Docker is a platform for building, running, and shipping applications inside lightweight containers. The name *Docker* comes from **dock worker** — someone who loads and unloads shipping containers. Docker "loads" your app into a container and ships it anywhere.

### Image Commands

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `docker build -t myapp:1.0 .` | Builds an image from a `Dockerfile` in the current directory. | Create a portable, reproducible snapshot of your application and its environment. | **build** — you *build* an image. `-t` = **tag** (give it a name). |
| `docker images` | Lists all locally stored images. | See what images you have available. | Lists your *images*. |
| `docker pull <image>` | Downloads an image from a registry (Docker Hub by default). | Get a pre-built image (e.g., `nginx`, `postgres`). | **pull** — *pull* an image from the remote registry to your machine (same metaphor as Git). |
| `docker push <image>` | Uploads an image to a registry. | Share your image with others or deploy to production. | **push** — *push* an image from your machine to the remote registry. |
| `docker rmi <image>` | Removes (deletes) an image. | Reclaim disk space. | **r**e**m**ove **i**mage. |
| `docker tag <src> <dest>` | Creates a new tag (alias) for an existing image. | Rename or version an image before pushing. | **tag** — you *tag* (label) an image. |

### Container Lifecycle

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `docker run <image>` | Creates a new container from an image and starts it. | The primary way to launch a containerized application. | **run** — *run* (create + start) a container. |
| `docker run -d <image>` | Runs a container in **detached** mode (background). | Don't tie up your terminal. | `-d` = **detached**. |
| `docker run -it <image> bash` | Runs interactively with a TTY — drops you into a shell. | Explore inside a container, debug issues. | `-i` = **interactive** (keep STDIN open); `-t` = allocate a pseudo-**TTY** (terminal). |
| `docker run -p 8080:80 <image>` | Maps host port 8080 to container port 80. | Access the containerized app from your browser. | `-p` = **publish** a port. |
| `docker run -v /host:/container <image>` | Mounts a host directory into the container. | Persist data or share files between host and container. | `-v` = **volume**. |
| `docker run --name myapp <image>` | Gives the container a human-friendly name. | Refer to it by name instead of a random ID. | `--name` — you *name* the container. |
| `docker run --rm <image>` | Automatically removes the container when it exits. | Keep things tidy — no leftover stopped containers. | `--rm` = **remove** after exit. |
| `docker run -e KEY=VALUE <image>` | Sets an environment variable inside the container. | Pass configuration (DB credentials, API keys, etc.). | `-e` = **environment** variable. |
| `docker ps` | Lists running containers. | See what's currently active. | **p**rocess **s**tatus — borrowed from the Linux `ps` command. |
| `docker ps -a` | Lists *all* containers (including stopped). | Find containers that exited or failed. | `-a` = **all**. |
| `docker stop <container>` | Gracefully stops a running container (SIGTERM, then SIGKILL). | Shut down an app cleanly. | **stop** — *stop* the container. |
| `docker start <container>` | Starts a previously stopped container. | Resume without re-creating. | **start** — *start* it again. |
| `docker restart <container>` | Stops and then starts a container. | Quick way to apply config changes or fix stuck processes. | **restart** — *restart* = stop + start. |
| `docker rm <container>` | Deletes a stopped container. | Clean up finished containers. | **r**e**m**ove. |
| `docker exec -it <container> bash` | Runs a command inside an *already running* container. | Debug or inspect a live container. | **exec**ute — *execute* a command inside the container. |
| `docker logs <container>` | Shows stdout/stderr output from a container. | Debug application issues. | **logs** — view the container's *logs*. |
| `docker logs -f <container>` | Follows (streams) logs in real time. | Monitor a running app. | `-f` = **follow** (same as `tail -f`). |
| `docker inspect <container>` | Shows detailed JSON metadata about a container or image. | Deep debugging — network settings, mounts, env vars. | **inspect** — *inspect* every detail. |

### Docker Compose

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `docker compose up` | Starts all services defined in `docker-compose.yml`. | Launch a multi-container app (e.g., web + DB + cache) in one command. | **compose** = orchestrate multiple containers; **up** = bring them *up* (start). |
| `docker compose up -d` | Starts services in the background. | Don't block the terminal. | `-d` = **detached**. |
| `docker compose down` | Stops and removes all containers, networks created by `up`. | Tear down the whole stack cleanly. | **down** — the opposite of *up*. |
| `docker compose ps` | Lists containers managed by Compose. | Quick status check. | Same as `docker ps`, scoped to Compose. |
| `docker compose logs` | Shows combined logs from all services. | Unified log view. | Same as `docker logs`, for all services. |
| `docker compose build` | Builds images for services that have a `build:` directive. | Rebuild after code changes. | **build** the images for the composed services. |

### Cleanup Commands

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `docker system prune` | Removes stopped containers, unused networks, dangling images, and build cache. | Reclaim disk space in one sweep. | **prune** — *prune* (trim) unused objects, like pruning a tree. |
| `docker volume prune` | Removes unused volumes. | Free up space from old data volumes. | *Prune* unused *volumes*. |

---

## 5. Terraform

**What is Terraform?** Terraform is an Infrastructure-as-Code (IaC) tool by HashiCorp. It lets you define cloud resources (servers, databases, networks) in configuration files and manages their lifecycle. The name *Terraform* means **"to shape the earth"** (Latin *terra* = earth + *form* = shape) — you are literally *shaping your infrastructure* through code.

### Core Workflow (The Big 4)

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `terraform init` | Initializes the working directory — downloads provider plugins and sets up the backend. | Must run first; sets up everything Terraform needs. | **init**ialize — prepare the environment. |
| `terraform plan` | Creates an execution plan — shows what Terraform *will* do without actually doing it. | Preview changes before applying them. Catch mistakes. | **plan** — see the *plan* of action before executing. |
| `terraform apply` | Executes the plan — creates, updates, or destroys resources to match your config. | Actually make the infrastructure changes. | **apply** — *apply* the desired state to real infrastructure. |
| `terraform destroy` | Destroys all resources managed by this Terraform configuration. | Tear down infrastructure (e.g., dev environments, cleanup). | **destroy** — *destroy* (delete) the resources. |

### State Management

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `terraform state list` | Lists all resources tracked in the state file. | See what Terraform is managing. | **state list** — *list* everything in the *state* file. |
| `terraform state show <resource>` | Shows details of a specific resource in state. | Inspect a resource's current attributes. | **state show** — *show* a resource from *state*. |
| `terraform state mv <src> <dest>` | Renames or moves a resource in state (without destroying/recreating). | Refactor your config without downtime. | **state mv** = *move* in *state* (like `mv` in Linux). |
| `terraform state rm <resource>` | Removes a resource from state (Terraform "forgets" it, but the real resource remains). | Stop managing a resource without destroying it. | **state rm** = *remove* from *state*. |
| `terraform state pull` | Outputs the current state as JSON. | Inspect or debug the raw state. | **state pull** — *pull* the state contents. |

### Inspection & Debugging

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `terraform validate` | Checks `.tf` files for syntax and internal consistency errors. | Catch config mistakes before `plan`. | **validate** — *validate* the configuration is correct. |
| `terraform fmt` | Formats `.tf` files to the canonical style. | Consistent formatting across the team. | **fmt** = **f**or**m**a**t**. |
| `terraform output` | Displays the values of output variables after `apply`. | Get information from your infra (e.g., the IP of a new server). | **output** — print the defined *outputs*. |
| `terraform show` | Renders the state or a plan file in human-readable form. | Review what exists or what will change. | **show** — *show* me the state/plan. |
| `terraform graph` | Generates a dependency graph in DOT format. | Visualize which resources depend on which. | **graph** — produces a *graph* of resource dependencies. |
| `terraform console` | Opens an interactive console for evaluating expressions. | Test interpolations, functions, and variable values. | **console** — an interactive *console* (REPL). |

### Workspace Management

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `terraform workspace list` | Lists all workspaces. | See available environments (dev, staging, prod). | **workspace list** — *list* all *workspaces*. |
| `terraform workspace new <name>` | Creates a new workspace. | Separate state for different environments. | **workspace new** — create a *new workspace*. |
| `terraform workspace select <name>` | Switches to a different workspace. | Work on a different environment's infrastructure. | **workspace select** — *select* which workspace to use. |

### Import & Taint

| Command | What It Does | Why You Need It | Why That Name? |
|---------|-------------|-----------------|----------------|
| `terraform import <resource> <id>` | Brings an existing real-world resource under Terraform management. | Start managing infrastructure that was created manually. | **import** — *import* an existing resource into state. |
| `terraform taint <resource>` | Marks a resource for destruction and recreation on next `apply`. | Force a resource to be rebuilt (e.g., after manual corruption). | **taint** — the resource is *tainted* (marked as damaged/suspect). |
| `terraform untaint <resource>` | Removes the taint mark. | Oops — that resource is actually fine. | **untaint** — remove the *taint*. |

### Useful Flags (Work with Most Commands)

| Flag | What It Does | Why You Need It | Why That Name? |
|------|-------------|-----------------|----------------|
| `-auto-approve` | Skips the interactive "yes" confirmation prompt. | Automate in CI/CD pipelines. | **auto-approve** — automatically *approve* the action. |
| `-var "key=value"` | Passes a variable value on the command line. | Override defaults without editing files. | **var**iable. |
| `-var-file="file.tfvars"` | Loads variables from a file. | Manage environment-specific values in files. | **var**iable **file**. |
| `-target=<resource>` | Applies changes only to a specific resource. | Surgical updates — change one thing without touching everything. | **target** — *target* a specific resource. |
| `-parallelism=N` | Limits the number of concurrent operations. | Control resource usage / avoid API rate limits. | **parallelism** — how many operations run in *parallel*. |

---

## Quick Comparison: Command Name Origins

| Tool | Naming Philosophy | Examples |
|------|------------------|----------|
| **Maven** | Uses meaningful English phase names ordered by the build lifecycle. | `compile`, `test`, `package`, `install`, `deploy` |
| **Linux** | Terse abbreviations — early terminals had slow connections, so short commands saved time. | `ls`, `cd`, `mv`, `rm`, `grep`, `awk`, `sed` |
| **Git** | Mix of practical verbs and metaphors (branch, merge, stash). Some humor (blame, cherry-pick). | `commit`, `push`, `pull`, `branch`, `stash`, `blame` |
| **Docker** | Shipping container metaphor — images, containers, registries, volumes, compose. | `build`, `run`, `pull`, `push`, `compose`, `prune` |
| **Terraform** | Declarative infrastructure language — commands describe *what you want to do* to the infrastructure. | `init`, `plan`, `apply`, `destroy`, `import`, `taint` |

---

> **Tip:** Print this cheat sheet or bookmark it. The fastest way to learn commands is to understand *why* they're named the way they are — once the name clicks, the command sticks.
