/**
 * Mock Judge0 — drop-in stand-in for the real Judge0 API on machines where
 * the real one won't run (e.g. macOS Docker Desktop with broken cgroups).
 *
 * Speaks just enough of the Judge0 v1.13.x HTTP contract for our worker:
 *
 *   POST /submissions?base64_encoded=false&wait=false
 *     body: { source_code, language_id, stdin?, expected_output?, ... }
 *     → 201 { "token": "<uuid>" }
 *
 *   GET  /submissions/:token?base64_encoded=false&fields=*
 *     → 200 { token, status:{id,description}, stdout, stderr, compile_output,
 *             message, time, memory }
 *
 * Execution is real (not mocked):
 *   - PYTHON (71): `python3 -c "<source>"`
 *   - C      (50): write file → gcc → run binary
 *   - CPP    (54): write file → g++ → run binary
 *
 * Verdict logic mirrors Judge0:
 *   - compiler exit != 0           → status 6 (Compile Error)
 *   - timed out                    → status 5 (Time Limit Exceeded)
 *   - run exit != 0                → status 11 (Runtime Error - Other)
 *   - stdout != expected_output    → status 4 (Wrong Answer)
 *   - otherwise                    → status 3 (Accepted)
 *
 * Run:  npm run mock-judge0   (uses PORT env, default 2358)
 */
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { join } from "node:path";

const PORT = Number(process.env.MOCK_JUDGE0_PORT || 2358);

interface Result {
  token: string;
  status: { id: number; description: string };
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;   // seconds, like real Judge0
  memory: number | null; // KB
}

const results = new Map<string, Result>();

const STATUS = {
  AC: { id: 3, description: "Accepted" },
  WA: { id: 4, description: "Wrong Answer" },
  TLE: { id: 5, description: "Time Limit Exceeded" },
  CE: { id: 6, description: "Compilation Error" },
  RE: { id: 11, description: "Runtime Error (Other)" },
};

function trimTrailingNewlines(s: string): string {
  return s.replace(/\s+$/u, "");
}

function compareOutput(actual: string, expected: string | undefined): boolean {
  if (expected === undefined) return true; // can't verify; mark AC
  return trimTrailingNewlines(actual) === trimTrailingNewlines(expected);
}

interface RunOutcome {
  stdout: string;
  stderr: string;
  exitCode: number;
  timedOut: boolean;
  timeSec: number;
  memoryKb: number | null;
}

function runProcess(
  cmd: string,
  args: string[],
  opts: { stdin?: string; timeoutMs: number; cwd?: string }
): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(cmd, args, { cwd: opts.cwd });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const killer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, opts.timeoutMs);

    child.stdout.on("data", (b) => (stdout += b.toString()));
    child.stderr.on("data", (b) => (stderr += b.toString()));

    if (opts.stdin !== undefined) {
      child.stdin.write(opts.stdin);
      child.stdin.end();
    }

    child.on("close", (code) => {
      clearTimeout(killer);
      const timeSec = (Date.now() - started) / 1000;
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 1,
        timedOut,
        timeSec,
        memoryKb: null, // we don't measure; Judge0 normally would
      });
    });

    child.on("error", (err) => {
      clearTimeout(killer);
      resolve({
        stdout: "",
        stderr: String(err),
        exitCode: 127,
        timedOut: false,
        timeSec: (Date.now() - started) / 1000,
        memoryKb: null,
      });
    });
  });
}

