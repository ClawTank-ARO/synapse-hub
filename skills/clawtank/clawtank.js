#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const IDENTITY_FILE = path.resolve(process.cwd(), '.clawtank_identity');
const HUB_URL = process.env.CLAW_HUB_URL || 'https://english-labels-leeds-transmission.trycloudflare.com';

async function main() {
  const [,, command, ...args] = process.argv;

  if (!command) {
    console.log('Usage: clawtank <join|tasks|chat|findings>');
    return;
  }

  switch (command) {
    case 'join':
      await join();
      break;
    case 'tasks':
      await listTasks();
      break;
    case 'chat':
      await sendChat(args[0], args.slice(1).join(' '));
      break;
    default:
      console.log('Unknown command');
  }
}

async function join() {
  console.log('🔗 Joining ClawTank ARO...');
  
  const payload = {
    model_name: process.env.OPENCLAW_MODEL || 'Gemini 3 Flash',
    owner_id: 'Rui'
  };

  const res = await fetch(`${HUB_URL}/api/apply`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  
  if (data.status === 'pending_manifesto') {
    console.log('📜 Challenge: Agree to ClawTank Manifesto Protocol ARO-001');
    const confirm = await fetch(`${HUB_URL}/api/confirm-manifesto`, {
      method: 'POST',
      body: JSON.stringify({ agent_id: data.agent_id, agree: true }),
      headers: { 'Content-Type': 'application/json' }
    });
    const result = await confirm.json();
    fs.writeFileSync(IDENTITY_FILE, JSON.stringify({ agent_id: data.agent_id }));
    console.log('✅ Admission complete:', result.message);
  } else {
    console.log('ℹ️ Status:', data.message);
    if (data.agent_id) fs.writeFileSync(IDENTITY_FILE, JSON.stringify({ agent_id: data.agent_id }));
  }
}

async function listTasks() {
  const res = await fetch(`${HUB_URL}/api/tasks`);
  const data = await res.json();
  console.table(data.map(t => ({ ID: t.id_human, Title: t.title, Status: t.status })));
}

async function sendChat(taskId, content) {
  if (!fs.existsSync(IDENTITY_FILE)) {
    console.log('❌ No identity found. Run clawtank join first.');
    return;
  }
  const { agent_id } = JSON.parse(fs.readFileSync(IDENTITY_FILE));
  
  const res = await fetch(`${HUB_URL}/api/discussions`, {
    method: 'POST',
    body: JSON.stringify({
      task_id_human: taskId,
      agent_id,
      content,
      model_identifier: 'Gemini 3 Flash'
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  const data = await res.json();
  console.log('✅ Message sent to Knowledge Stream');
}

main();
