const endpoint = process.env.PULSECARE_CDP_ENDPOINT ?? "http://127.0.0.1:9223";
const email = process.env.PULSECARE_TEST_EMAIL;
const password = process.env.PULSECARE_TEST_PASSWORD;

if (!email || !password) {
  throw new Error("PULSECARE_TEST_EMAIL and PULSECARE_TEST_PASSWORD are required.");
}

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const targets = await fetch(`${endpoint}/json`).then((response) => response.json());
const target = targets.find((candidate) => candidate.type === "page");

if (!target?.webSocketDebuggerUrl) {
  throw new Error("No Chrome page target is available.");
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function send(method, params = {}) {
  commandId += 1;
  const id = commandId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text);
  }
  return result.result.value;
}

await send("Runtime.enable");
const initialPath = await evaluate("location.pathname");
if (initialPath === "/login") {
  await evaluate(`(() => {
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setValue.call(emailInput, ${JSON.stringify(email)});
    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    setValue.call(passwordInput, ${JSON.stringify(password)});
    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('form').requestSubmit();
  })()`);
  await delay(8000);
}

const loginResult = await evaluate(`({
  path: location.pathname,
  error: document.querySelector('[role="alert"]')?.textContent?.trim() ?? null,
  renderer: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Renderer')?.nextElementSibling?.textContent ?? null,
  fps: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Images/s')?.nextElementSibling?.textContent ?? null,
  tier: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Quality tier')?.nextElementSibling?.textContent ?? null,
})`);

if (loginResult.path !== "/dashboard") {
  console.log(JSON.stringify({ login: loginResult, navigation: null, logout: null }));
  socket.close();
  process.exit(1);
}

await evaluate(`(() => {
  window.__pulseCareCanvas = document.querySelector('canvas');
  document.querySelector('a[href="/patient/PATIENT-001"]').click();
})()`);
await delay(4000);

const navigationResult = await evaluate(`({
  path: location.pathname,
  sameCanvas: window.__pulseCareCanvas === document.querySelector('canvas'),
  renderer: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Renderer')?.nextElementSibling?.textContent ?? null,
  fps: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Images/s')?.nextElementSibling?.textContent ?? null,
  tier: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Quality tier')?.nextElementSibling?.textContent ?? null,
})`);

const monitoringResult = await evaluate(`(async () => {
  const ids = ['PATIENT-001', 'PATIENT-002', 'PATIENT-003', 'PATIENT-004'];
  const results = [];
  for (const id of ids) {
    const response = await fetch('/api/monitoring/patient/' + id, { cache: 'no-store' });
    const body = await response.json();
    const measurementIds = body.measurements?.map((item) => item.measurement_id) ?? [];
    results.push({
      id,
      status: response.status,
      currentPatient: body.current?.patient_id ?? null,
      mixedMeasurements: body.measurements?.some((item) => item.patient_id !== id) ?? false,
      mixedAlerts: body.alerts?.some((item) => item.patient_id !== id) ?? false,
      duplicateMeasurements: new Set(measurementIds).size !== measurementIds.length,
      measurementCount: body.measurements?.length ?? 0,
      alertCount: body.alerts?.length ?? 0,
      medicalRecordPatient: body.medicalRecord?.patient_id ?? null,
      freshness: body.meta?.freshness ?? null,
    });
  }
  const invalidStatus = (await fetch('/api/monitoring/patient/PATIENT-999')).status;
  return { results, invalidStatus };
})()`);

const pollingBefore = await evaluate(`document.querySelector('[class*="statusLine"]')?.textContent ?? null`);
await delay(6500);
const pollingAfter = await evaluate(`document.querySelector('[class*="statusLine"]')?.textContent ?? null`);
const settledCanvas = await evaluate(`({
  renderer: document.querySelector('[data-canvas-renderer]')?.getAttribute('data-canvas-renderer') ?? null,
  fps: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Images/s')?.nextElementSibling?.textContent ?? null,
  tier: [...document.querySelectorAll('dt')].find((node) => node.textContent === 'Qualité')?.nextElementSibling?.textContent ?? null,
})`);
const pollingResult = {
  before: pollingBefore,
  after: pollingAfter,
  updated: pollingBefore !== pollingAfter,
  settledCanvas,
};

await evaluate(`document.querySelector('button[type="submit"]').click()`);
await delay(4000);
const logoutResult = await evaluate(`({ path: location.pathname })`);

console.log(JSON.stringify({ login: loginResult, navigation: navigationResult, monitoring: monitoringResult, polling: pollingResult, logout: logoutResult }));
socket.close();