async function executeSubmission(payload: {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number; // seconds
}): Promise<Omit<Result, "token">> {
  const timeoutMs = Math.max(1, payload.cpu_time_limit ?? 5) * 1000;

  // ----- PYTHON -----
  if (payload.language_id === 71) {
    const r = await runProcess(
      "python3",
      ["-c", payload.source_code],
      { stdin: payload.stdin, timeoutMs }
    );
    if (r.timedOut) {
      return {
        status: STATUS.TLE,
        stdout: r.stdout || null,
        stderr: r.stderr || null,
        compile_output: null,
        message: "Time limit exceeded",
        time: r.timeSec.toFixed(3),
        memory: r.memoryKb,
      };
    }
    if (r.exitCode !== 0) {
      return {
        status: STATUS.RE,
        stdout: r.stdout || null,
        stderr: r.stderr || null,
        compile_output: null,
        message: r.stderr || `exit ${r.exitCode}`,
        time: r.timeSec.toFixed(3),
        memory: r.memoryKb,
      };
    }
    const ac = compareOutput(r.stdout, payload.expected_output);
    return {
      status: ac ? STATUS.AC : STATUS.WA,
      stdout: r.stdout,
      stderr: r.stderr || null,
      compile_output: null,
      message: null,
      time: r.timeSec.toFixed(3),
      memory: r.memoryKb,
    };
  }

  // ----- C / C++ -----
  if (payload.language_id === 50 || payload.language_id === 54) {
    const isCpp = payload.language_id === 54;
    const dir = await mkdtemp(join(tmpdir(), "mock-judge0-"));
    try {
      const srcName = isCpp ? "main.cpp" : "main.c";
      const srcPath = join(dir, srcName);
      const binPath = join(dir, "main");
      await writeFile(srcPath, payload.source_code, "utf8");

      const compile = await runProcess(
        isCpp ? "g++" : "gcc",
        [srcPath, "-O2", "-o", binPath],
        { timeoutMs: 15_000 }
      );
      if (compile.exitCode !== 0) {
        return {
          status: STATUS.CE,
          stdout: null,
          stderr: compile.stderr || null,
          compile_output: compile.stderr,
          message: "Compilation failed",
          time: null,
          memory: null,
        };
      }

      const r = await runProcess(binPath, [], {
        stdin: payload.stdin,
        timeoutMs,
      });
      if (r.timedOut) {
        return {
          status: STATUS.TLE,
          stdout: r.stdout || null,
          stderr: r.stderr || null,
          compile_output: null,
          message: "Time limit exceeded",
          time: r.timeSec.toFixed(3),
          memory: r.memoryKb,
        };
      }
      if (r.exitCode !== 0) {
        return {
          status: STATUS.RE,
          stdout: r.stdout || null,
          stderr: r.stderr || null,
          compile_output: null,
          message: r.stderr || `exit ${r.exitCode}`,
          time: r.timeSec.toFixed(3),
          memory: r.memoryKb,
        };
      }
      const ac = compareOutput(r.stdout, payload.expected_output);
      return {
        status: ac ? STATUS.AC : STATUS.WA,
        stdout: r.stdout,
        stderr: r.stderr || null,
        compile_output: null,
        message: null,
        time: r.timeSec.toFixed(3),
        memory: r.memoryKb,
      };
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  // Unknown language → RE
  return {
    status: STATUS.RE,
    stdout: null,
    stderr: null,
    compile_output: null,
    message: `language_id ${payload.language_id} not supported by mock`,
    time: null,
    memory: null,
  };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://localhost:${PORT}`);

    // POST /submissions
    if (req.method === "POST" && url.pathname === "/submissions") {
      const raw = await readBody(req);
      const payload = JSON.parse(raw);
      const token = randomUUID();
      const wait = url.searchParams.get("wait") === "true";

      // Kick off execution; resolve token immediately if wait=false.
      const exec = executeSubmission(payload)
        .then((r) => {
          results.set(token, { token, ...r });
        })
        .catch((e) => {
          results.set(token, {
            token,
            status: STATUS.RE,
            stdout: null,
            stderr: String(e),
            compile_output: null,
            message: String(e),
            time: null,
            memory: null,
          });
        });

      if (wait) {
        await exec;
        return sendJson(res, 201, results.get(token));
      }
      return sendJson(res, 201, { token });
    }

    // GET /submissions/:token
    const m = url.pathname.match(/^\/submissions\/([^/]+)\/?$/);
    if (req.method === "GET" && m) {
      const token = m[1];
      const r = results.get(token);
      if (!r) {
        // Still running — return the "In Queue" status.
        return sendJson(res, 200, {
          token,
          status: { id: 1, description: "In Queue" },
          stdout: null,
          stderr: null,
          compile_output: null,
          message: null,
          time: null,
          memory: null,
        });
      }
      return sendJson(res, 200, r);
    }

    // GET /system_info — keep our existing smoke test happy.
    if (req.method === "GET" && url.pathname === "/system_info") {
      return sendJson(res, 200, {
        mock: true,
        languages_supported: ["PYTHON (71)", "C (50)", "C++ (54)"],
      });
    }

    sendJson(res, 404, { error: "not found", path: url.pathname });
  } catch (e) {
    sendJson(res, 500, { error: String(e) });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[mock-judge0] listening on :${PORT}`);
});
